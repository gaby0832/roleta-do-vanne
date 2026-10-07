import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

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

    if (!users.length) {
      return NextResponse.json(
        { error: "Sem permissão." },
        { status: 403 }
      );
    }

    const result = await sql`
      SELECT *
      FROM rounds
      WHERE status = 'OPEN'
      ORDER BY created_at DESC
      LIMIT 1
    `;

    return NextResponse.json({
      round: result[0] ?? null,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Erro interno." },
      { status: 500 }
    );
  }
}