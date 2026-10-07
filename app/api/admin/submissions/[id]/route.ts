import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";

async function isAdmin() {
  const session = await auth();

  if (!session?.user?.id) {
    return false;
  }

  const users = await sql`
    SELECT role
    FROM users
    WHERE discord_id = ${session.user.id}
    LIMIT 1
  `;

  return users.length > 0 && users[0].role === "ADMIN";
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: "Sem permissão." },
        { status: 403 }
      );
    }

    const { id } = await params;

    const result = await sql`
      DELETE FROM submissions
      WHERE id = ${id}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Submission não encontrada." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Submission removida.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Erro interno." },
      { status: 500 }
    );
  }
}