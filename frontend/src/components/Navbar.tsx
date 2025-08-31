"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <nav className="bg-gray-800 text-white px-6 py-3 flex items-center justify-between shadow">
      {/* Left side: Brand */}
      <div className="text-xl font-bold">
        <Link href="/projects">Tiny Tickets</Link>
      </div>

      {/* Right side: Links + Logout */}
      <div className="flex items-center gap-4">
        <Link href="/projects" className="hover:text-gray-300">
          Projects
        </Link>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-sm font-medium"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
