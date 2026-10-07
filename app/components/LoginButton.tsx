"use client";

import { signIn } from "next-auth/react";

export default function LoginButton() {
  return (
      <button className="p-2 px-4 rounded-md flex justify-center items-center bg-[#5865F3] cursor-pointer" onClick={() => signIn("discord")}>
        Entrar com Discord
      </button>
  );
}