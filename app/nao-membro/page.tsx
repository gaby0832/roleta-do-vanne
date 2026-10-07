import { auth } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function naomembro() {
     const session = await auth();

    if (session?.user) {
    redirect("/");
  }

  
  return (
    <main className="flex h-screen flex-col">
      <div className="w-full flex-col flex gap-3 justify-center items-center h-full bg-[#23262A]">
      
        <h1>É necessário estar no servidor do Vanne</h1>
        <p>Após entrar no servidor clique no botão para fazer login novamente</p>
        <Link className="p-2 px-4 rounded-md flex justify-center items-center bg-[#5865F3] cursor-pointer" href="https://discord.gg/vsC7RVz53G" target="_blank">Entrar no Servidor</Link>
        <Link className="p-2 px-4 rounded-md flex justify-center items-center bg-[#5865F3] cursor-pointer" href="/login">Voltar para página de login</Link>
      </div>
    </main>
  );
}