"use client";

import { BrandLoader } from "@/loader/src/components/BrandLoader";

interface LoaderWrapperProps {
  fullScreen?: boolean;
  message?: string;
  className?: string;
}

export default function LoaderWrapper({
  fullScreen = false,
  message,
  className = "",
}: LoaderWrapperProps) {
  const backgroundGradient =
    "radial-gradient(at 51% 67%, hsla(216,71%,87%,1) 0px, transparent 50%)," +
    "radial-gradient(at 34% 21%, hsla(214,83%,92%,1) 0px, transparent 50%)," +
    "radial-gradient(at 56% 37%, hsla(205,100%,98%,1) 0px, transparent 50%)," +
    "radial-gradient(at 1% 2%, hsla(217,65%,69%,1) 0px, transparent 50%)," +
    "radial-gradient(at 8% 75%, hsla(217,65%,71%,1) 0px, transparent 50%)," +
    "radial-gradient(at 67% 94%, hsla(217,65%,73%,1) 0px, transparent 50%)," +
    "radial-gradient(at 0% 98%, hsla(209,89%,60%,1) 0px, transparent 50%)";

  if (fullScreen) {
    return (
      <div
        className={`fixed inset-0 z-[9999] flex items-center justify-center ${
          className || "bg-white/80 backdrop-blur-md"
        }`}
        style={{
          backgroundImage: backgroundGradient,
          backgroundColor: "#C9D7FF",
        }}
      >
        <div className="flex flex-col items-center gap-4">
          <BrandLoader />
          {message && (
            <p className="text-slate-700 text-lg font-medium">{message}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <BrandLoader />
      {message && (
        <p className="text-slate-700 text-lg font-medium ml-4">{message}</p>
      )}
    </div>
  );
}

