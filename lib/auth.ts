import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import { getOrCreateUser } from "./users";
import { sql } from "./db";

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutos

/* Último refresh por usuário (por instância do servidor). */
const lastRefresh = new Map<string, number>();

type DiscordMember = {
  user: {
    id: string;
    username: string;
    global_name: string | null;
    avatar: string | null;
  };
};

async function fetchGuildMember(
  discordId: string
): Promise<DiscordMember | null> {
  const guildId = process.env.DISCORD_GUILD_ID;
  const botToken = process.env.DISCORD_BOT_TOKEN;

  if (!guildId || !botToken) {
    console.error("DISCORD_GUILD_ID ou DISCORD_BOT_TOKEN não configurado");
    return null;
  }

  const response = await fetch(
    `https://discord.com/api/v10/guilds/${guildId}/members/${discordId}`,
    {
      headers: { Authorization: `Bot ${botToken}` },
      cache: "no-store",
    }
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    console.error("Erro ao consultar membro do Discord:", response.status);
    return null;
  }

  return response.json();
}

async function isMemberOfGuild(discordId: string) {
  return (await fetchGuildMember(discordId)) !== null;
}

/* Monta a URL do avatar (animado se o hash começar com "a_"). */
function buildAvatarUrl(userId: string, avatarHash: string | null) {
  if (!avatarHash) {
    const index = Number(BigInt(userId) >> BigInt(22)) % 6;
    return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
  }

  const format = avatarHash.startsWith("a_") ? "gif" : "png";

  return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${format}`;
}

/* Atualiza avatar e username no banco com os dados atuais do Discord. */
async function refreshUserFromDiscord(discordId: string) {
  const member = await fetchGuildMember(discordId);

  if (!member) {
    return;
  }

  const avatar = buildAvatarUrl(member.user.id, member.user.avatar);
  const username =
    member.user.username ?? member.user.global_name ?? "Usuário";

  await sql`
    UPDATE users
    SET avatar = ${avatar}, username = ${username}
    WHERE discord_id = ${discordId}
  `;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Discord({
      clientId: process.env.AUTH_ID!,
      clientSecret: process.env.AUTH_SECRET!,
      issuer: "https://discord.com",
    }),
  ],

  callbacks: {
    async signIn({ profile }) {
      if (!profile?.id) {
        return false;
      }

      const discordId = profile.id;

      if (!(await isMemberOfGuild(discordId))) {
        return "/nao-membro";
      }

      await getOrCreateUser({
        discordId,
        username:
          (profile.username as string) ??
          (profile.global_name as string) ??
          "Usuário",
        avatar: (profile.image_url as string) ?? null,
      });

      return true;
    },

    async jwt({ token, profile }) {
      if (profile?.id) {
        token.discordId = profile.id;
        /* No login o signIn já gravou os dados novos. */
        lastRefresh.set(profile.id, Date.now());
      }

      if (!token.discordId) {
        return token;
      }

      const discordId = token.discordId as string;

      /* Atualiza do Discord no máximo a cada 5 minutos. */
      const last = lastRefresh.get(discordId) ?? 0;

      if (Date.now() - last > REFRESH_INTERVAL) {
        /* Marca antes, para falhas não gerarem uma enxurrada de requests. */
        lastRefresh.set(discordId, Date.now());

        try {
          await refreshUserFromDiscord(discordId);
        } catch (error) {
          console.error("Erro ao atualizar avatar do Discord:", error);
        }
      }

      /* O banco é a fonte da verdade (role + avatar). */
      const users = await sql`
        SELECT role, avatar
        FROM users
        WHERE discord_id = ${discordId}
        LIMIT 1
      `;

      token.role = users[0]?.role ?? "USER";
      token.avatar = users[0]?.avatar ?? token.avatar ?? null;

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.discordId as string;
        session.user.role = token.role as "USER" | "ADMIN";
        session.user.image = (token.avatar as string | null) ?? null;
      }

      return session;
    },
  },
});