import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Image from "next/image";

import LogoutButton from "../../components/LogoutButton";
import RoundControls from "../../components/RoundControls";
import AdminRoulette from "../../components/roulette/AdminRoulette";
import { Form, Undo2, Undo2Icon } from "lucide-react";
import Link from "next/link";

export default async function RoletaPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <main className="bg-[#181A1D] text-white">
      {/* HEADER */}

      <header
        className="
          flex
          h-20
          w-full
          items-center
          justify-between
          bg-[#23262A]
          px-5
        "
      >
        <div className="flex items-center gap-3">
          <Image
            width={60}
            height={60}
            className="rounded-full"
            src="/logo.png"
            loading="eager"
            alt=""
          />

        </div>

        <div className="flex items-center gap-3">
          {session.user.image && (
            <Image
              width={40}
              height={40}
              className="rounded-full"
              src={session.user.image}
              loading="eager"
              alt=""
            />
          )}

          <h2>
            {session.user.name}
          </h2>

          <Link className="inline-flex p-2 bg-[#FFFFFF] text-black cursor-pointer rounded-md" href="/"><Undo2Icon size="20" /></Link>

          <LogoutButton />
        </div>
      </header>

      {/* CONTEÚDO */}

      <div className="mx-auto flex w-full h-full max-w-[1600px] flex-col gap-8 p-6">
        {/* CONTROLE DA RODADA */}

        <section className="rounded-2xl bg-[#202327] h-full p-5">
          <RoundControls />
        </section>

        {/* ROLETA */}

        <section className="h-screen">
          <AdminRoulette />
        </section>
      </div>
    </main>
  );
}