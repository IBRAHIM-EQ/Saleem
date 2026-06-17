/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { T } from "../constants";
import { motion, AnimatePresence } from "motion/react";
import { getUserStorage, storage, USERS_STORAGE_KEY } from "../lib/storage";
import { AlertCircle, CheckCircle2, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

export function ForgotPasswordModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<"email" | "sent" | "reset" | "success">("email");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendEmail = () => {
    if (!email) {
      setError("Please enter your email.");
      return;
    }
    const users = getUserStorage();
    if (!users[email]) {
      setError("No account found with this email address.");
      return;
    }
    
    setLoading(true);
    setTimeout(() => {
      setStep("sent");
      setLoading(false);
    }, 1200);
  };

  const handleReset = () => {
    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const users = getUserStorage();
      if (users[email]) {
        users[email].password = newPassword;
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        setStep("success");
      } else {
        setError("Something went wrong. Please try again.");
      }
      setLoading(false);
    }, 1500);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(11, 21, 38, 0.7)",
        backdropFilter: "blur(8px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        style={{
          background: "white",
          borderRadius: 32,
          width: "100%",
          maxWidth: 420,
          padding: 40,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          border: "1px solid rgba(255,255,255,0.1)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <AnimatePresence mode="wait">
          {step === "email" && (
            <motion.div
              key="email"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(58, 110, 242, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
                <Mail size={32} color={T.blue} />
              </div>
              <h2 style={{ fontFamily: "Sora, sans-serif", fontSize: 24, fontWeight: 800, color: T.text, marginBottom: 12 }}>Reset Password</h2>
              <p style={{ fontSize: 14, color: T.textMid, lineHeight: 1.6, marginBottom: 32 }}>
                Enter the email address associated with your account and we'll send you a link to reset your password.
              </p>

              {error && (
                <div style={{ background: "#FEF2F2", border: "1px solid #FEE2E2", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#EF4444", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                  <AlertCircle size={18} /> {error}
                </div>
              )}

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10, fontFamily: "Sora, sans-serif" }}>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder="name@example.com"
                  style={{ width: "100%", height: 50, padding: "0 16px", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 12, fontSize: 14, outline: "none" }}
                />
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={onClose}
                  style={{ flex: 1, height: 50, background: "white", border: "1px solid #E2E8F0", borderRadius: 12, fontSize: 14, fontWeight: 700, color: "#64748B", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendEmail}
                  disabled={loading}
                  style={{ flex: 1.5, height: 50, background: T.blue, border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : "Send Instructions"}
                </button>
              </div>
            </motion.div>
          )}

          {step === "sent" && (
            <motion.div
              key="sent"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              style={{ textAlign: "center" }}
            >
              <div style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(82, 183, 136, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, margin: "0 auto 24px" }}>
                <CheckCircle2 size={32} color={T.mint} />
              </div>
              <h2 style={{ fontFamily: "Sora, sans-serif", fontSize: 24, fontWeight: 800, color: T.text, marginBottom: 12 }}>Check your email</h2>
              <p style={{ fontSize: 14, color: T.textMid, lineHeight: 1.6, marginBottom: 32 }}>
                We've sent password reset instructions to <strong>{email}</strong>.
              </p>

              <div style={{ background: "#F8FAFC", borderRadius: 16, padding: 24, marginBottom: 32, border: "1px dashed #CBD5E1" }}>
                <p style={{ fontSize: 12, color: "#94A3B8", fontWeight: 700, textTransform: "uppercase", marginBottom: 12 }}>Simulated Inbox</p>
                <div style={{ textAlign: "left", background: "white", padding: 16, borderRadius: 12, border: "1px solid #E2E8F0" }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 4 }}>Subject: Reset your Saleem Password</p>
                  <p style={{ fontSize: 12, color: T.textMid, marginBottom: 12 }}>Hello, click the button below to reset your password.</p>
                  <button
                    onClick={() => setStep("reset")}
                    style={{ padding: "8px 16px", background: T.blue, color: "white", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                  >
                    Reset Password Link <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              <button
                onClick={onClose}
                style={{ width: "100%", height: 50, background: "white", border: "1px solid #E2E8F0", borderRadius: 12, fontSize: 14, fontWeight: 700, color: "#64748B", cursor: "pointer" }}
              >
                Back to Login
              </button>
            </motion.div>
          )}

          {step === "reset" && (
            <motion.div
              key="reset"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(58, 110, 242, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
                <Lock size={32} color={T.blue} />
              </div>
              <h2 style={{ fontFamily: "Sora, sans-serif", fontSize: 24, fontWeight: 800, color: T.text, marginBottom: 12 }}>New Password</h2>
              <p style={{ fontSize: 14, color: T.textMid, lineHeight: 1.6, marginBottom: 32 }}>
                Please enter a new password for <strong>{email}</strong>.
              </p>

              {error && (
                <div style={{ background: "#FEF2F2", border: "1px solid #FEE2E2", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#EF4444", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                  <AlertCircle size={18} /> {error}
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10, fontFamily: "Sora, sans-serif" }}>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setError(""); }}
                  placeholder="Min 6 characters..."
                  style={{ width: "100%", height: 50, padding: "0 16px", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 12, fontSize: 14, outline: "none" }}
                />
              </div>

              <div style={{ marginBottom: 32 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10, fontFamily: "Sora, sans-serif" }}>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                  placeholder="Repeat your password..."
                  style={{ width: "100%", height: 50, padding: "0 16px", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 12, fontSize: 14, outline: "none" }}
                />
              </div>

              <button
                onClick={handleReset}
                disabled={loading}
                style={{ width: "100%", height: 50, background: T.blue, border: "none", borderRadius: 12, fontSize: 15, fontWeight: 800, color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : "Update Password"}
              </button>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ textAlign: "center" }}
            >
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(82, 183, 136, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, margin: "0 auto 24px" }}>
                <CheckCircle2 size={48} color={T.mint} />
              </div>
              <h2 style={{ fontFamily: "Sora, sans-serif", fontSize: 26, fontWeight: 800, color: T.text, marginBottom: 12 }}>Password updated!</h2>
              <p style={{ fontSize: 15, color: T.textMid, lineHeight: 1.6, marginBottom: 32 }}>
                Your password has been successfully updated. You can now log in with your new password.
              </p>

              <button
                onClick={onClose}
                style={{ width: "100%", height: 50, background: T.mint, border: "none", borderRadius: 12, fontSize: 15, fontWeight: 800, color: "white", cursor: "pointer" }}
              >
                Log in now
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
