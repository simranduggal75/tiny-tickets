"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/auth";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    auth.clearToken();   // remove JWT
    router.push("/login");
  }, [router]);

  return <p className="p-6">Logging out...</p>;
}
