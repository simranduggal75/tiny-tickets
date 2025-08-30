"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import API from "@/lib/api";
import Link from "next/link";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      Promise.all([
        API.get(`/projects/${id}`),
        API.get(`/projects/${id}/tickets`),
      ])
        .then(([projectRes, ticketsRes]) => {
          setProject(projectRes.data);
          setTickets(ticketsRes.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch project or tickets:", err.response?.data || err.message);
          setError("Could not load project data");
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) return <p className="p-6">Loading project...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!project) return <p className="p-6">No project found</p>;

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">{project.name}</h1>
      <p>{project.description}</p>

      <div className="flex gap-4 mt-4">
        <Link href={`/projects/${id}/tickets/new`} className="bg-green-600 text-white px-3 py-1 rounded">
          + New Ticket
        </Link>
        <Link href={`/projects/${id}/add-member`} className="bg-purple-600 text-white px-3 py-1 rounded">
          + Add Member
        </Link>
        <Link href={`/projects/${id}/labels`} className="bg-orange-600 text-white px-3 py-1 rounded">
          Labels
        </Link>
      </div>

      <h2 className="text-xl font-semibold mt-6">Members</h2>
      <ul>
        {project.members?.length > 0 ? (
          project.members.map((m: any) => (
            <li key={m.user.id}>
              {m.user.name || m.user.email} ({m.role})
            </li>
          ))
        ) : (
          <li>No members yet</li>
        )}
      </ul>

      <h2 className="text-xl font-semibold mt-6">Tickets</h2>
      <ul>
        {tickets.length > 0 ? (
          tickets.map((t: any) => (
            <li key={t.id}>
              <Link href={`/tickets/${t.id}`} className="text-blue-600 underline">
                {t.title} - {t.status}
              </Link>
            </li>
          ))
        ) : (
          <li>No tickets yet</li>
        )}
      </ul>
    </main>
  );
}
