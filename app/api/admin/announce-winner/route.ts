import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";

function getImageUrl(
  type: "filme" | "video",
  id: string,
  path: string | null
) {
  if (path) {
    if (
      path.startsWith("http://") ||
      path.startsWith("https://")
    ) {
      return path;
    }

    if (type === "filme") {
      return `https://image.tmdb.org/t/p/w500${path}`;
    }
  }

  if (type === "video") {
    return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  }

  return null;
}

export async function POST(request: Request) {
  try {
    /* ================================ */
    /* AUTENTICAÇÃO                     */
    /* ================================ */

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "Não autenticado.",
        },
        {
          status: 401,
        }
      );
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          error: "Sem permissão.",
        },
        {
          status: 403,
        }
      );
    }

    /* ================================ */
    /* WEBHOOK                          */
    /* ================================ */

    const webhookUrl =
      process.env.DISCORD_WINNER_WEBHOOK_URL;

    if (!webhookUrl) {
      console.error(
        "DISCORD_WINNER_WEBHOOK_URL não configurada."
      );

      return NextResponse.json(
        {
          error:
            "Webhook do Discord não configurado.",
        },
        {
          status: 500,
        }
      );
    }

    /* ================================ */
    /* BODY                             */
    /* ================================ */

    const body = await request.json();

    const submissionId = body.submissionId;
    const slot = body.slot;

    if (!submissionId) {
      return NextResponse.json(
        {
          error: "submissionId não informado.",
        },
        {
          status: 400,
        }
      );
    }

    if (slot !== 1 && slot !== 2) {
      return NextResponse.json(
        {
          error: "Slot inválido.",
        },
        {
          status: 400,
        }
      );
    }

    /* ================================ */
    /* BUSCAR SUBMISSION                */
    /* ================================ */

    const result = await sql`
      SELECT
        s.id,
        s.round_id,

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

      WHERE s.id = ${submissionId}

      LIMIT 1
    `;

    if (!result.length) {
      return NextResponse.json(
        {
          error:
            "Submission não encontrada.",
        },
        {
          status: 404,
        }
      );
    }

    const submission = result[0];

    /* ================================ */
    /* ESCOLHER A MÍDIA                 */
    /* ================================ */

    const media =
      slot === 1
        ? {
            id: submission.midia1_id,
            title: submission.midia1_title,
            type: submission.midia1_type,
            posterPath:
              submission.midia1_poster_path,
            author:
              submission.midia1_author,
            youtuber:
              submission.midia1_youtuber,
          }
        : {
            id: submission.midia2_id,
            title: submission.midia2_title,
            type: submission.midia2_type,
            posterPath:
              submission.midia2_poster_path,
            author:
              submission.midia2_author,
            youtuber:
              submission.midia2_youtuber,
          };

    const image = getImageUrl(
      media.type,
      media.id,
      media.posterPath
    );

    /* ================================ */
    /* EMBED DO DISCORD                 */
    /* ================================ */

    const fields = [
      {
        name: "👤 Enviado por",
        value: `**${submission.username}**`,
        inline: true,
      },
      {
        name: "🎬 Tipo",
        value:
          media.type === "filme"
            ? "Filme"
            : "Vídeo",
        inline: true,
      },
    ];

    if (media.author) {
      fields.push({
        name: "✍️ Autor",
        value: media.author,
        inline: true,
      });
    }

    if (media.youtuber) {
      fields.push({
        name: "▶️ YouTube",
        value: media.youtuber,
        inline: true,
      });
    }

    const embed: Record<string, unknown> = {
      title: "🏆 VENCEDOR DA ROLETA!",
      description:
        `A mídia **${media.title}** foi selecionada!`,
      color: 0xffd700,

      fields,

      footer: {
        text: "Roletinha do Vanne",
      },

      timestamp: new Date().toISOString(),
    };

    if (image) {
      embed.thumbnail = {
        url: image,
      };
    }

    if (submission.avatar) {
      embed.author = {
        name: submission.username,
        icon_url: submission.avatar,
      };
    }

    /* ================================ */
    /* ENVIAR PARA DISCORD              */
    /* ================================ */

    const discordResponse = await fetch(
      webhookUrl,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          username: "Roletinha do Vanne",

          embeds: [embed],
        }),
      }
    );

    if (!discordResponse.ok) {
      const errorText =
        await discordResponse.text();

      console.error(
        "Erro do Discord:",
        discordResponse.status,
        errorText
      );

      return NextResponse.json(
        {
          error:
            "Discord recusou o webhook.",
        },
        {
          status: 502,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Vencedor anunciado no Discord.",
    });
  } catch (error) {
    console.error(
      "Erro ao anunciar vencedor:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Erro interno ao anunciar vencedor.",
      },
      {
        status: 500,
      }
    );
  }
}