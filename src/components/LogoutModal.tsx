/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { T } from "../constants";
import { motion } from "motion/react";

interface LogoutModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  isGuest?: boolean;
  lang?: "ar" | "en";
}

export function LogoutModal({ onConfirm, onCancel, isGuest, lang = "en" }: LogoutModalProps) {
  const isRtl = lang === "ar";

  const t = {
    guestTitle: isRtl ? "هل تريد تسجيل الدخول؟" : "Sign in to Saleem?",
    guestDesc: isRtl 
      ? "سيتم توجيهك إلى شاشة تسجيل الدخول لإنشاء حساب جديد أو الدخول لحسابك لحفظ فلاتر الحساسية وموعد الاستشارة." 
      : "You will be redirected to the sign-in screen to create a new account or log in.",
    guestConfirm: isRtl ? "تسجيل الدخول" : "Sign In",
    guestCancel: isRtl ? "تراجع" : "Cancel",

    userTitle: isRtl ? "هل ترغب في تسجيل الخروج؟" : "Log out of Saleem?",
    userDesc: isRtl 
      ? "سيتم مسح بيانات الميزات النشطة من الجلسة الحالية للحفاظ على أمان بياناتك." 
      : "Your allergen profile will be cleared from this session.",
    userConfirm: isRtl ? "تسجيل الخروج" : "Yes, Logout",
    userCancel: isRtl ? "تراجع" : "Cancel"
  };

  const title = isGuest ? t.guestTitle : t.userTitle;
  const desc = isGuest ? t.guestDesc : t.userDesc;
  const confirmText = isGuest ? t.guestConfirm : t.userConfirm;
  const cancelText = isGuest ? t.guestCancel : t.userCancel;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(22,32,46,0.45)",
        backdropFilter: "blur(3px)",
        zIndex: 9998,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        direction: isRtl ? "rtl" : "ltr"
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        style={{
          background: T.white,
          borderRadius: 10,
          padding: "32px 28px 24px",
          width: "100%",
          maxWidth: 360,
          textAlign: "center",
          border: "1px solid #E5E7EB",
          boxShadow:
            "0 0 0 1px rgba(22,32,46,0.04), 0 2px 8px rgba(22,32,46,0.08), 0 8px 24px rgba(22,32,46,0.06)",
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            background: isGuest ? `${T.mintLight}` : "#fff0f2",
            border: `1px solid ${isGuest ? T.mintMid : "#f5c0c7"}`,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            fontSize: 22,
          }}
        >
          {isGuest ? "🔑" : "🚪"}
        </div>
        <div
          style={{
            fontFamily: "Sora, sans-serif",
            fontSize: 16,
            fontWeight: 700,
            marginBottom: 8,
            color: T.text
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 13,
            color: T.grayDark,
            lineHeight: 1.5,
            marginBottom: 24,
          }}
        >
          {desc}
        </div>
        <div style={{ display: "flex", gap: 10, flexDirection: isRtl ? "row-reverse" : "row" }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              height: 40,
              background: T.gray,
              border: "1px solid #E5E7EB",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              color: T.textMid,
              cursor: "pointer",
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              height: 40,
              background: isGuest ? T.mint : T.red,
              border: "none",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              color: "white",
              cursor: "pointer",
            }}
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
