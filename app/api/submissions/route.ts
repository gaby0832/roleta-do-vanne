import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";

type Midia = {
  id: string;
  title: string;
  type: "filme" | "video";
  poster_path?: string | null;
  author?: string | null;
  youtuber?: string | null;
};

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Você precisa estar logado." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const midia1 = body.midia1 as Midia;
    const midia2 = body.midia2 as Midia;

    if (!midia1 || !midia2) {
      return NextResponse.json(
        { error: "Escolha as duas mídias." },
        { status: 400 }
      );
    }

    if (
      !midia1.id ||
      !midia1.title ||
      !midia1.type ||
      !midia2.id ||
      !midia2.title ||
      !midia2.type
    ) {
      return NextResponse.json(
        { error: "Dados das mídias inválidos." },
        { status: 400 }
      );
    }

    if (
      midia1.id === midia2.id &&
      midia1.type === midia2.type
    ) {
      return NextResponse.json(
        { error: "Você não pode escolher a mesma mídia duas vezes." },
        { status: 400 }
      );
    }

    const users = await sql`
      SELECT id
      FROM users
      WHERE discord_id = ${session.user.id}
      LIMIT 1
    `;

    if (!users.length) {
      return NextResponse.json(
        { error: "Usuário não encontrado." },
        { status: 404 }
      );
    }

    const user = users[0];

    const rounds = await sql`
      SELECT id, type
      FROM rounds
      WHERE status = 'OPEN'
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (!rounds.length) {
      return NextResponse.json(
        { error: "A roleta está fechada." },
        { status: 400 }
      );
    }

    const round = rounds[0];

    if (
      midia1.type !== round.type ||
      midia2.type !== round.type
    ) {
      return NextResponse.json(
        { error: "As mídias não correspondem ao tipo da rodada." },
        { status: 400 }
      );
    }

    const existing = await sql`
      SELECT id
      FROM submissions
      WHERE user_id = ${user.id}
      AND round_id = ${round.id}
      LIMIT 1
    `;

    if (existing.length) {
      return NextResponse.json(
        { error: "Você já enviou uma recomendação nesta rodada." },
        { status: 409 }
      );
    }

    const result = await sql`
      INSERT INTO submissions (
        user_id,
        round_id,

        midia1_id,
        midia1_title,
        midia1_type,
        midia1_poster_path,
        midia1_author,
        midia1_youtuber,

        midia2_id,
        midia2_title,
        midia2_type,
        midia2_poster_path,
        midia2_author,
        midia2_youtuber
      )
      VALUES (
        ${user.id},
        ${round.id},

        ${midia1.id},
        ${midia1.title},
        ${midia1.type},
        ${midia1.poster_path ?? null},
        ${midia1.author ?? null},
        ${midia1.youtuber ?? null},

        ${midia2.id},
        ${midia2.title},
        ${midia2.type},
        ${midia2.poster_path ?? null},
        ${midia2.author ?? null},
        ${midia2.youtuber ?? null}
      )
      RETURNING *
    `;

    return NextResponse.json(
      {
        message: "Submissão enviada com sucesso!",
        submission: result[0],
      },
      { status: 201 }
    );

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Erro interno ao criar submissão." },
      { status: 500 }
    );
  }
}