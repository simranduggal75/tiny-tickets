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

  const fetchData = async () => {
    try {
      const [projectRes, ticketsRes] = await Promise.all([
        API.get(`/projects/${id}`),
        API.get(`/projects/${id}/tickets`),
      ]);
      setProject(projectRes.data);
      setTickets(ticketsRes.data);
      setLoading(false);
    } catch (err: any) {
      console.error("Failed to fetch project or tickets:", err.response?.data || err.message);
      setError("Could not load project data");
      setLoading(false);
    }
  };

const handleDeleteTicket = async (ticketId: string) => {
  if (!confirm("Are you sure you want to delete this ticket?")) return;
  try {
    await API.delete(`/tickets/${ticketId}`); 
    await fetchData(); 
  } catch (err: any) {
    console.error("Failed to delete ticket:", err.response?.data || err.message);
    alert("Could not delete ticket");
  }
};



  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  if (loading) return <p className="p-6">Loading project...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!project) return <p className="p-6">No project found</p>;

  return (
    <main className="p-6 space-y-8">
      {/* Project Info */}
      <section>
        <h1 className="text-2xl font-bold">{project.name}</h1>
        <p className="text-gray-700">{project.description}</p>

        <div className="flex gap-4 mt-4">
          <Link
            href={`/projects/${id}/tickets/new`}
            className="bg-green-600 text-white px-3 py-1 rounded"
          >
            + New Ticket
          </Link>
          <Link
            href={`/projects/${id}/add-member`}
            className="bg-purple-600 text-white px-3 py-1 rounded"
          >
            + Add Member
          </Link>
          <Link
            href={`/projects/${id}/labels`}
            className="bg-orange-600 text-white px-3 py-1 rounded"
          >
            Labels
          </Link>
        </div>
      </section>

      {/* Members */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Members</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-2 text-left">Name</th>
                <th className="border border-gray-300 p-2 text-left">Email</th>
                <th className="border border-gray-300 p-2 text-left">Role</th>
              </tr>
            </thead>
            <tbody>
              {project.members?.length > 0 ? (
                project.members.map((m: any) => (
                  <tr key={m.user.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-2">
                      {m.user.name || "—"}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {m.user.email}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {m.role}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="border border-gray-300 p-2 text-center">
                    No members yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Tickets */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Tickets</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-2 text-left">Title</th>
                <th className="border border-gray-300 p-2 text-left">Status</th>
                <th className="border border-gray-300 p-2 text-left">Priority</th>
                <th className="border border-gray-300 p-2 text-left">Assignee</th>
                <th className="border border-gray-300 p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length > 0 ? (
                tickets.map((t: any) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-2">{t.title}</td>
                    <td className="border border-gray-300 p-2">{t.status}</td>
                    <td className="border border-gray-300 p-2">{t.priority}</td>
                    <td className="border border-gray-300 p-2">
                      {t.assignee?.name || "Unassigned"}
                    </td>
                    <td className="border border-gray-300 p-2">
  <Link
    href={`/tickets/${t.id}`}
    className="text-blue-600 underline mr-2"
  >
    View
  </Link>
  <Link
    href={`/projects/${id}/tickets/${t.id}/edit`}
    className="text-green-600 underline mr-2"
  >
    Edit
  </Link>
  <button
    onClick={() => handleDeleteTicket(t.id)}
    className="text-red-600 underline"
  >
    Delete
  </button>
</td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="border border-gray-300 p-2 text-center">
                    No tickets yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
