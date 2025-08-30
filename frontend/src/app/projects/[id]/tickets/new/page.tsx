"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import API from "@/lib/api";

export default function NewTicketPage() {
  const { id } = useParams(); // project id
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("LOW");
  const [status, setStatus] = useState("OPEN");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log("🔵 Sending request to:", `/projects/${id}/tickets`);
      console.log("🔵 Payload:", { title, description, priority, status });

      const res = await API.post(`/projects/${id}/tickets`, {
        title,
        description,
        priority,
        status,
      });

      console.log("🟢 Ticket created successfully:", res.data);
      router.push(`/projects/${id}`);
    } catch (err: any) {
      console.error("🔴 Ticket creation failed:", err.response?.data || err.message);
      alert("Failed: " + JSON.stringify(err.response?.data || err.message));
    }
  };

  return (
    <main className="flex h-screen items-center justify-center">
      <form
        onSubmit={handleCreate}
        className="bg-white p-6 rounded shadow w-96 space-y-4"
      >
        <h1 className="text-xl font-bold">New Ticket</h1>
        <input
          className="w-full border p-2"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="w-full border p-2"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <select
          className="w-full border p-2"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
        <select
          className="w-full border p-2"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
        <button className="w-full bg-green-600 text-white p-2 rounded">
          Create Ticket
        </button>
      </form>
    </main>
  );
}
