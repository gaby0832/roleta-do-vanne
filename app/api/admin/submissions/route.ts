import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autenticado." },
        { status: 401 }
      );
    }

    const users = await sql`
      SELECT role
      FROM users
      WHERE discord_id = ${session.user.id}
      LIMIT 1
    `;

    if (!users.length || users[0].role !== "ADMIN") {
      return NextResponse.json(
        { error: "Sem permissão." },
        { status: 403 }
      );
    }

    const submissions = await sql`
      SELECT
        s.id,
        s.round_id,
        s.created_at,

        u.id AS user_id,
        u.username,
        u.avatar,

        s.midia1_id,
        s.midia1_title,
        s.midia1_type,
        s.midia1_poster_path,
        s.midia1_author,
        s.midia1_youtuber,

        s.midia2_id,
        s.midia2_title,
        s.midia2_type,
        s.midia2_poster_path,
        s.midia2_author,
        s.midia2_youtuber

      FROM submissions s

      INNER JOIN users u
        ON u.id = s.user_id

      INNER JOIN rounds r
        ON r.id = s.round_id

      WHERE r.status = 'OPEN'

      ORDER BY s.created_at ASC
    `;

    return NextResponse.json(submissions);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Erro ao buscar submissions." },
      { status: 500 }
    );
  }
}