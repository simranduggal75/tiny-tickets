"use client";
import { useEffect, useState } from "react";
import API from "@/lib/api";
import Link from "next/link";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    API.get("/projects")
      .then((res) => {
        setProjects(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch projects", err.response?.data || err.message);
        setError("Could not load projects");
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="p-6">Loading projects...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <main className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Link
          href="/projects/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
        >
          + New Project
        </Link>
      </div>

      {/* Projects Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 p-2 text-left">Name</th>
              <th className="border border-gray-300 p-2 text-left">Description</th>
              <th className="border border-gray-300 p-2 text-left">Created At</th>
              <th className="border border-gray-300 p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.length > 0 ? (
              projects.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-gray-50 odd:bg-gray-100 transition"
                >
                  <td className="border border-gray-300 p-2 font-medium">{p.name}</td>
                  <td className="border border-gray-300 p-2">
                    {p.description || "—"}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {p.createdAt
                      ? new Date(p.createdAt).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="border border-gray-300 p-2">
                    <Link
                      href={`/projects/${p.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="border border-gray-300 p-2 text-center text-gray-500"
                >
                  No projects yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
