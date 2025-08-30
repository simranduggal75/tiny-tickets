"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import API from "@/lib/api";

export default function TicketDetailPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [body, setBody] = useState("");

  // Load ticket + comments
  useEffect(() => {
    if (id) {
      API.get(`/tickets/${id}`).then((res) => setTicket(res.data));
      API.get(`/tickets/${id}/comments`).then((res) => setComments(res.data));
    }
  }, [id]);

  const addComment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await API.post(`/tickets/${id}/comments`, { body });
      setBody("");
      const res = await API.get(`/tickets/${id}/comments`);
      setComments(res.data);
    } catch {
      alert("Failed to add comment");
    }
  };

  if (!ticket) return <p className="p-6">Loading...</p>;

  return (
    <main className="p-6 space-y-6">
      {/* Ticket Info */}
      <div className="border p-4 rounded shadow">
        <h1 className="text-2xl font-bold">{ticket.title}</h1>
        <p className="text-gray-700">{ticket.description}</p>
        <p>Status: <span className="font-semibold">{ticket.status}</span></p>
        <p>Priority: <span className="font-semibold">{ticket.priority}</span></p>
      </div>

      {/* Comments */}
      <section>
        <h2 className="text-xl font-semibold">Comments</h2>
        <ul className="space-y-2 mt-2">
          {comments.length > 0 ? (
            comments.map((c) => (
              <li key={c.id} className="border-b pb-2">
                <b>{c.author?.name || c.author?.email}:</b> {c.body}
              </li>
            ))
          ) : (
            <li>No comments yet</li>
          )}
        </ul>

        <form onSubmit={addComment} className="mt-4 space-y-2">
          <textarea
            className="w-full border p-2"
            placeholder="Add comment"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            Post Comment
          </button>
        </form>
      </section>
    </main>
  );
}
