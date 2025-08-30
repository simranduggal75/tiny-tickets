"use client";
import { useEffect, useState } from "react";
import API from "@/lib/api";
import Link from "next/link";

interface Project {
  id: string;
  name: string;
  description: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
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
    <main className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Link href="/projects/new" className="bg-blue-600 text-white px-3 py-1 rounded">
          + New Project
        </Link>
      </div>
      <ul className="space-y-2">
        {projects.map((p) => (
          <li key={p.id} className="border p-2 rounded">
            <Link href={`/projects/${p.id}`} className="text-blue-600 underline">
              {p.name}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
