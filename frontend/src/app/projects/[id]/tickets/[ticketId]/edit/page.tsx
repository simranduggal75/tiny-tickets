"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import API from "@/lib/api";

export default function EditTicketPage() {
  const { id, ticketId } = useParams(); // projectId, ticketId
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("OPEN");
  const [priority, setPriority] = useState("MEDIUM");
  const [assigneeId, setAssigneeId] = useState("");
  const [members, setMembers] = useState<any[]>([]);

  // Load ticket + members
  useEffect(() => {
    if (ticketId) {
      API.get(`/tickets/${ticketId}`)
        .then((res) => {
          const t = res.data;
          setTitle(t.title);
          setDescription(t.description || "");
          setStatus(t.status);
          setPriority(t.priority);
          setAssigneeId(t.assignee?.id || "");
        })
        .catch((err) => {
          console.error("Failed to load ticket:", err.response?.data || err.message);
        });
    }

    if (id) {
      API.get(`/projects/${id}`)
        .then((res) => {
          setMembers(res.data.members || []);
        })
        .catch((err) => {
          console.error("Failed to load members:", err.response?.data || err.message);
        });
    }
  }, [id, ticketId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await API.put(`/tickets/${ticketId}`, {
        title,
        description,
        status,
        priority,
        assigneeId: assigneeId || null,
      });
      router.push(`/projects/${id}`);
    } catch (err: any) {
      console.error("Failed to update ticket:", err.response?.data || err.message);
      alert("Could not update ticket");
    }
  };

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Ticket</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
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
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="OPEN">OPEN</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="RESOLVED">RESOLVED</option>
          <option value="CLOSED">CLOSED</option>
        </select>
        <select
          className="w-full border p-2"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
        </select>
        <select
          className="w-full border p-2"
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
        >
          <option value="">Unassigned</option>
          {members.map((m) => (
            <option key={m.user.id} value={m.user.id}>
              {m.user.name || m.user.email}
            </option>
          ))}
        </select>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Save Changes
        </button>
      </form>
    </main>
  );
}
