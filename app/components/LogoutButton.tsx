"use client";

import { signOut } from "next-auth/react";
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  return (
    <button className="font-md p-2 bg-[#FFFFFF] text-black cursor-pointer rounded-md " onClick={() => signOut({ callbackUrl: "/" })}>
      <LogOut size="20"/>
    </button>
  );
}