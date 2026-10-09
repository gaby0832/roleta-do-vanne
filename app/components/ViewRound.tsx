"use client";

import { useEffect, useState } from "react";

type Round = {
  id: string;
  status: "OPEN" | "CLOSED";
  type: "filme" | "video";
};

export default function ViewRound() {
  const [round, setRound] = useState<Round | null>(null);
  const [type, setType] = useState<"filme" | "video">("filme");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  async function loadRound() {
    try {
      const response = await fetch("/api/round", {
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


  if (loading) {
    return (
      <div className="bg-[#23262A] 
      mb-2 rounded-2xl p-6">
        Carregando rodada...
      </div>
    );
  }

  return (
    <div className="
      bg-[#23262A]
      rounded-2xl
      p-6
      mb-2
      border
      border-[#34383d]
    ">

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

        </div>
      ): (
          <div className="flex flex-col gap-5 ">

          <div className="flex justify-between items-center">

            <div>

              <p className="text-gray-400">
                Rodada fechada
              </p>

            </div>

            <span className="
              px-3
              py-1
              rounded-full
              bg-red-500/20
              text-red-400
              text-sm
              font-bold
            ">
              FECHADA
            </span>

          </div>

        </div>
      )}

    </div>
  );
}