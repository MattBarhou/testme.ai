"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function AnimatedBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-blue-800/40 dark:via-purple-800/40 dark:to-pink-800/40" />

      {/* Animated blobs */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full bg-blue-300/60 dark:bg-blue-500/30 blur-2xl"
        animate={{
          x: [0, 100, 50, 0],
          y: [0, 50, 100, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        style={{
          left: "10%",
          top: "20%",
        }}
      />

      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full bg-purple-300/60 dark:bg-purple-500/30 blur-2xl"
        animate={{
          x: [0, -70, -40, 0],
          y: [0, 60, 120, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        style={{
          right: "15%",
          top: "10%",
        }}
      />

      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full bg-pink-300/50 dark:bg-pink-500/30 blur-2xl"
        animate={{
          x: [0, 80, 40, 0],
          y: [0, -50, -100, 0],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        style={{
          left: "30%",
          bottom: "10%",
        }}
      />

      {/* Mouse follower */}
      <motion.div
        className="absolute w-[300px] h-[300px] rounded-full bg-teal-300/50 dark:bg-teal-500/30 blur-2xl pointer-events-none"
        animate={{
          x: mousePosition.x - 150,
          y: mousePosition.y - 150,
        }}
        transition={{
          type: "spring",
          damping: 30,
          stiffness: 200,
          mass: 0.5,
        }}
      />
    </div>
  );
}
