"use client";

import { useEffect, useState } from "react";

type Round = {
  id: string;
  status: "OPEN" | "CLOSED";
  type: "filme" | "video";
};

export default function RoundControls() {
  const [round, setRound] = useState<Round | null>(null);
  const [type, setType] = useState<"filme" | "video">("filme");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  async function loadRound() {
    try {
      const response = await fetch("/api/admin/round", {
        cache: "no-store",
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      setRound(data.round ?? null);

    } catch (error) {
      console.error("Erro ao buscar rodada:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRound();
  }, []);

  async function openRound() {
    setActionLoading(true);

    try {
      const response = await fetch("/api/admin/round", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error ?? "Erro ao abrir rodada");
        return;
      }

      setRound(data.round);

    } finally {
      setActionLoading(false);
    }
  }

  async function closeRound() {
    setActionLoading(true);

    try {
      const response = await fetch("/api/admin/round", {
        method: "PATCH",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error ?? "Erro ao fechar rodada");
        return;
      }

      setRound(null);

    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-[#23262A] rounded-2xl p-6">
        Carregando rodada...
      </div>
    );
  }

  return (
    <div className="
      bg-[#23262A]
      rounded-2xl
      p-6
      border
      border-[#34383d]
    ">

      <h2 className="text-2xl font-bold mb-6">
        Controle da rodada
      </h2>


      {round ? (

        <div className="flex flex-col gap-5">

          <div className="flex justify-between items-center">

            <div>

              <p className="text-gray-400">
                Rodada atual
              </p>

              <p className="text-xl font-bold">
                {round.type === "filme"
                  ? "🎬 Filmes"
                  : "▶️ YouTube"}
              </p>

            </div>

            <span className="
              px-3
              py-1
              rounded-full
              bg-green-500/20
              text-green-400
              text-sm
              font-bold
            ">
              ABERTA
            </span>

          </div>


          <button
            type="button"
            onClick={closeRound}
            disabled={actionLoading}
            className="
              w-full
              py-3
              rounded-xl
              bg-red-600
              hover:bg-red-700
              disabled:opacity-50
              font-bold
            "
          >
            {actionLoading
              ? "Fechando..."
              : "Fechar rodada"}
          </button>

        </div>

      ) : (

        <div className="flex flex-col gap-5">

          <p className="text-gray-400">
            Nenhuma rodada aberta.
          </p>


          <div className="grid grid-cols-2 gap-3">

            <button
              type="button"
              onClick={() => setType("filme")}
              className={`
                p-4
                rounded-xl
                border
                font-bold
                ${
                  type === "filme"
                    ? "border-purple-500 bg-purple-500/20"
                    : "border-[#34383d]"
                }
              `}
            >
              🎬 Filmes
            </button>


            <button
              type="button"
              onClick={() => setType("video")}
              className={`
                p-4
                rounded-xl
                border
                font-bold
                ${
                  type === "video"
                    ? "border-purple-500 bg-purple-500/20"
                    : "border-[#34383d]"
                }
              `}
            >
              ▶️ YouTube
            </button>

          </div>


          <button
            type="button"
            onClick={openRound}
            disabled={actionLoading}
            className="
              w-full
              py-3
              rounded-xl
              bg-purple-600
              hover:bg-purple-700
              disabled:opacity-50
              font-bold
            "
          >
            {actionLoading
              ? "Abrindo..."
              : "Abrir rodada"}
          </button>

        </div>

      )}

    </div>
  );
}