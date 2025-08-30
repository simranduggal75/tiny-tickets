"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import API from "@/lib/api";

export default function AddMemberPage() {
  const { id } = useParams();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MEMBER");
  const router = useRouter();

  const handleAdd = async (e: any) => {
    e.preventDefault();
    try {
      await API.post(`/projects/${id}/members`, { email, role });
      router.push(`/projects/${id}`);
    } catch {
      alert("Failed to add member");
    }
  };

  return (
    <main className="flex h-screen items-center justify-center">
      <form
        onSubmit={handleAdd}
        className="bg-white p-6 rounded shadow w-96 space-y-4"
      >
        <h1 className="text-xl font-bold">Add Member</h1>
        <input
          className="w-full border p-2"
          placeholder="Member Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <select
          className="w-full border p-2"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="MEMBER">Member</option>
          <option value="OWNER">Owner</option>
        </select>
        <button className="w-full bg-purple-600 text-white p-2 rounded">
          Add
        </button>
      </form>
    </main>
  );
}
