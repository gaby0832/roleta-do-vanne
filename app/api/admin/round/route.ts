import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";

async function getAdmin() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const users = await sql`
    SELECT id, role
    FROM users
    WHERE discord_id = ${session.user.id}
    LIMIT 1
  `;

  if (!users.length || users[0].role !== "ADMIN") {
    return null;
  }

  return users[0];
}

export async function POST(request: Request) {
  try {
    const admin = await getAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Sem permissão." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const type = body.type;

    if (type !== "filme" && type !== "video") {
      return NextResponse.json(
        { error: "Tipo de rodada inválido." },
        { status: 400 }
      );
    }

    const openRound = await sql`
      SELECT id
      FROM rounds
      WHERE status = 'OPEN'
      LIMIT 1
    `;

    if (openRound.length > 0) {
      return NextResponse.json(
        { error: "Já existe uma rodada aberta." },
        { status: 409 }
      );
    }

    const result = await sql`
      INSERT INTO rounds (
        status,
        type,
        opened_at
      )
      VALUES (
        'OPEN',
        ${type},
        NOW()
      )
      RETURNING *
    `;

    return NextResponse.json(
      {
        message: "Rodada aberta.",
        round: result[0],
      },
      { status: 201 }
    );

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Erro interno." },
      { status: 500 }
    );
  }
}


export async function PATCH() {
  try {
    const admin = await getAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Sem permissão." },
        { status: 403 }
      );
    }

    const result = await sql`
      UPDATE rounds
      SET
        status = 'CLOSED',
        closed_at = NOW()
      WHERE status = 'OPEN'
      RETURNING *
    `;

    if (!result.length) {
      return NextResponse.json(
        { error: "Nenhuma rodada aberta." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Rodada fechada.",
      round: result[0],
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Erro interno." },
      { status: 500 }
    );
  }
}


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