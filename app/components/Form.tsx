"use client";

import { Film, Play } from "lucide-react";
import { SubmitEvent, useState, useEffect } from "react";
import Input, { Midia } from "./Input";
import ViewRound from "./ViewRound";

import ViewParticipants from "./ViewParticipants";
import { Participant } from "./roulette/types";

export default function Form() {
  const [submitMode, setSubmitMode] = useState<string>("filme");

  const [midia1, setMidia1] = useState<Midia[]>([]);
  const [midia2, setMidia2] = useState<Midia[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  const [participants, setParticipants] = useState<Participant[]>([]);

    async function loadSubmissions() {
    try {
      const response = await fetch(
        "/api/submissions",
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


  return (
    <div className="w-full h-full flex md:flex-row flex-col justify-center items-center gap-4 p-6">
  

   
      <div className="w-full h-full md:w-1/2 flex flex-col">



         <ViewRound/>

      <div className="flex w-full">



     


        <button
          type="button"
          onClick={() => {
            setSubmitMode("filme");
            setMidia1([]);
            setMidia2([]);
          }}
          className={`p-5 h-[70px] w-full transition-all
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
          className={`p-5 h-[70px] transition-all
          w-full bg-[#23262A] rounded-tr-lg inline-flex justify-center items-center gap-2 cursor-pointer
          ${submitMode === "video" ? "bg-[#151719]" : ""}`}
        >
          <Play size="20" />
          Youtube
        </button>

      </div>

      <form
        className="px-5 py-5 flex flex-col w-full h-full bg-[#23262A] gap-5 rounded-b-lg"
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

       <div className="flex flex-col md:w-1/2 w-full md:h-[560px] jusfify-start">

      <ViewParticipants
          participants={participants}
        />

    </div>
  </div>
  );
}