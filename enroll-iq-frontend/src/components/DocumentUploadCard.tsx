"use client";

import { useState, useRef } from "react";
import {
  Upload,
  File,
  X,
  Check,
  AlertCircle,
  Loader2,
  Shield,
  AlertTriangle,
} from "lucide-react";
import { clsx } from "clsx";
import type { VerificationResponse } from "@/lib/api";

interface DocumentUploadCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  accept?: string;
  required?: boolean;
  maxSizeMB?: number;
  onUpload: (file: File) => Promise<VerificationResponse>;
  onVerificationComplete?: (result: VerificationResponse) => void;
}

type UploadStatus =
  | "idle"
  | "uploading"
  | "verifying"
  | "success"
  | "error"
  | "ineligible";

export default function DocumentUploadCard({
  title,
  description,
  icon,
  accept = ".pdf,.jpg,.jpeg,.png",
  required = false,
  maxSizeMB = 5,
  onUpload,
  onVerificationComplete,
}: DocumentUploadCardProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] =
    useState<VerificationResponse | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (selectedFile: File | null) => {
    setError(null);
    setVerificationResult(null);

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

    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    setStatus("verifying");

    try {
      const result = await onUpload(selectedFile);
      setVerificationResult(result);

      if (result.success && result.is_eligible === true) {
        setStatus("success");
      } else if (result.success && result.is_eligible === false) {
        setStatus("ineligible");
      } else if (!result.success) {
        setStatus("error");
        setError(result.message);
      } else {
        // is_eligible is null (manual verification needed)
        setStatus("success");
      }

      onVerificationComplete?.(result);
    } catch (err) {
      setStatus("error");
      setError("Verification failed. Please try again.");
    }
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
    setVerificationResult(null);
    if (inputRef.current) {
      inputRef.current.value = "";
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
        return "border-green-200 bg-green-50/50";
      case "ineligible":
        return "border-red-200 bg-red-50/50";
      case "error":
        return "border-red-200 bg-red-50/50";
      case "verifying":
        return "border-blue-200 bg-blue-50/50";
      case "uploading":
        return "border-blue-200 bg-blue-50/50";
      default:
        return "border-gray-100 bg-white hover:border-gray-200";
    }
  };

  return (
    <div
      className={clsx(
        "p-6 rounded-2xl border-2 transition-all duration-300",
        getStatusColor()
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div
          className={clsx(
            "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
            status === "success"
              ? "bg-gradient-to-br from-green-400 to-emerald-500 text-white"
              : status === "ineligible"
              ? "bg-gradient-to-br from-red-400 to-rose-500 text-white"
              : status === "error"
              ? "bg-gradient-to-br from-red-400 to-rose-500 text-white"
              : status === "verifying"
              ? "bg-gradient-to-br from-blue-400 to-indigo-500 text-white"
              : "bg-gray-100 text-gray-500"
          )}
        >
          {status === "verifying" ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : status === "success" ? (
            <Check className="w-6 h-6" />
          ) : status === "ineligible" || status === "error" ? (
            <AlertTriangle className="w-6 h-6" />
          ) : (
            icon
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-800">{title}</h3>
            {required && <span className="text-red-500 text-sm">*</span>}
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        </div>
      </div>

      {/* Upload Area or File Display */}
      {status === "idle" ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={clsx(
            "upload-zone rounded-xl p-4 cursor-pointer transition-all duration-300",
            isDragOver && "dragover scale-[1.02]"
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
            className="hidden"
          />

          <div className="flex items-center gap-3 text-center">
            <div
              className={clsx(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                isDragOver
                  ? "bg-gradient-to-br from-pink-500 to-purple-500 text-white"
                  : "bg-gray-100 text-gray-400"
              )}
            >
              <Upload className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-sm text-gray-700">
                <span className="text-pink-600 font-medium">
                  Click to upload
                </span>{" "}
                or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                PDF, JPG, PNG (max {maxSizeMB}MB)
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* File Info */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/50 border border-gray-100">
            <File className="w-5 h-5 text-gray-400" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {file?.name}
              </p>
              <p className="text-xs text-gray-500">
                {file && formatFileSize(file.size)}
              </p>
            </div>
            {status !== "uploading" && status !== "verifying" && (
              <button
                type="button"
                onClick={handleRemove}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status Message */}
          {status === "uploading" && (
            <div className="flex items-center gap-2 text-blue-600 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading document...
            </div>
          )}

          {status === "verifying" && (
            <div className="flex items-center gap-2 text-blue-600 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Verifying document...
            </div>
          )}

          {status === "success" && verificationResult && (
            <div className="p-3 rounded-xl bg-green-50 border border-green-100">
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-700">
                    Verified Successfully
                  </p>
                  <p className="text-xs text-green-600 mt-0.5">
                    {verificationResult.message}
                  </p>
                </div>
              </div>
              {verificationResult.data && (
                <div className="mt-2 pt-2 border-t border-green-100">
                  {verificationResult.data.formatted_income && (
                    <p className="text-xs text-green-700">
                      <span className="font-medium">Income:</span>{" "}
                      {String(verificationResult.data.formatted_income)}
                    </p>
                  )}
                  {verificationResult.data.category && (
                    <p className="text-xs text-green-700">
                      <span className="font-medium">Category:</span>{" "}
                      {String(verificationResult.data.category)}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {status === "ineligible" && verificationResult && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-100">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-700">
                    Not Eligible
                  </p>
                  <p className="text-xs text-red-600 mt-0.5">
                    {verificationResult.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && status === "error" && (
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
