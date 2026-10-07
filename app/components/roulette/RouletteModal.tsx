"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { RouletteItem } from "./types";

type ResultModalProps = {
  item: RouletteItem | null;
  onClose: () => void;
};

export default function ResultModal({
  item,
  onClose,
}: ResultModalProps) {
  if (!item) {
    return null;
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-black/80
        p-4
        backdrop-blur-sm
      "
    >
      <div
        className="
          relative
          w-full
          max-w-md
          overflow-hidden
          rounded-2xl
          border
          border-white/10
          bg-[#23262A]
          p-6
          text-white
          shadow-2xl
        "
      >
        <button
          onClick={onClose}
          className="
            absolute
            right-4
            top-4
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            bg-white/10
            transition
            hover:bg-white/20
          "
        >
          <X size={20} />
        </button>

        <div className="mb-5 text-center">
          <p className="text-sm uppercase tracking-widest text-gray-400">
            Resultado
          </p>

          <h2 className="mt-1 text-2xl font-bold">
            🎉 A mídia escolhida!
          </h2>
        </div>

        {item.media.image && (
          <div className="relative mx-auto mb-5 aspect-video w-full overflow-hidden rounded-xl bg-black">
            <Image
              src={item.media.image}
              alt={item.media.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 448px"
            />
          </div>
        )}

        <div className="text-center">
          <h3 className="text-xl font-bold">
            {item.media.title}
          </h3>

          {item.media.author && (
            <p className="mt-1 text-sm text-gray-400">
              {item.media.author}
            </p>
          )}

          {item.media.youtuber && (
            <p className="mt-1 text-sm text-gray-400">
              Canal: {item.media.youtuber}
            </p>
          )}
        </div>

        <div className="my-5 h-px bg-white/10" />

        <div className="flex items-center justify-center gap-3">
          {item.avatar ? (
            <Image
              src={item.avatar}
              width={42}
              height={42}
              alt=""
              className="rounded-full"
            />
          ) : (
            <div className="h-[42px] w-[42px] rounded-full bg-white/10" />
          )}

          <div>
            <p className="text-xs text-gray-500">
              recomendado por
            </p>

            <p className="font-semibold">
              {item.username}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="
            mt-6
            w-full
            rounded-xl
            bg-white
            py-3
            font-bold
            text-black
            transition
            hover:bg-gray-200
          "
        >
          Fechar
        </button>
      </div>
    </div>
  );
}