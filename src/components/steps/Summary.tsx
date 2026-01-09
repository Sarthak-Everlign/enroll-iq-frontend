// "use client";

// import { useEffect, useState } from "react";
// import { getAuthToken } from "@/lib/api";
// import { ArrowLeft } from "lucide-react";

// interface SummaryProps {
//   onBack: () => void;
//   applicationData?: any;
// }

// export default function Summary({ onBack, applicationData }: SummaryProps) {
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [data, setData] = useState<any>(null);

//   useEffect(() => {
//     async function load() {
//       setLoading(true);
//       setError(null);
//       try {
//         const token = getAuthToken();
//         const base = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
//         const resp = await fetch(`${base}/api/application/summary-data`, {
//           headers: token ? { Authorization: `Bearer ${token}` } : {},
//         });
//         if (!resp.ok) {
//           const txt = await resp.text();
//           throw new Error(`HTTP ${resp.status}: ${txt}`);
//         }
//         const json = await resp.json();
//         setData(json.data || null);
//       } catch (err: any) {
//         setError(err?.message || "Failed to fetch summary data");
//       } finally {
//         setLoading(false);
//       }
//     }

//     load();
//   }, []);

//   if (loading) {
//     return (
//       <div className="p-8">
//         <h2 className="text-2xl font-semibold mb-4">Application Summary</h2>
//         <p className="text-sm text-gray-600">Loading summary...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="p-8">
//         <h2 className="text-2xl font-semibold mb-4">Application Summary</h2>
//         <p className="text-sm text-red-600">{error}</p>
//         <button
//           onClick={onBack}
//           className="mt-4 px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 transition"
//         >
//           Back
//         </button>
//       </div>
//     );
//   }

//   if (!data) {
//     return (
//       <div className="p-8">
//         <h2 className="text-2xl font-semibold mb-4">Application Summary</h2>
//         <p className="text-sm text-gray-600">No summary data available.</p>
//         <button
//           onClick={onBack}
//           className="mt-4 px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 transition"
//         >
//           Back
//         </button>
//       </div>
//     );
//   }

//   // Map and display only non-null fields
//   const fields: Array<[string, any]> = [
//     ["Academic Year", data.academic_year],
//     ["Scheme Name", data.Scheme_name || data.Scheme || data.scheme_name],
//     ["Application ID", data.Application_id || data.application_id],
//     ["Candidate Name", data.candidate_name],
//     ["Category", data.Category],
//     ["Course Applied", data.Course_applied],
//     ["University", data.University],
//     ["Status", data.Status || data.status || data.Grant_status],
//   ];

//   return (
//     <div>
//       <div className="mb-6">
//         <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
//           Application Summary
//         </h2>
//         <p className="text-gray-600">
//           Review your complete application details below
//         </p>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         {fields.map(([label, value]) =>
//           value != null ? (
//             <div key={label} className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition">
//               <div className="text-sm text-gray-500 font-medium">{label}</div>
//               <div className="mt-2 font-semibold text-gray-800">
//                 {Array.isArray(value) ? value.join(", ") : value}
//               </div>
//             </div>
//           ) : null
//         )}

//         {data.Rejection_reason &&
//           Array.isArray(data.Rejection_reason) &&
//           data.Rejection_reason.length > 0 && (
//             <div className="p-4 bg-red-50 border border-red-200 rounded-lg md:col-span-2">
//               <div className="text-sm text-red-700 font-medium">
//                 Rejection Reasons
//               </div>
//               <ul className="mt-2 list-disc list-inside text-red-600 space-y-1">
//                 {data.Rejection_reason.map((r: string, i: number) => (
//                   <li key={i} className="text-sm">
//                     {r}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//       </div>

//       <div className="mt-8 flex gap-3">
//         <button
//           onClick={onBack}
//           className="inline-flex items-center gap-2 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
//         >
//           <ArrowLeft className="w-4 h-4" />
//           Back
//         </button>
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { getAuthToken } from "@/lib/api";
import { ArrowLeft } from "lucide-react";
import { usePDFDownload } from "./usePDFDownload";

interface SummaryProps {
  onBack: () => void;
  applicationData?: any;
}

export default function Summary({ onBack, applicationData }: SummaryProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const { downloadPDF, isDownloading } = usePDFDownload();

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

  const handleDownloadPDF = () => {
    if (!data) return;
    downloadPDF(applicationData.id, applicationData);
  };

  if (loading) {
    return (
      <div className="p-8">
        <h2 className="text-2xl font-semibold mb-4">Application Summary</h2>
        <p className="text-sm text-gray-600">Loading summary...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h2 className="text-2xl font-semibold mb-4">Application Summary</h2>
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 transition"
        >
          Back
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8">
        <h2 className="text-2xl font-semibold mb-4">Application Summary</h2>
        <p className="text-sm text-gray-600">No summary data available.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 transition"
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
    <div>
      <div className="mb-6">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
          Application Summary
        </h2>
        <p className="text-gray-600">
          Review your complete application details below
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map(([label, value]) =>
          value != null ? (
            <div
              key={label}
              className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition"
            >
              <div className="text-sm text-gray-500 font-medium">{label}</div>
              <div className="mt-2 font-semibold text-gray-800">
                {Array.isArray(value) ? value.join(", ") : value}
              </div>
            </div>
          ) : null
        )}

        {data.Rejection_reason &&
          Array.isArray(data.Rejection_reason) &&
          data.Rejection_reason.length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg md:col-span-2">
              <div className="text-sm text-red-700 font-medium">
                Rejection Reasons
              </div>
              <ul className="mt-2 list-disc list-inside text-red-600 space-y-1">
                {data.Rejection_reason.map((r: string, i: number) => (
                  <li key={i} className="text-sm">
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
      </div>

      <div className="mt-8 flex gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <button
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm hover:shadow"
        >
          {isDownloading ? (
            <>
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Generating PDF...
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Download PDF
            </>
          )}
        </button>
      </div>
    </div>
  );
}
