import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginButton from "../components/LoginButton";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/");
  }

  return (
    <main className="h-screen">
            <div className="w-full h-full flex flex-col justify-center items-center">
              
      <LoginButton/>
    </div>
    </main>
  );
}