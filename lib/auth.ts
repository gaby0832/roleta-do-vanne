import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import { getOrCreateUser } from "./users";
import { sql } from "./db";

async function isMemberOfGuild(discordId: string) {
  const guildId = process.env.DISCORD_GUILD_ID;
  const botToken = process.env.DISCORD_BOT_TOKEN;

  if (!guildId || !botToken) {
    console.error("DISCORD_GUILD_ID ou DISCORD_BOT_TOKEN não configurado");
    return false;
  }

  const response = await fetch(
    `https://discord.com/api/v10/guilds/${guildId}/members/${discordId}`,
    {
      headers: {
        Authorization: `Bot ${botToken}`,
      },
      cache: "no-store",
    }
  );

  if (response.status === 404) {
    return false;
  }

  if (!response.ok) {
    console.error(
      "Erro ao verificar membro do Discord:",
      response.status
    );

    return false;
  }

  return true;
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

      // 1. Verifica se está no servidor
      const isMember = await isMemberOfGuild(discordId);

      if (!isMember) {

        return "/nao-membro";
      }

      // 2. Cria ou atualiza o usuário no Neon

      await getOrCreateUser({
        discordId,
        username: profile.username as string ?? profile.global_name as string ?? "Usuário",
        avatar: profile.image_url as string ?? null,
      });

      // 3. Permite o login
      return true;
    },

    async jwt({ token, profile }) {
      if (profile?.id) {
        token.discordId = profile.id;
      }

      if (token.discordId) {
        const users = await sql`
          SELECT role
          FROM users
          WHERE discord_id = ${token.discordId}
          LIMIT 1
        `;

        token.role = users[0]?.role ?? "USER";
      }

      return token;
    },

  async session({ session, token }) {
    if (session.user) {
      session.user.id = token.discordId as string;
      session.user.role = token.role as "USER" | "ADMIN";
    }

    return session;
  },

  },
});