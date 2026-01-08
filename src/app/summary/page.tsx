"use client";

import { useEffect, useState } from "react";
import { getAuthToken } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function SummaryPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const token = getAuthToken();
        const base = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
        const resp = await fetch(`${base}/api/application/summary-data`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!resp.ok) {
          const txt = await resp.text();
          throw new Error(`HTTP ${resp.status}: ${txt}`);
        }
        const json = await resp.json();
        setData(json.data || null);
      } catch (err: any) {
        setError(err?.message || "Failed to fetch summary data");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h2 className="text-2xl font-semibold mb-4">Summary</h2>
        <p className="text-sm text-gray-600">Loading summary...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h2 className="text-2xl font-semibold mb-4">Summary</h2>
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-gray-100 rounded"
        >
          Back
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8">
        <h2 className="text-2xl font-semibold mb-4">Summary</h2>
        <p className="text-sm text-gray-600">No summary data available.</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-gray-100 rounded"
        >
          Back
        </button>
      </div>
    );
  }

  // Map and display only non-null fields
  const fields: Array<[string, any]> = [
    ["Academic Year", data.academic_year],
    ["Scheme Name", data.Scheme_name || data.Scheme || data.scheme_name],
    ["Application ID", data.Application_id || data.application_id],
    ["Candidate Name", data.candidate_name],
    ["Category", data.Category],
    ["Course Applied", data.Course_applied],
    ["University", data.University],
    ["Status", data.Status || data.status || data.Grant_status],
  ];

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold mb-4">Summary</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map(([label, value]) =>
          value != null ? (
            <div key={label} className="p-4 bg-white border rounded-lg">
              <div className="text-sm text-gray-500">{label}</div>
              <div className="mt-1 font-medium text-gray-800">{Array.isArray(value) ? value.join(', ') : value}</div>
            </div>
          ) : null
        )}

        {data.Rejection_reason && Array.isArray(data.Rejection_reason) && data.Rejection_reason.length > 0 && (
          <div className="p-4 bg-white border rounded-lg md:col-span-2">
            <div className="text-sm text-gray-500">Rejection Reasons</div>
            <ul className="mt-2 list-disc list-inside text-gray-800">
              {data.Rejection_reason.map((r: string, i: number) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-100 rounded"
        >
          Back
        </button>
      </div>
    </div>
  );
}
