import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";
import enrollIQLogo from "../assets/d5ee77f5365928905cb0568672b3db2752215004.png";

export function BrandLoader() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0; // Loop back for demo purposes
        }
        return prev + 1;
      });
    }, 30);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      {/* EnrollIQ Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{
          opacity: 1,
          scale: [1, 1.05, 1],
        }}
        transition={{
          opacity: { duration: 0.5 },
          scale: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
        className="relative"
      >
        <motion.div className="relative">
          <Image
            src={enrollIQLogo}
            alt="EnrollIQ"
            width={96}
            height={96}
            className="object-contain"
          />
        </motion.div>
        {/* Pulsing Ring Effect */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(59, 130, 246, 0.7)",
              "0 0 0 30px rgba(59, 130, 246, 0)",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
        {/* Rotating Border */}
        <motion.div
          className="absolute -inset-2 rounded-full border-2 border-transparent border-t-blue-500 border-r-blue-400"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </motion.div>

      {/* Progress Bar Container */}
      <div className="w-64 flex flex-col items-center gap-2">
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        {/* Progress Text */}
        <span className="text-sm text-gray-600">{progress}%</span>
      </div>

      {/* Loading Text */}
      <motion.div
        className="flex items-center gap-1"
        animate={{
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <span className="text-blue-600">getting the summary of your application</span>
        <motion.span
          animate={{
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          ...
        </motion.span>
      </motion.div>
    </div>
  );
}
