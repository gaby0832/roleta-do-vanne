import { sql } from "./db";

export async function getOrCreateUser({
  discordId,
  username,
  avatar,
}: {
  discordId: string;
  username: string ;
  avatar?: string | null;
}) {
  const result = await sql`
    INSERT INTO users (
      discord_id,
      username,
      avatar
    )
    VALUES (
      ${discordId},
      ${username},
      ${avatar ?? null}
    )
    ON CONFLICT (discord_id)
    DO UPDATE SET
      username = EXCLUDED.username,
      avatar = EXCLUDED.avatar,
      updated_at = NOW()
    RETURNING *
  `;

  return result[0];
}