"use client";

import Image from "next/image";
import { Trash2 } from "lucide-react";
import { Participant } from "./types";

type ParticipantListProps = {
  participants: Participant[];
  onRemove: (id: string) => void;
  removingId: string | null;
};

export default function ParticipantList({
  participants,
  onRemove,
  removingId,
}: ParticipantListProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="mb-3 w-full flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">
          Participantes
        </h2>

        <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-gray-400">
          {participants.length}
        </span>
      </div>

      <div className="flex w-full max-h-[500px] flex-col gap-2 overflow-y-auto">
        {participants.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-gray-500">
            Nenhum participante.
          </div>
        ) : (
          participants.map((participant) => (
            <div
              key={participant.id}
              className="
                flex
                items-center
                gap-3
                rounded-xl
                border
                border-white/5
                bg-[#23262A]
                p-3
              "
            >
              {participant.avatar ? (
                <Image
                  src={participant.avatar}
                  width={42}
                  height={42}
                  alt=""
                  className="h-[42px] w-[42px] rounded-full"
                />
              ) : (
                <div className="h-[42px] w-[42px] rounded-full bg-white/10" />
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-white">
                  {participant.username}
                </p>

                <div className="mt-1 flex flex-col text-xs text-gray-500">
                  <span className="truncate">
                    {participant.midia1.title}
                  </span>

                  <span className="truncate">
                    {participant.midia2.title}
                  </span>
                </div>
              </div>

              <button
                onClick={() => onRemove(participant.id)}
                disabled={removingId === participant.id}
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  text-red-400
                  transition
                  hover:bg-red-500/10
                  hover:text-red-300
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
                title="Remover participante"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}


        
      </div>
    </div>
  );
}