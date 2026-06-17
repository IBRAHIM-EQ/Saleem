/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from "react";
import { T } from "../constants";
import { motion, AnimatePresence } from "motion/react";

interface ToastProps {
  message: string;
  type?: "success" | "error";
  onDone: () => void;
}

export function Toast({ message, type = "success", onDone }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDone, 2600);
    return () => clearTimeout(t);
  }, [onDone]);

  const bg = type === "success" ? T.mintLight : "#fff0f2";
  const border = type === "success" ? T.mintMid : "#f5c0c7";
  const color = type === "success" ? T.mintDark : T.red;
  const icon = type === "success" ? "✓" : "✕";

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      style={{
        position: "fixed",
        bottom: 28,
        right: 28,
        zIndex: 9999,
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 8,
        padding: "12px 18px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontSize: 13,
        fontWeight: 600,
        color,
        boxShadow: "0 4px 16px rgba(22,32,46,0.12)",
      }}
    >
      <span style={{ fontWeight: 700 }}>{icon}</span> {message}
    </motion.div>
  );
}
