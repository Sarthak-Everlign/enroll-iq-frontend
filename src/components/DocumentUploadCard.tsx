"use client";

import { useState, useRef, useEffect } from "react";
import {
  Upload,
  File,
  X,
  Check,
  AlertCircle,
  Loader2,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { clsx } from "clsx";
import type { S3UploadResponse, S3FileExistsResponse } from "@/lib/api";
import { checkS3FileExists } from "@/lib/api";

interface DocumentUploadCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  accept?: string;
  required?: boolean;
  maxSizeMB?: number;
  onUpload: (file: File) => Promise<S3UploadResponse>;
  applicationId?: string;
  documentPath?: string; // S3 path to check for existing file
  fileName?: string; // Optional filename to check
  verificationStatus?: {
    isVerifying: boolean;
    verified: boolean | null;
    result?: any;
    error?: string;
  };
  disabled?: boolean;
}

type UploadStatus =
  | "idle"
  | "checking"
  | "exists"
  | "uploading"
  | "success"
  | "error";

export default function DocumentUploadCard({
  title,
  description,
  icon,
  accept = ".pdf,.jpg,.jpeg,.png",
  required = false,
  maxSizeMB = 5,
  onUpload,
  applicationId,
  documentPath,
  fileName,
  verificationStatus,
  disabled,
}: DocumentUploadCardProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<S3UploadResponse | null>(
    null
  );
  const [existingFile, setExistingFile] = useState<S3FileExistsResponse | null>(
    null
  );
  const [isChecking, setIsChecking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check if file exists on mount
  useEffect(() => {
    if (documentPath && applicationId && !file) {
      checkExistingFile();
    }
  }, [documentPath, applicationId]);

  const checkExistingFile = async () => {
    if (!documentPath || !applicationId) return;

    setIsChecking(true);
    setStatus("checking");

    try {
      const result = await checkS3FileExists(documentPath, {
        applicationId,
        fileName,
      });

      if (result.exists) {
        setExistingFile(result);
        setStatus("exists");
      } else {
        setStatus("idle");
      }
    } catch (err) {
      console.error("Error checking file existence:", err);
      setStatus("idle");
    } finally {
      setIsChecking(false);
    }
  };

  const handleFileSelect = async (selectedFile: File | null) => {
    setError(null);
    setUploadResult(null);
    setExistingFile(null);

    if (!selectedFile) {
      setFile(null);
      setStatus("idle");
      return;
    }

    // Check file size
    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    setFile(selectedFile);
    setStatus("uploading");

    try {
      const result = await onUpload(selectedFile);
      setUploadResult(result);

      if (result.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setError(result.message);
      }
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof Error ? err.message : "Upload failed. Please try again."
      );
    }
  };

  const handleReplaceFile = () => {
    setExistingFile(null);
    setStatus("idle");
    inputRef.current?.click();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleRemove = () => {
    setFile(null);
    setStatus("idle");
    setError(null);
    setUploadResult(null);
    setExistingFile(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    // Re-check for existing file
    if (documentPath && applicationId) {
      checkExistingFile();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getStatusColor = () => {
    switch (status) {
      case "success":
        return "border-green-200 bg-green-50/30";
      case "exists":
        return "border-blue-200 bg-blue-50/30";
      case "error":
        return "border-red-200 bg-red-50/30";
      case "checking":
      case "uploading":
        return "border-blue-200 bg-blue-50/30";
      default:
        return "border-gray-200 bg-white hover:border-gray-300";
    }
  };

  return (
    <div
      className={clsx(
        "p-4 rounded-xl border transition-all duration-300",
        getStatusColor()
      )}
    >
      {/* Header - Compact */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className={clsx(
            "w-10 h-10 rounded-lg flex items-center justify-center transition-colors flex-shrink-0",
            status === "success"
              ? "bg-gradient-to-br from-green-400 to-emerald-500 text-white"
              : status === "exists"
              ? "bg-gradient-to-br from-blue-400 to-indigo-500 text-white"
              : status === "error"
              ? "bg-gradient-to-br from-red-400 to-rose-500 text-white"
              : status === "checking" || status === "uploading"
              ? "bg-gradient-to-br from-blue-400 to-indigo-500 text-white"
              : "bg-gray-100 text-gray-500"
          )}
        >
          {status === "checking" || status === "uploading" ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : status === "success" ? (
            <Check className="w-5 h-5" />
          ) : status === "exists" ? (
            <Check className="w-5 h-5" />
          ) : status === "error" ? (
            <AlertTriangle className="w-5 h-5" />
          ) : (
            <div className="w-5 h-5">{icon}</div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-semibold text-gray-800 text-sm truncate">
              {title}
            </h3>
            {required && <span className="text-red-500 text-xs">*</span>}
          </div>
          <p className="text-xs text-gray-500 truncate">{description}</p>
        </div>
      </div>

      {/* Upload Area or File Display */}
      {status === "exists" && existingFile ? (
        <div className="space-y-2">
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Check className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <p className="text-xs font-medium text-blue-700 truncate">
                  Already uploaded
                </p>
              </div>
              <button
                type="button"
                onClick={handleReplaceFile}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-xs font-medium transition-colors flex-shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Replace
              </button>
            </div>
          </div>

          {/* Verification Status for existing files */}
          {verificationStatus?.isVerifying && (
            <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-blue-50 border border-blue-100">
              <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin flex-shrink-0" />
              <p className="text-xs font-medium text-blue-700">
                Validating document...
              </p>
            </div>
          )}

          {verificationStatus?.verified === true &&
            !verificationStatus?.isVerifying && (
              <div className="flex items-start gap-1.5 px-2 py-1.5 rounded-lg bg-green-50 border border-green-100">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-green-700">
                    Validation successful ✓
                  </p>
                  {verificationStatus?.result?.universityMatch && (
                    <p className="text-xs text-green-600 mt-0.5">
                      {verificationStatus.result.universityMatch}
                    </p>
                  )}
                  {verificationStatus?.result?.data?.university_verification
                    ?.match_reason && (
                    <p className="text-xs text-green-600 mt-0.5">
                      {
                        verificationStatus.result.data.university_verification
                          .match_reason
                      }
                    </p>
                  )}
                </div>
              </div>
            )}

          {verificationStatus?.verified === false &&
            !verificationStatus?.isVerifying && (
              <div className="flex items-start gap-1.5 px-2 py-1.5 rounded-lg bg-red-50 border border-red-100">
                <XCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-red-700">
                    Validation failed
                  </p>
                  {verificationStatus?.result?.message && (
                    <p className="text-xs text-red-600 mt-0.5">
                      {verificationStatus.result.message}
                    </p>
                  )}
                </div>
              </div>
            )}
        </div>
      ) : status === "idle" ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={clsx(
            "upload-zone rounded-lg p-3 cursor-pointer transition-all duration-300 border-2 border-dashed",
            isDragOver
              ? "border-pink-400 bg-pink-50 scale-[1.01]"
              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
          )}
        >
          <input
            disabled={disabled}
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
            className="hidden"
          />

          <div className="flex items-center gap-2.5">
            <div
              className={clsx(
                "w-8 h-8 rounded-lg flex items-center justify-center transition-colors flex-shrink-0",
                isDragOver
                  ? "bg-gradient-to-br from-pink-500 to-purple-500 text-white"
                  : "bg-gray-100 text-gray-400"
              )}
            >
              <Upload className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-700">
                  <span className="text-pink-600 font-medium">Click</span> or
                  drag to upload
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  PDF, JPG, PNG • Max {maxSizeMB}MB
                </p>
              </div>
              <img
                src="/images/digilocker.png"
                alt="DigiLocker"
                className="h-8 w-auto object-contain flex-shrink-0"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {/* File Info - Compact */}
          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white/60 border border-gray-100">
            <File className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-800 truncate">
                {file?.name}
              </p>
              <p className="text-xs text-gray-500">
                {file && formatFileSize(file.size)}
              </p>
            </div>
            {status !== "uploading" && status !== "checking" && (
              <button
                type="button"
                onClick={handleRemove}
                className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Message - Compact */}
          {status === "checking" && (
            <div className="flex items-center gap-1.5 text-blue-600 text-xs px-1">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Checking...</span>
            </div>
          )}

          {status === "uploading" && (
            <div className="flex items-center gap-1.5 text-blue-600 text-xs px-1">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Uploading...</span>
            </div>
          )}

          {status === "success" && uploadResult && (
            <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-green-50 border border-green-100">
              <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
              <p className="text-xs font-medium text-green-700">
                Uploaded successfully
              </p>
            </div>
          )}

          {/* Verification Status */}
          {verificationStatus?.isVerifying && (
            <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-blue-50 border border-blue-100">
              <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin flex-shrink-0" />
              <p className="text-xs font-medium text-blue-700">
                Validating document...
              </p>
            </div>
          )}

          {verificationStatus?.verified === true &&
            !verificationStatus?.isVerifying && (
              <div className="flex items-start gap-1.5 px-2 py-1.5 rounded-lg bg-green-50 border border-green-100">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-green-700">
                    Validation successful ✓
                  </p>
                  {verificationStatus?.result?.universityMatch && (
                    <p className="text-xs text-green-600 mt-0.5">
                      {verificationStatus.result.universityMatch}
                    </p>
                  )}
                  {verificationStatus?.result?.data?.university_verification
                    ?.match_reason && (
                    <p className="text-xs text-green-600 mt-0.5">
                      {
                        verificationStatus.result.data.university_verification
                          .match_reason
                      }
                    </p>
                  )}
                </div>
              </div>
            )}

          {verificationStatus?.verified === false &&
            !verificationStatus?.isVerifying && (
              <div className="flex items-start gap-1.5 px-2 py-1.5 rounded-lg bg-red-50 border border-red-100">
                <XCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-red-700">
                    Validation failed
                  </p>
                  {verificationStatus?.error && (
                    <p className="text-xs text-red-600 mt-0.5">
                      {verificationStatus.error}
                    </p>
                  )}
                  {verificationStatus?.result && (
                    <p className="text-xs text-red-600 mt-0.5">
                      {verificationStatus.result.message ||
                        "Document does not meet eligibility criteria"}
                    </p>
                  )}
                </div>
              </div>
            )}

          {error && status === "error" && (
            <div className="flex items-center gap-1.5 text-red-500 text-xs px-1">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{error}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
