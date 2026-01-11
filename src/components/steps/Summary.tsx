"use client";

import { useEffect, useState } from "react";
import { getAuthToken } from "@/lib/api";
import { ArrowLeft } from "lucide-react";
import { usePDFDownload } from "./usePDFDownload";
import { getApplication } from "@/lib/api";

interface SummaryProps {
  onBack: () => void;
  applicationData?: any;
}

export default function Summary({ onBack }: SummaryProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [validationReasons, setValidationReasons] = useState<string[]>([]);
  const loadValidationReasons = (appId: string | null | undefined) => {
    if (!appId || typeof window === "undefined") return;

    try {
      const reasonsKey = `validationReasons_${appId}`;
      const storedReasons = sessionStorage.getItem(reasonsKey);
      if (storedReasons) {
        const parsed = JSON.parse(storedReasons);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setValidationReasons(parsed);
        }
      }
    } catch (e) {
      console.error(
        "Failed to load validation reasons from sessionStorage:",
        e
      );
    }
  };

  const [applicationData, setApplicationData] = useState<any>(null);

  // Load validation reasons from sessionStorage on mount
  useEffect(() => {
    const applicationId =
      applicationData?.application_id || applicationData?.id;
    loadValidationReasons(applicationId);
  }, [applicationData]);
  const { downloadPDF, isDownloading } = usePDFDownload();
  const [verificationResults, setVerificationResults] = useState<any | null>(null);
  const [isLoadingVerification, setIsLoadingVerification] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

        const response_application = await getApplication();
        setApplicationData(response_application.data);
        if (!resp.ok) {
          const txt = await resp.text();
          throw new Error(`HTTP ${resp.status}: ${txt}`);
        }
        const json = await resp.json();
        setData(json.data || null);

        // Try to load validation reasons from sessionStorage after data loads
        // (in case applicationId comes from API response)
        const applicationId =
          json.data?.Application_id ||
          json.data?.application_id ||
          applicationData?.application_id ||
          applicationData?.id;

        loadValidationReasons(applicationId);
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

  const fetchVerificationData = async () => {
    if (!applicationData && !data) return;
    const appId = applicationData?.id || data?.application_id || data?.Application_id;
    if (!appId) return;

    try {
      setIsLoadingVerification(true);
      const token = getAuthToken();
      const base = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const url = `${base}/api/application/verification-data?application_id=${encodeURIComponent(
        String(appId)
      )}`;
      const resp = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(`HTTP ${resp.status}: ${txt}`);
      }
      const json = await resp.json();
      const raw = json.data || json;

      // API may return verification_result as a JSON-encoded string.
      let result: any = raw;
      try {
        const vr = raw?.verification_result ?? raw?.verificationResult ?? null;
        if (typeof vr === "string") {
          result = JSON.parse(vr);
        } else if (vr != null) {
          result = vr;
        } else if (typeof raw === "string") {
          // Some endpoints may return a JSON string directly
          result = JSON.parse(raw);
        }
      } catch (e) {
        // If parsing fails, fall back to raw value
        console.warn("Failed to parse verification_result, using raw response", e);
        result = raw;
      }

      setVerificationResults(result);

      // Emit a DOM event so other components (if any) can pick it up
      try {
        const ev = new CustomEvent("verificationDataLoaded", { detail: { application_id: appId, data: result } });
        window.dispatchEvent(ev);
      } catch (e) {
        // ignore in non-browser environments
      }
      // Also persist to sessionStorage so other components can read it
      try {
        const key = `verificationResults_${appId}`;
        sessionStorage.setItem(key, JSON.stringify(result));
      } catch (e) {
        // ignore storage errors
      }
    } catch (err: any) {
      console.error("Failed to fetch verification data:", err);
    } finally {
      setIsLoadingVerification(false);
    }
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

  // Get application status (check both data and applicationData)
  const applicationStatus =
    data?.Status ||
    data?.status ||
    data?.Grant_status ||
    applicationData?.application_status ||
    "";

  // Determine if we should show Grant Status based on conditions:
  // - NOT if status is "rejected"
  // - NOT if status is "in_progress"
  const statusLower = applicationStatus?.toLowerCase() || "";
  const shouldShowGrantStatus =
    statusLower !== "rejected" && statusLower !== "in_progress";

  // Map and display only non-null fields
  const fields: Array<[string, any]> = [
    ["Academic Year", data.academic_year],
    ["Scheme Name", data.Scheme_name || data.Scheme || data.scheme_name],
    ["Application ID", data.Application_id || data.application_id],
    ["Candidate Name", data.candidate_name],
    ["Category", data.Category],
    ["Course Applied", data.Course_applied],
    ["University", data.University],
    ["Enrollment Status", data.Status || data.status],
    ...(shouldShowGrantStatus ? [["Grant Status", "Verification Completed"] as [string, any]] : []),
  ];

  // Only show rejection reasons if status is "rejected"
  const isRejected = applicationStatus?.toLowerCase() === "rejected";
  const hasRejectionReasons =
    (data.Rejection_reason &&
      Array.isArray(data.Rejection_reason) &&
      data.Rejection_reason.length > 0) ||
    (isRejected && validationReasons.length > 0);

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

      {/* Verification Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-start justify-center" onClick={() => setIsModalOpen(false)}>
          <div
            className="relative bg-white rounded-lg shadow-lg overflow-auto max-h-[76.5vh] max-w-5xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">Verifications by Source</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1 text-sm bg-slate-100 rounded hover:bg-slate-200"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="p-6">
              {isLoadingVerification && !verificationResults ? (
                <div className="text-sm text-slate-600">Loading verification data...</div>
              ) : !verificationResults || Object.keys(verificationResults).length === 0 ? (
                <div className="text-sm text-slate-600">No verification results available.</div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {Object.entries(verificationResults).map(([docType, arr]: [string, any]) => {
                    if (!Array.isArray(arr) || arr.length === 0) return null;
                    const latest = arr[arr.length - 1];
                    const verificationValue = latest?.result?.verification;
                    const verificationState =
                      verificationValue === true
                        ? "verified"
                        : verificationValue === false
                        ? "failed"
                        : "inprogress";

                    const label = ((): string => {
                      switch (docType) {
                        case "form16":
                          return "3.1 Form 16 (Income)";
                        case "marksheet10th":
                          return "3.2 marksheet10th";
                        case "marksheet12th":
                          return "3.3 marksheet12th";
                        case "graduation":
                          return "3.4 graduation";
                        case "caste_certificate":
                          return "Caste Certificate";
                        default:
                          return docType;
                      }
                    })();

                    const dataReceived = latest?.data_received || {};
                    const reason = latest?.result?.reason || null;
                    const verificationType = latest?.verification_type || latest?.result?.verification_type || "Unknown";

                    return (
                      <div key={docType} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="text-sm font-semibold text-slate-900">{label}</h4>
                            <p className="text-xs text-slate-600 mt-1">{verificationType}</p>
                          </div>
                          {verificationState === "verified" && (
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <span className="text-xs font-semibold text-green-700">Verified</span>
                            </div>
                          )}
                          {verificationState === "failed" && (
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <span className="text-xs font-semibold text-red-700">Not Verified</span>
                            </div>
                          )}
                          {verificationState === "inprogress" && (
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center"><span className="text-white text-xs font-bold">⏳</span></div>
                              <span className="text-xs font-semibold text-amber-700">In Progress</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          {reason && (
                            <div className="rounded-lg bg-yellow-50 border border-yellow-200 px-3 py-2">
                              <p className="text-xs text-yellow-800"><span>Status Details:</span><br /><span>{reason}</span></p>
                            </div>
                          )}

                          {Object.keys(dataReceived).length > 0 && (
                            <div className="space-y-2 pt-3 border-t border-gray-200">
                              {Object.entries(dataReceived).map(([key, value]) => (
                                <div key={key} className="flex justify-between items-center">
                                  <span className="text-xs text-slate-600 capitalize">{key.replace(/_/g, " ")}:</span>
                                  <span className="text-xs font-semibold text-slate-900 text-right">{typeof value === "number" ? value.toLocaleString("en-IN") : String(value)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map(([label, value]) =>
          value != null ? (
            <div
              key={label}
              className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div className="text-sm text-gray-500 font-medium">{label}</div>
                {label === "Grant Status" && value && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(true);
                      if (!verificationResults) fetchVerificationData();
                    }}
                    disabled={isLoadingVerification}
                    className={`ml-2 px-3 py-1 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 rounded hover:bg-blue-100 disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    {isLoadingVerification ? "Loading..." : "View"}
                  </button>
                )}
              </div>
              <div className="mt-2 font-semibold text-gray-800">
                {Array.isArray(value) ? value.join(", ") : value}
              </div>
            </div>
          ) : null
        )}

        {/* Only show rejection reasons when application status is "rejected" */}
        {isRejected && hasRejectionReasons && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg md:col-span-2">
            <div className="text-sm text-red-700 font-medium mb-2">
              Rejection Reasons
            </div>
            <ul className="list-disc list-inside text-red-600 space-y-1">
              {/* Display API rejection reasons first */}
              {data.Rejection_reason &&
                Array.isArray(data.Rejection_reason) &&
                data.Rejection_reason.length > 0 &&
                data.Rejection_reason.map((r: string, i: number) => (
                  <li key={`api-${i}`} className="text-sm">
                    {r}
                  </li>
                ))}
              {/* Display validation reasons from sessionStorage */}
              {validationReasons.length > 0 &&
                validationReasons.map((reason, i) => (
                  <li key={`validation-${i}`} className="text-sm">
                    {reason}
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
