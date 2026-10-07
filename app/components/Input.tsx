"use client";

import { useEffect, useState } from "react";

type Movie = {
  id: number;
  title: string;
  poster_path: string | null;
  release_date?: string;
};

type Video = {
  id: string;
  title: string;
  thumbnail: string | null;
  channel: string;
};

export type Midia = {
  id: string;
  title: string;
  type: "filme" | "video";
  poster_path: string;
  youtuber: string | null
};

type InputProps = {
  submitMode: string;
  midia: Midia[];
  setMidia: React.Dispatch<React.SetStateAction<Midia[]>>;
};

export default function Input({
  submitMode,
  midia,
  setMidia,
}: InputProps) {
  const [search, setSearch] = useState("");

  const [movies, setMovies] = useState<Movie[]>([]);
  const [loadingMovies, setLoadingMovies] = useState(false);

  const [video, setVideo] = useState<Video | null>(null);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [videoError, setVideoError] = useState("");

  /*
   * BUSCA FILMES
   */

   useEffect(() => {
    setMidia([])
   },[submitMode]);


  useEffect(() => {
    if (submitMode !== "filme") {
      setMovies([]);
      return;
    }

    if (!search.trim()) {
      setMovies([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setLoadingMovies(true);

        const response = await fetch(
          `/api/movie/search?q=${encodeURIComponent(search)}`
        );

        if (!response.ok) {
          throw new Error("Erro ao buscar filmes");
        }

        const data = await response.json();

        setMovies(data.results ?? []);
      } catch (error) {
        console.error(error);
        setMovies([]);
      } finally {
        setLoadingMovies(false);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [search, submitMode]);

  /*
   * BUSCA VÍDEO
   */
  useEffect(() => {
    if (submitMode !== "video") {
      setVideo(null);
      setVideoError("");
      return;
    }

    const url = search.trim();

    if (!url) {
      setVideo(null);
      setVideoError("");
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setLoadingVideo(true);
        setVideoError("");

        const response = await fetch(
          `/api/video/info?url=${encodeURIComponent(url)}`
        );

        const data = await response.json();

        if (!response.ok) {
          setVideo(null);
          setVideoError(
            data.error ?? "Não foi possível encontrar o vídeo"
          );
          return;
        }

        setVideo(data);
      } catch {
        setVideo(null);
        setVideoError("Erro ao buscar informações do vídeo");
      } finally {
        setLoadingVideo(false);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [search, submitMode]);

  /*
   * ADICIONAR MÍDIA
   */
  function adicionarMidia(item: Midia) {
    // máximo de 2 mídias
    if (midia.length >= 2) return;

    // não deixa adicionar a mesma mídia duas vezes
    if (
      midia.some(
        (itemExistente) =>
          itemExistente.id === item.id &&
          itemExistente.type === item.type
      )
    ) {
      return;
    }

    setMidia((prev) => [...prev, item]);

    setSearch("");
    setVideo(null);
    setMovies([]);
    setVideoError("");
  }

  /*
   * REMOVER MÍDIA
   */
  function removerMidia(index: number) {
    setMidia((prev) => prev.filter((_, i) => i !== index));
  }

  /*
   * FILME
   */
  if (submitMode === "filme") {
    return (
      <div className="w-full">
        <input
          type="text"
          placeholder={
            midia.length >= 2
              ? "Você já selecionou 2 mídias"
              : "Digite o nome do filme..."
          }
          value={search}
          disabled={midia.length >= 2}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
          className="w-full py-2 px-4 bg-white text-black rounded-sm outline-none disabled:opacity-50"
        />

        {loadingMovies && (
          <p className="mt-2 text-sm text-white">
            Buscando...
          </p>
        )}

        {movies.length > 0 && midia.length < 2 && (
          <div className="mt-2 w-full max-h-30 bg-white rounded-sm overflow-y-auto">
            {movies.map((movie) => (
              <button
                key={movie.id}
                type="button"
                onClick={() =>
                  adicionarMidia({
                    id: String(movie.id),
                    title: movie.title,
                    type: "filme",
                    poster_path: movie.poster_path
                      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                      : "",
                    youtuber: null,
                  })
                }
                className="flex items-center gap-3 w-full p-2 text-left text-black hover:bg-gray-200"
              >
                {movie.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                    alt=""
                    className="w-10 h-14 object-cover rounded-sm"
                  />
                ) : (
                  <div className="w-10 h-14 bg-gray-300 rounded-sm" />
                )}

                <div className="flex flex-col">
                  <strong>{movie.title}</strong>

                  {movie.release_date && (
                    <span className="text-sm text-gray-500">
                      {movie.release_date.slice(0, 4)}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        <ListaMidias
          midia={midia}
          removerMidia={removerMidia}
        />
      </div>
    );
  }

  /*
   * VÍDEO
   */
  if (submitMode === "video") {
    return (
      <div className="w-full">
        <input
          type="url"
          placeholder={
            midia.length >= 2
              ? "Você já selecionou 2 mídias"
              : "Cole a URL do vídeo..."
          }
          value={search}
          disabled={midia.length >= 2}
          onChange={(e) => {
            setSearch(e.target.value);
            setVideo(null);
            setVideoError("");
          }}
          className="w-full py-2 px-4 bg-white text-black rounded-sm outline-none disabled:opacity-50"
        />

        {loadingVideo && (
          <p className="mt-2 text-sm text-white">
            Buscando vídeo...
          </p>
        )}

        {videoError && (
          <p className="mt-2 text-sm text-red-400">
            {videoError}
          </p>
        )}

        {video && midia.length < 2 && (
          <button
            type="button"
            onClick={() =>
              adicionarMidia({
                id: video.id,
                title: video.title,
                type: "video",
                poster_path: video.thumbnail ?? "",
                youtuber: video.channel,
              })
            }
            className="flex gap-3 w-full mt-2 p-2 bg-white text-black rounded-sm text-left hover:bg-gray-200"
          >
            {video.thumbnail && (
              <img
                src={video.thumbnail}
                alt=""
                className="w-40 aspect-video object-cover rounded-sm"
              />
            )}

            <div className="flex flex-col justify-center min-w-0">
              <strong className="line-clamp-2">
                {video.title}
              </strong>

              <span className="text-sm text-gray-500 mt-1">
                {video.channel}
              </span>
            </div>
          </button>
        )}

        <ListaMidias
          midia={midia}
          removerMidia={removerMidia}
        />
      </div>
    );
  }

  return null;
}

/*
 * LISTA DAS MÍDIAS SELECIONADAS
 */
function ListaMidias({
  midia,
  removerMidia,
}: {
  midia: Midia[];
  removerMidia: (index: number) => void;
}) {
  if (midia.length === 0) return null;

  return (
    <div className="mt-4 flex flex-col gap-2">
      {midia.map((item, index) => (
        <div
          key={`${item.type}-${item.id}`}
          className="flex items-center gap-3 p-2 bg-white text-black rounded-sm"
        >
          {item.poster_path ? (
            <img
              src={item.poster_path}
              alt=""
              className="w-20 aspect-video object-cover rounded-sm"
            />
          ) : (
            <div className="w-20 aspect-video bg-gray-300 rounded-sm" />
          )}

          <div className="flex-1 min-w-0">
            <strong className="block truncate">
              {item.title}
            </strong>

            <span className="text-sm text-gray-500">
              {item.type}
            </span>
          </div>

          <button
            type="button"
            onClick={() => removerMidia(index)}
            className="px-2 py-1 text-red-500"
          >
            X
          </button>
        </div>
      ))}
    </div>
  );
}