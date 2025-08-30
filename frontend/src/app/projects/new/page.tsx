"use client";
import { useState } from "react";
import API from "@/lib/api";
import { useRouter } from "next/navigation";

export default function NewProjectPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await API.post("/projects", { name, description });
      router.push("/projects");
    } catch {
      alert("Failed to create project");
    }
  };

  return (
    <main className="flex h-screen items-center justify-center">
      <form onSubmit={handleCreate} className="bg-white p-6 rounded shadow w-96 space-y-4">
        <h1 className="text-xl font-bold">New Project</h1>
        <input className="w-full border p-2" placeholder="Project Name" value={name} onChange={(e) => setName(e.target.value)} />
        <textarea className="w-full border p-2" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <button className="w-full bg-blue-600 text-white p-2 rounded">Create</button>
      </form>
    </main>
  );
}
