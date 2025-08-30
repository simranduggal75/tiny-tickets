"use client";
import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/login" && pathname !== "/register") {
      const token = localStorage.getItem("token");
      if (!token) router.push("/login");
    }
  }, [pathname, router]);

  const isAuthPage = pathname === "/login" || pathname === "/register";

  return (
    <>
      {!isAuthPage && (
        <nav className="flex items-center justify-between bg-gray-800 text-white px-6 py-3">
          <Link href="/projects" className="font-bold text-lg">
            Tiny Tickets
          </Link>
          <div className="space-x-4">
            <Link href="/projects" className="hover:underline">Projects</Link>
            <Link href="/logout" className="text-red-400 hover:underline">Logout</Link>
          </div>
        </nav>
      )}
      <main className="p-6">{children}</main>
    </>
  );
}
