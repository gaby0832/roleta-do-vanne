import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import LogoutButton from "./components/LogoutButton";
import Image from "next/image";
import Form from "./components/Form";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";

export default async function Home() {
  const session = await auth();


  if (!session?.user) {
    redirect("/login");
  }
  
  return (
    <main className="flex h-screen flex-col">
      <div className="w-full flex gap-3 justify-between items-center h-20 px-5 bg-[#23262A]">
        <div className="flex gap-3 justify-start items-center">


          <Image width="60" height="60" className="rounded-full" src="/logo.png" loading="eager" alt=""/>
          
        </div>
        <div className="flex gap-3 justify-end items-center">


          <Image src={session.user.image ?? "/logo.png"}
  width={40}
  height={40}
  className="rounded-full"
  alt="" loading="eager"/>
          <h1>{session.user.name}</h1> 
          {session.user.role === "ADMIN" ? <Link className="font-md p-2 bg-[#FFFFFF] text-black cursor-pointer rounded-md " href="/admin/rolette"><LayoutDashboard  size="20"/></Link> : "" }
          <LogoutButton/>
        </div>
      </div>

      <div className="w-full px-10 md:px-0 flex flex-col justify-center items-center">
        <Form/>
      </div>
    </main>
  );
}