"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import ResultModal from "./RouletteModal";
import { Participant, RouletteItem } from "./types";

type RouletteProps = {
  participants: Participant[];
};

const SPIN_DURATION = 12000;

export default function Roulette({ participants }: RouletteProps) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<RouletteItem | null>(null);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Limpa o timer ao desmontar. */
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  /* Cada pessoa gera duas opções (índice par = mídia 1, ímpar = mídia 2). */
  const items = useMemo<RouletteItem[]>(() => {
    return participants.flatMap((participant) => [
      {
        id: `${participant.id}-1`,
        submissionId: participant.id,
        username: participant.username,
        avatar: participant.avatar,
        media: participant.midia1,
      },
      {
        id: `${participant.id}-2`,
        submissionId: participant.id,
        username: participant.username,
        avatar: participant.avatar,
        media: participant.midia2,
      },
    ]);
  }, [participants]);

  const sliceCount = items.length;
  const sliceAngle = sliceCount > 0 ? 360 / sliceCount : 360;

  function spin() {
    if (spinning || items.length === 0) {
      return;
    }

    setWinner(null);
    setSpinning(true);

    const winnerIndex = Math.floor(Math.random() * items.length);
    const selected = items[winnerIndex];

    /* Índice par = mídia 1, ímpar = mídia 2. */
    const slot = winnerIndex % 2 === 0 ? 1 : 2;

    /* Centro da fatia vencedora. */
    const targetAngle = winnerIndex * sliceAngle + sliceAngle / 2;

    const fullSpins = 8 * 360;
    const currentRotation = ((rotation % 360) + 360) % 360;

    /* Faz o centro da fatia vencedora parar exatamente na seta. */
    let correction = -targetAngle - currentRotation;
    correction = ((correction % 360) + 360) % 360;

    setRotation(rotation + fullSpins + correction);

    timeoutRef.current = setTimeout(async () => {
      setSpinning(false);
      setWinner(selected);

      try {
        const response = await fetch("/api/admin/announce-winner", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            submissionId: selected.submissionId,
            slot,
          }),
        });

        if (!response.ok) {
          let data: unknown = null;

          try {
            data = await response.json();
          } catch {
            data = await response.text().catch(() => null);
          }

          console.error("Erro ao anunciar vencedor:", data);
        }
      } catch (error) {
        console.error("Erro ao anunciar vencedor no Discord:", error);
      }
    }, SPIN_DURATION);
  }

  if (items.length === 0) {
    return (
      <div className="flex w-full flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#181A1D] p-12 text-center">
        <p className="text-xl font-bold text-white">
          Nenhuma mídia na roleta
        </p>

        <p className="mt-2 text-sm text-gray-500">
          Aguarde os participantes enviarem suas recomendações.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex w-full flex-col items-center">
        <div className="relative aspect-square w-full max-w-[650px]">
          {/* SETA */}
          <div className="absolute left-1/2 top-[-8px] z-40 -translate-x-1/2">
            <div className="h-0 w-0 border-l-[18px] border-r-[18px] border-t-[35px] border-l-transparent border-r-transparent border-t-white drop-shadow-lg" />
          </div>

          {/* RODA */}
          <div
            className="absolute inset-0 overflow-hidden rounded-full border-[8px] border-white/10 bg-[#202327] shadow-2xl"
            style={{
              transform: `rotate(${rotation}deg)`,
              /* Sempre definida: evita o "pulo" no fim do giro. */
              transition: `transform ${SPIN_DURATION}ms cubic-bezier(0.12, 0.8, 0.2, 1)`,
            }}
          >
            {/* DIVISÕES */}
            <svg
              className="pointer-events-none absolute inset-0 z-[-1] h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {items.map((item, index) => {
                const angle = index * sliceAngle;
                const radians = (angle * Math.PI) / 180;

                const x = 50 + 50 * Math.sin(radians);
                const y = 50 - 50 * Math.cos(radians);

                return (
                  <line
                    key={`separator-${item.id}`}
                    x1="50"
                    y1="50"
                    x2={x}
                    y2={y}
                    stroke="rgba(255,255,255,0.25)"
                    strokeWidth="0.15"
                  />
                );
              })}
            </svg>

            {/* CONTEÚDO DAS FATIAS */}
            {items.map((item, index) => (
              <WheelItem
                key={item.id}
                item={item}
                angle={index * sliceAngle + sliceAngle / 2}
                sliceAngle={sliceAngle}
              />
            ))}
          </div>

          {/* BOTÃO CENTRAL */}
          <button
            onClick={spin}
            disabled={spinning || items.length === 0}
            className="absolute left-1/2 top-1/2 z-40 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-1 border-white/20 bg-[#23262A] text-sm font-black text-white shadow-xl transition hover:scale-105 hover:bg-gray-200 hover:text-black disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
          >
            {spinning ? "Spinning" : "Spin"}
          </button>
        </div>

        <p className="mt-3 text-sm text-gray-500">
          {items.length} mídias na roleta
        </p>
      </div>

      <ResultModal item={winner} onClose={() => setWinner(null)} />
    </>
  );
}

/* ================================================= */
/* ITEM DA ROLETA                                    */
/* ================================================= */

const ITEM_WIDTH = 90;
/* Raio aproximado (px) onde fica o conteúdo, numa roda de 650px. */
const CONTENT_RADIUS = 260;

function WheelItem({
  item,
  angle,
  sliceAngle,
}: {
  item: RouletteItem;
  angle: number;
  sliceAngle: number;
}) {
  /* Reduz o conteúdo quando há muitas fatias, para não sobrepor. */
  const arcLength = (2 * Math.PI * CONTENT_RADIUS * sliceAngle) / 360;
  const scale = Math.min(1, Math.max(0.35, arcLength / ITEM_WIDTH));

  return (
    <div
      className="absolute left-1/2 top-1/2"
      style={{
        width: 0,
        height: "50%",
        transformOrigin: "50% 100%",
        transform: `translate(-50%, -100%) rotate(${angle}deg)`,
      }}
    >
      <div
        className="absolute left-0 flex flex-col items-center"
        style={{
          top: 12,
          width: `${ITEM_WIDTH}px`,
          transformOrigin: "top center",
          /* translateX no próprio transform, para não ser sobrescrito. */
          transform: `translateX(-50%) scale(${scale})`,
        }}
      >
        {/* THUMBNAIL */}
        {item.media.image ? (
          <div className="relative h-16 w-12 overflow-hidden rounded-md shadow-lg">
            <Image
              src={item.media.image}
              alt={item.media.title}
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>
        ) : (
          <div className="flex h-16 w-12 items-center justify-center rounded-md bg-white/10 text-xl">
            🎬
          </div>
        )}

        {/* AVATAR */}
        {item.avatar ? (
          <Image
            src={item.avatar}
            width={24}
            height={24}
            alt=""
            className="mt-1 h-6 w-6 rounded-full"
          />
        ) : null}

        {/* TÍTULO */}
        <span className="mt-1 max-w-[90px] truncate text-center text-[10px] font-bold text-white">
          {item.media.title}
        </span>

        {/* USUÁRIO */}
        <span className="max-w-[90px] truncate text-[9px] text-gray-300">
          {item.username}
        </span>
      </div>
    </div>
  );
}