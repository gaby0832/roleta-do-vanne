import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import LogoutButton from "./components/LogoutButton";
import Image from "next/image";
import Form from "./components/Form";

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
          <LogoutButton/>
        </div>
      </div>

      <div className="w-full h-full flex flex-col justify-center items-center">
        <Form/>
      </div>
    </main>
  );
}