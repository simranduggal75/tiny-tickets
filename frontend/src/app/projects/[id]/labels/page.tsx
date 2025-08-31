"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import API from "@/lib/api";

export default function LabelsPage() {
  const { id } = useParams(); // projectId
  const [labels, setLabels] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchLabels = async () => {
    try {
      const res = await API.get(`/projects/${id}/labels`);
      setLabels(res.data);
    } catch (err: any) {
      console.error("Failed to fetch labels:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchLabels();
  }, [id]);

  const addLabel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await API.post(`/projects/${id}/labels`, { name });
      await fetchLabels();
      setName("");
    } catch (err: any) {
      console.error("Failed to add label:", err.response?.data || err.message);
      alert("Could not add label");
    }
  };

  if (loading) return <p className="p-6">Loading labels...</p>;

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Project Labels</h1>

      {/* Add label form */}
      <form onSubmit={addLabel} className="flex gap-2">
        <input
          className="border p-2 flex-1"
          placeholder="Label name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
      </form>

      {/* List of labels */}
      <ul className="space-y-2">
        {labels.length > 0 ? (
          labels.map((label) => (
            <li key={label.id} className="border p-2 rounded bg-gray-50">
              {label.name}
            </li>
          ))
        ) : (
          <li>No labels yet</li>
        )}
      </ul>
    </main>
  );
}
