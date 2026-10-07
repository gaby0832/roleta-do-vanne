"use client";

import { Film, Play } from "lucide-react";
import { SubmitEvent, useState } from "react";
import Input, { Midia } from "./Input";

export default function Form() {
  const [submitMode, setSubmitMode] = useState<string>("filme");

  const [midia1, setMidia1] = useState<Midia[]>([]);
  const [midia2, setMidia2] = useState<Midia[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlerSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");

    // Cada Input deve ter exatamente uma mídia
    if (midia1.length !== 1 || midia2.length !== 1) {
  setError("Selecione as duas mídias.");
  return;
    }

    if (
    midia1[0].id === midia2[0].id &&
    midia1[0].title === midia2[0].title
    ) {
    setError("Você não pode escolher a mesma mídia duas vezes.");
    return;
    }


    try {
      setLoading(true);

      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          midia1: midia1[0],
          midia2: midia2[0],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Erro ao enviar a submissão.");
        return;
      }

      console.log("Submissão criada:", data);

      // Limpa os inputs depois de enviar
      setMidia1([]);
      setMidia2([]);

    } catch (error) {
      console.error(error);
      setError("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-1/2 flex flex-col">

      <div className="flex">

        <button
          type="button"
          onClick={() => {
            setSubmitMode("filme");
            setMidia1([]);
            setMidia2([]);
          }}
          className={`p-5 w-full h-full transition-all
          bg-[#23262A] rounded-tl-lg inline-flex justify-center items-center gap-2 cursor-pointer
          ${submitMode === "filme" ? "bg-[#151719]" : ""}`}
        >
          <Film size="20" />
          Filmes
        </button>

        <button
          type="button"
          onClick={() => {
            setSubmitMode("video");
            setMidia1([]);
            setMidia2([]);
          }}
          className={`p-5 transition-all
          w-full h-full bg-[#23262A] rounded-tr-lg inline-flex justify-center items-center gap-2 cursor-pointer
          ${submitMode === "video" ? "bg-[#151719]" : ""}`}
        >
          <Play size="20" />
          Youtube
        </button>

      </div>

      <form
        className="px-5 py-5 flex flex-col w-full h-full bg-[#23262A] gap-5 rounded-b-lg rounded-tr-lg justify-center items-center"
        onSubmit={handlerSubmit}
      >

        <label className="self-start">
          {submitMode === "filme" ? "Filme " : "Vídeo "}1
        </label>

        <Input
          submitMode={submitMode}
          midia={midia1}
          setMidia={setMidia1}
        />

        <label className="self-start">
          {submitMode === "filme" ? "Filme " : "Vídeo "}2
        </label>

        <Input
          submitMode={submitMode}
          midia={midia2}
          setMidia={setMidia2}
        />

        {error && (
          <p className="self-start text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="self-start p-2 px-4 rounded-md flex justify-center items-center bg-[#5865F3] cursor-pointer disabled:opacity-50"
        >
          {loading ? "Enviando..." : "Enviar para roleta"}
        </button>

        <p className="self-start text-center">
          Os filmes serão informados na barra de pesquisa assim que
          digitados os nomes. É obrigatório, na aba de vídeos, o
          inserimento da URL do vídeo, caso contrário não contará.
        </p>

      </form>
    </div>
  );
}