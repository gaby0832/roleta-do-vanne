"use client";

import { useEffect, useState } from "react";
import Roulette from "./Roulette";
import ParticipantList from "./ParticipantList";
import { Participant } from "./types";

type SubmissionResponse = {
  id: string;

  username: string;
  avatar: string | null;

  midia1_id: string;
  midia1_title: string;
  midia1_type: "filme" | "video";
  midia1_poster_path: string | null;
  midia1_author: string | null;
  midia1_youtuber: string | null;

  midia2_id: string;
  midia2_title: string;
  midia2_type: "filme" | "video";
  midia2_poster_path: string | null;
  midia2_author: string | null;
  midia2_youtuber: string | null;
};

export default function AdminRoulette() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  async function loadSubmissions() {
    try {
      const response = await fetch(
        "/api/admin/submissions",
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        console.error(
          "Erro ao buscar submissions:",
          response.status
        );

        return;
      }

      const data: SubmissionResponse[] =
        await response.json();

      const formatted: Participant[] = data.map(
        (submission) => ({
          id: submission.id,

          username: submission.username,

          avatar: submission.avatar,

          midia1: {
            id: submission.midia1_id,
            title: submission.midia1_title,
            type: submission.midia1_type,
            image: submission.midia1_poster_path,
            author: submission.midia1_author,
            youtuber: submission.midia1_youtuber,
          },

          midia2: {
            id: submission.midia2_id,
            title: submission.midia2_title,
            type: submission.midia2_type,
            image: submission.midia2_poster_path,
            author: submission.midia2_author,
            youtuber: submission.midia2_youtuber,
          },
        })
      );

      setParticipants(formatted);
    } catch (error) {
      console.error(
        "Erro ao buscar submissions:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSubmissions();

    /*
     * Atualiza a lista a cada 5 segundos.
     *
     * Depois podemos trocar isso por Supabase Realtime
     * ou WebSocket.
     */
    const interval = setInterval(
      loadSubmissions,
      5000
    );

    return () => clearInterval(interval);
  }, []);

  async function removeParticipant(id: string) {
    const confirmed = window.confirm(
      "Tem certeza que deseja remover essa pessoa da roleta?"
    );

    if (!confirmed) {
      return;
    }

    setRemovingId(id);

    try {
      const response = await fetch(
        `/api/admin/submissions/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.error ??
            "Não foi possível remover."
        );

        return;
      }

      setParticipants((current) =>
        current.filter(
          (participant) =>
            participant.id !== id
        )
      );
    } catch (error) {
      console.error(error);

      alert("Erro ao remover participante.");
    } finally {
      setRemovingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-gray-500">
        Carregando roleta...
      </div>
    );
  }

  return (
    <div className="flex w-full h-full flex-col gap-8 lg:flex-row">
      {/* ROLETA */}

      <div className="flex min-w-0 flex-1 items-center justify-center">
        <Roulette
          participants={participants}
        />
      </div>

      {/* PARTICIPANTES */}

      <aside className="w-full lg:w-[360px]">
        <ParticipantList
          participants={participants}
          onRemove={removeParticipant}
          removingId={removingId}
        />
      </aside>
    </div>
  );
}