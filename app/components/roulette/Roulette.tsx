"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import ResultModal from "./RouletteModal";
import { Participant, RouletteItem } from "./types";

type RouletteProps = {
  participants: Participant[];
};

export default function Roulette({
  participants,
}: RouletteProps) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<RouletteItem | null>(null);

  /*
   * Cada pessoa gera duas opções.
   *
   * Exemplo:
   *
   * Gaby -> Filme A
   * Gaby -> Filme B
   * João -> Filme C
   * João -> Filme D
   */
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

    /*
     * Escolhemos o vencedor ANTES da animação.
     *
     * Assim a roleta visualmente termina exatamente
     * na mídia que será mostrada no modal.
     */
    const winnerIndex = Math.floor(
      Math.random() * items.length
    );

    const selected = items[winnerIndex];

    /*
     * Queremos que o centro da fatia selecionada
     * fique apontando para o topo.
     */
    const targetAngle =
      winnerIndex * sliceAngle + sliceAngle / 2;

    /*
     * Algumas voltas completas para dar a sensação
     * de roleta girando.
     */
    const fullSpins = 6 * 360;

    const finalRotation =
      rotation +
      fullSpins +
      (360 - targetAngle);

    setRotation(finalRotation);

    /*
     * Precisa ser igual ao tempo da transition no CSS.
     */
    setTimeout(() => {
      setSpinning(false);
      setWinner(selected);
    }, 5000);
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
        {/* ROLETTA */}
        <div className="relative aspect-square w-full max-w-[650px]">
          {/* SETA */}
          <div
            className="
              absolute
              left-1/2
              top-[-8px]
              z-30
              -translate-x-1/2
            "
          >
            <div
              className="
                h-0
                w-0
                border-l-[18px]
                border-r-[18px]
                border-t-[35px]
                border-l-transparent
                border-r-transparent
                border-t-white
                drop-shadow-lg
              "
            />
          </div>

          {/* RODA */}
          <div
            className="
              absolute
              inset-0
              overflow-hidden
              rounded-full
              border-[8px]
              border-white/10
              bg-[#202327]
              shadow-2xl
            "
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning
                ? "transform 5s cubic-bezier(0.12, 0.8, 0.2, 1)"
                : "none",
            }}
          >
            {items.map((item, index) => {
              const angle = index * sliceAngle;

              return (
                <WheelItem
                  key={item.id}
                  item={item}
                  angle={angle}
                  sliceAngle={sliceAngle}
                />
              );
            })}
          </div>

          {/* CENTRO */}
          <div
            className="
              absolute
              left-1/2
              top-1/2
              z-20
              flex
              h-20
              w-20
              -translate-x-1/2
              -translate-y-1/2
              items-center
              justify-center
              rounded-full
              border-4
              border-white/20
              bg-[#23262A]
              text-2xl
              shadow-xl
            "
          >
            🎰
          </div>
        </div>

        {/* BOTÃO */}
        <button
          onClick={spin}
          disabled={spinning || items.length === 0}
          className="
            mt-8
            rounded-xl
            bg-white
            px-10
            py-4
            text-lg
            font-black
            text-black
            transition
            hover:scale-105
            hover:bg-gray-200
            disabled:cursor-not-allowed
            disabled:opacity-40
            disabled:hover:scale-100
          "
        >
          {spinning ? "GIRANDO..." : "GIRAR ROLETA"}
        </button>

        <p className="mt-3 text-sm text-gray-500">
          {items.length} mídias na roleta
        </p>
      </div>

      <ResultModal
        item={winner}
        onClose={() => setWinner(null)}
      />
    </>
  );
}

function WheelItem({
  item,
  angle,
  sliceAngle,
}: {
  item: RouletteItem;
  angle: number;
  sliceAngle: number;
}) {
  /*
   * Cada item ocupa uma fatia da roda.
   *
   * O conteúdo é girado para dentro da fatia e depois
   * compensamos a rotação para que texto/imagem fiquem
   * visualmente na orientação correta.
   */

  const radius = 42;

  return (
    <div
      className="absolute left-1/2 top-1/2"
      style={{
        width: `${sliceAngle}deg`,
        height: "50%",
        transformOrigin: "50% 100%",
        transform: `
          translate(-50%, -100%)
          rotate(${angle}deg)
        `,
      }}
    >
      <div
        className="absolute left-1/2 top-2 flex -translate-x-1/2 flex-col items-center"
        style={{
          transform: `translateY(-${radius / 2}px)`,
          width: "90px",
        }}
      >
        {item.media.image ? (
          <div className="relative h-16 w-12 overflow-hidden rounded-md border-2 border-white/40 shadow-lg">
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

        {item.avatar ? (
          <Image
            src={item.avatar}
            width={24}
            height={24}
            alt=""
            className="mt-1 h-6 w-6 rounded-full border border-white/50"
          />
        ) : null}

        <span
          className="
            mt-1
            max-w-[90px]
            truncate
            text-center
            text-[10px]
            font-bold
            text-white
          "
        >
          {item.media.title}
        </span>

        <span className="max-w-[90px] truncate text-[9px] text-gray-300">
          {item.username}
        </span>
      </div>
    </div>
  );
}