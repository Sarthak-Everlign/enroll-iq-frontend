"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Camera,
  CameraOff,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Video,
  Shield,
  Sparkles,
  Info,
  RefreshCw,
} from "lucide-react";
import { checkS3FileExists } from "@/lib/api";

interface VideoKYCProps {
  onNext: (kycData: KYCData | null) => void;
  onBack: () => void;
  userName: string;
  applicationId?: string;
}

export interface KYCData {
  photo: string;
  timestamp: string;
  verified: boolean;
  s3Key?: string;
  s3Url?: string;
  uniqueIdentifier?: string;
}

type KYCStep =
  | "instructions"
  | "capture"
  | "review"
  | "complete"
  | "alreadyDone";

export default function VideoKYC({
  onNext,
  onBack,
  userName,
  applicationId,
}: VideoKYCProps) {
  const [step, setStep] = useState<KYCStep>("instructions");
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [existingKycFile, setExistingKycFile] = useState<{
    s3Key: string;
    s3Url: string;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Check if selfie file already exists on mount
  useEffect(() => {
    if (applicationId && step === "instructions") {
      checkExistingKyc();
    }
  }, [applicationId]);

  const checkExistingKyc = async () => {
    if (!applicationId) return;

    setIsChecking(true);
    try {
      const result = await checkS3FileExists(
        `enroll_iq_files/submission_files/{applicationId}/KYC/`,
        {
          applicationId,
        }
      );

      if (result.exists && result.data) {
        setExistingKycFile({
          s3Key: result.data.s3Key,
          s3Url: result.data.s3Url,
        });
        setStep("alreadyDone");
      }
    } catch (err) {
      console.error("Error checking existing selfie:", err);
    } finally {
      setIsChecking(false);
    }
  };

  const handleRedoKyc = () => {
    setExistingKycFile(null);
    setStep("instructions");
  };

  // Instructions for Selfie Verification
  const instructions = [
    "Ensure good lighting on your face",
    "Keep your face centered in the frame",
    "Look directly at the camera",
    "Remove glasses, caps, or anything covering your face",
    "Maintain a neutral expression",
  ];

  // Start camera stream
  const startCamera = useCallback(async () => {
    try {
      setError("");
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
      });

      setStream(mediaStream);
      setHasPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setHasPermission(false);
      setError(
        "Unable to access camera. Please grant camera permission and try again."
      );
    }
  }, []);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Capture photo with countdown
  const startCapture = () => {
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      capturePhoto();
      setCountdown(null);
    }
  }, [countdown]);

  // Capture photo from video stream
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = canvas.toDataURL("image/jpeg", 0.8);
        setCapturedImage(imageData);
        setStep("review");
        stopCamera();
      }
    }
  };

  // Retake photo
  const retakePhoto = () => {
    setCapturedImage(null);
    setStep("capture");
    startCamera();
  };

  // Convert base64 to File
  const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  // Submit Selfie
  const handleSubmit = async () => {
    if (!capturedImage) return;

    if (!applicationId) {
      setError("Application ID is required. Please try again.");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      // Convert base64 image to File
      const imageFile = dataURLtoFile(capturedImage, "selfie-photo.jpg");

      // Create FormData
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append(
        "path",
        `enroll_iq_files/submission_files/{applicationId}/KYC/`
      );
      formData.append("applicationId", applicationId);

      // Upload to S3 via API route
      const response = await fetch("/api/upload-s3", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to upload selfie");
      }

      // Success - proceed to complete step
      setStep("complete");
      setTimeout(() => {
        onNext({
          photo: capturedImage,
          timestamp: new Date().toISOString(),
          verified: true,
          s3Key: result.data?.s3Key,
          s3Url: result.data?.s3Url,
          uniqueIdentifier: result.data?.uniqueIdentifier,
        });
      }, 2000);
    } catch (err) {
      console.error("Upload error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to upload selfie. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="h-8 w-1.5 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full" />
        <h2 className="text-2xl font-bold text-gray-800">
          Selfie Verification
        </h2>
        <Video className="w-5 h-5 text-purple-500" />
      </div>

      {step === "alreadyDone" && existingKycFile && (
        <div className="space-y-6">
          {/* Already Done Card */}
          <div className="max-w-2xl mx-auto bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-green-900 mb-2">
                  Selfie Verification Already Completed
                </h3>
                <p className="text-green-700">
                  Your selfie verification has already been completed and
                  uploaded.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>

            <button
              onClick={handleRedoKyc}
              className="flex items-center gap-3 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              style={{
                backgroundImage:
                  "linear-gradient(#81E5FF -22.92%, rgba(254, 200, 241, 0) 26.73%), radial-gradient(137.13% 253.39% at 76.68% 66.67%, #3644CF 0%, #85F3FF 100%)",
                boxShadow: "0 10px 24px rgba(54, 68, 207, 0.35)",
              }}
            >
              <RefreshCw className="w-5 h-5" />
              Take Selfie Again
            </button>

            <button
              onClick={() => {
                onNext({
                  photo: "",
                  timestamp: new Date().toISOString(),
                  verified: true,
                  s3Key: existingKycFile.s3Key,
                  s3Url: existingKycFile.s3Url,
                });
              }}
              className="flex items-center gap-3 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:shadow-xl hover:scale-105 btn-gradient btn-shine"
            >
              Continue with Existing Selfie
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {step === "instructions" && (
        <div className="space-y-8">
          {/* Checking Status */}
          {isChecking && (
            <div className="max-w-2xl mx-auto bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-3 text-blue-700">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Checking for existing selfie...</span>
              </div>
            </div>
          )}

          {/* Welcome Card */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-purple-900 text-lg mb-2">
                  Hello, {userName}!
                </h3>
                <p className="text-purple-700">
                  Complete your selfie verification by taking a photo of yourself.
                  This helps us verify your identity securely.
                </p>
              </div>
            </div>
          </div>

          {/* Instructions List */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-500" />
                Instructions
              </h3>
            </div>
            <div className="p-6">
              <ul className="space-y-4">
                {instructions.map((instruction, index) => (
                  <li key={index} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <span className="text-gray-700 pt-1">{instruction}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Reference Image */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Reference Example
              </h3>
            </div>
            <div className="p-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Sample Reference Image */}
                <div className="w-64 h-48 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl border-2 border-dashed border-blue-300 flex flex-col items-center justify-center">
                  <div className="relative">
                    {/* Face outline */}
                    <div className="w-20 h-24 border-4 border-purple-400 rounded-full" />
                  </div>
                  <p className="text-purple-600 text-sm font-medium mt-4">
                    Position like this
                  </p>
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm">Face clearly visible</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm">Centered in frame</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm">Good lighting</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm">Looking at camera</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>

            <div className="flex items-center gap-4">
              {/* <button
                onClick={() => onNext(null)}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-medium transition-colors px-4 py-2"
              >
                Skip for now
                <ArrowRight className="w-4 h-4" />
              </button> */}

              <button
                onClick={() => {
                  setStep("capture");
                  startCamera();
                }}
                className="flex items-center gap-3 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                style={{
                  backgroundImage:
                    "linear-gradient(#81E5FF -22.92%, rgba(254, 200, 241, 0) 26.73%), radial-gradient(137.13% 253.39% at 76.68% 66.67%, #3644CF 0%, #85F3FF 100%)",
                  boxShadow: "0 10px 24px rgba(54, 68, 207, 0.35)",
                }}
              >
                Start Camera
                <Camera className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {step === "capture" && (
        <div className="space-y-6">
          {/* Camera View */}
          <div className="relative bg-black rounded-2xl overflow-hidden aspect-video max-w-2xl mx-auto shadow-2xl">
            {hasPermission === false ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white p-8 text-center">
                <CameraOff className="w-16 h-16 text-red-400 mb-4" />
                <h3 className="text-xl font-bold mb-2">Camera Access Denied</h3>
                <p className="text-gray-400 mb-4">{error}</p>
                <button
                  onClick={startCamera}
                  className="px-6 py-3 bg-purple-500 hover:bg-purple-600 rounded-xl font-medium transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform scale-x-[-1]"
                />

                {/* Overlay guides */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Face outline guide */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-52 border-4 border-white/50 rounded-full" />

                  {/* Corner guides */}
                  <div className="absolute top-4 left-4 w-12 h-12 border-l-4 border-t-4 border-purple-500 rounded-tl-xl" />
                  <div className="absolute top-4 right-4 w-12 h-12 border-r-4 border-t-4 border-purple-500 rounded-tr-xl" />
                  <div className="absolute bottom-4 left-4 w-12 h-12 border-l-4 border-b-4 border-purple-500 rounded-bl-xl" />
                  <div className="absolute bottom-4 right-4 w-12 h-12 border-r-4 border-b-4 border-purple-500 rounded-br-xl" />
                </div>

                {/* Countdown overlay */}
                {countdown !== null && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-8xl font-bold text-white animate-pulse">
                      {countdown > 0 ? countdown : "📸"}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Hidden canvas for capture */}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Instructions reminder */}
          <div className="max-w-2xl mx-auto bg-purple-50 rounded-xl p-4 border border-purple-200">
            <p className="text-purple-700 text-sm text-center">
              Position your face in the oval guide and look directly at the camera
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <button
              onClick={() => {
                stopCamera();
                setStep("instructions");
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Instructions
            </button>

            <button
              onClick={startCapture}
              disabled={!hasPermission || countdown !== null}
              className="flex items-center gap-3 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundImage:
                  "linear-gradient(#81E5FF -22.92%, rgba(254, 200, 241, 0) 26.73%), radial-gradient(137.13% 253.39% at 76.68% 66.67%, #3644CF 0%, #85F3FF 100%)",
                boxShadow: "0 10px 24px rgba(54, 68, 207, 0.35)",
              }}
            >
              <Camera className="w-6 h-6" />
              Capture Photo
            </button>
          </div>
        </div>
      )}

      {step === "review" && capturedImage && (
        <div className="space-y-8">
          {/* Captured Image Review */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-200">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">
                  Review Your Photo
                </h3>
              </div>
              <div className="p-4">
                <img
                  src={capturedImage}
                  alt="Captured Selfie"
                  className="w-full rounded-xl transform scale-x-[-1]"
                />
              </div>
            </div>
          </div>

          {/* Checklist */}
          {/* <div className="max-w-2xl mx-auto bg-gray-50 rounded-2xl p-6 border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-4">Please verify:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="checkbox-custom"
                  defaultChecked
                />
                <span className="text-gray-700">Face is clearly visible</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="checkbox-custom"
                  defaultChecked
                />
                <span className="text-gray-700">Aadhaar card is visible</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="checkbox-custom"
                  defaultChecked
                />
                <span className="text-gray-700">Photo is not blurry</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="checkbox-custom"
                  defaultChecked
                />
                <span className="text-gray-700">Good lighting</span>
              </label>
            </div>
          </div> */}

          {/* Error message */}
          {error && (
            <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <button
              onClick={retakePhoto}
              disabled={isUploading}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-5 h-5" />
              Retake Photo
            </button>

            <button
              onClick={handleSubmit}
              disabled={isUploading}
              className="flex items-center gap-3 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 btn-gradient btn-shine"
            >
              {isUploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Confirm & Continue
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {step === "complete" && (
        <div className="text-center py-12 animate-fade-in">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Selfie Verification Complete!
          </h2>
          <p className="text-gray-600 mb-6">
            Your selfie has been successfully captured and verified.
          </p>
          <div className="flex items-center justify-center gap-2 text-green-600">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span>Proceeding to document upload...</span>
          </div>
        </div>
      )}
    </div>
  );
}
