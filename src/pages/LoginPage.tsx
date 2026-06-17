/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { T } from "../constants";
import { validateUser, setCurrentUser, saveUser } from "../lib/storage";
import { authApi, tokenStore, ApiError } from "../lib/api";
import { BrandIcon } from "../components/BrandIcon";
import { ForgotPasswordModal } from "../components/ForgotPasswordModal";
import { Eye, EyeOff, AlertTriangle, Loader2 } from "lucide-react";

interface LoginPageProps {
  onLogin: (userData: any) => void;
  onSignupClick: () => void;
  onBackToIntro: () => void;
  onGuestLogin: () => void;
  lang: "ar" | "en";
  onLangChange: (l: "ar" | "en") => void;
}

export function LoginPage({ onLogin, onSignupClick, onBackToIntro, onGuestLogin, lang, onLangChange }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const isRtl = lang === "ar";

  const t = {
    backToIntro: isRtl ? "← العودة للرئيسية" : "← Back to Intro",
    emailRequired: isRtl ? "البريد الإلكتروني مطلوب." : "Email is required.",
    passwordRequired: isRtl ? "كلمة المرور مطلوبة." : "Password is required.",
    invalidCredentials: isRtl ? "البريد الإلكتروني أو كلمة المرور غير صالحة." : "Invalid email or password.",
    appName: "Saleem",
    appSubtitle: isRtl ? "الرفيق الذكي للسلامة الغذائية" : "AI FOOD SAFETY COMPANION",
    emailLabel: isRtl ? "البريد الإلكتروني" : "Email Address",
    emailPlaceholder: isRtl ? "أدخل البريد الإلكتروني..." : "Enter email address...",
    passwordLabel: isRtl ? "كلمة المرور" : "Password",
    forgotPassword: isRtl ? "هل نسيت كلمة المرور؟" : "Forgot password?",
    signingIn: isRtl ? "جاري تسجيل الدخول..." : "Signing in...",
    loginBtn: isRtl ? "تسجيل الدخول" : "Login",
    createAccountBtn: isRtl ? "✨ إنشاء حساب جديد" : "✨ Create New Account",
    continueAsGuest: isRtl ? "👤 الاستمرار كضيف" : "👤 Continue as Guest",
  };

  const handleSubmit = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError(t.emailRequired);
      return;
    }
    if (!password) {
      setError(t.passwordRequired);
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      // 1. Try backend API first
      const data = await authApi.login({ email: cleanEmail, password });
      tokenStore.setTokens(data.accessToken, data.refreshToken);

      // Sync to localStorage so other parts of the app still work
      saveUser(cleanEmail, password, {
        firstName: data.fullName.split(" ")[0],
        lastName: data.fullName.split(" ").slice(1).join(" "),
        email: data.email,
        role: data.role,
        allergens: [],
        onboardingComplete: true,
      });
      setCurrentUser(cleanEmail);

      // Fetch full profile (includes allergies & onboardingComplete)
      let onboardingComplete = true;
      let allergens: any[] = [];
      try {
        const { profileApi } = await import("../lib/api");
        const profile = await profileApi.getMe();
        onboardingComplete = profile.onboardingComplete;
        allergens = profile.allergies.map((a) => ({
          key: a.allergenKey,
          severity: a.severity,
        }));
      } catch {}

      onLogin({
        email: data.email,
        fullName: data.fullName,
        role: data.role,
        onboardingComplete,
        allergens,
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        // Fallback: try localStorage (admin account stored locally)
        const user = validateUser(cleanEmail, password);
        if (user) {
          setCurrentUser(cleanEmail);
          onLogin({
            email: cleanEmail,
            fullName: `${user.profile.firstName} ${user.profile.lastName}`,
            role: user.profile.role,
            onboardingComplete: user.profile.onboardingComplete,
            allergens: user.profile.allergens || [],
          });
        } else {
          setError(t.invalidCredentials);
        }
      } else {
        // Network error → fallback to localStorage
        const user = validateUser(cleanEmail, password);
        if (user) {
          setCurrentUser(cleanEmail);
          onLogin({
            email: cleanEmail,
            fullName: `${user.profile.firstName} ${user.profile.lastName}`,
            role: user.profile.role,
            onboardingComplete: user.profile.onboardingComplete,
            allergens: user.profile.allergens || [],
          });
        } else {
          setError(lang === "ar" ? "تعذر الاتصال بالخادم. تحقق من تشغيل الباك ند." : "Cannot reach server. Check backend is running.");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F8FAFC",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
        position: "relative",
        overflow: "hidden",
        direction: isRtl ? "rtl" : "ltr"
      }}
    >
      {/* Background Decor */}
      <div style={{ position: "absolute", top: 0, right: 0, width: 256, height: 256, background: "rgba(59,130,246,0.05)", borderRadius: "50%", filter: "blur(64px)", marginRight: -128, marginTop: -128 }}></div>
      <div style={{ position: "absolute", bottom: 0, left: 0, width: 256, height: 256, background: "rgba(16,185,129,0.05)", borderRadius: "50%", filter: "blur(64px)", marginLeft: -128, marginBottom: -128 }}></div>

      {/* Back to Intro Button */}
      <button
        onClick={onBackToIntro}
        style={{
          position: "absolute",
          top: 32,
          left: isRtl ? "auto" : 32,
          right: isRtl ? 32 : "auto",
          background: "white",
          border: "1px solid #E2E8F0",
          borderRadius: 14,
          padding: "12px 20px",
          fontSize: 13,
          fontWeight: 700,
          color: "#64748B",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 10,
          zIndex: 10,
          transition: "all 0.2s",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
        }}
      >
        {t.backToIntro}
      </button>

      {/* Language Switcher */}
      <button
        onClick={() => onLangChange(isRtl ? "en" : "ar")}
        style={{
          position: "absolute",
          top: 32,
          right: isRtl ? "auto" : 32,
          left: isRtl ? 32 : "auto",
          background: "white",
          border: "1px solid #E2E8F0",
          borderRadius: 14,
          padding: "12px 20px",
          fontSize: 13,
          fontWeight: 750,
          color: T.blue,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 8,
          zIndex: 10,
          transition: "all 0.2s",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
        }}
      >
        <span>🌐</span>
        <span>{isRtl ? "English" : "العربية"}</span>
      </button>

      {showForgotPassword && (
        <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} />
      )}

      <div
        style={{
          width: "100%",
          maxWidth: 440,
          background: "white",
          borderRadius: 32,
          padding: 56,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.08)",
          border: "1px solid rgba(226,232,240,0.8)",
          zIndex: 10
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            marginBottom: 48,
            textAlign: "center"
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              background: "rgba(82,183,136,0.1)",
              border: "1px solid rgba(82,183,136,0.2)",
              borderRadius: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)"
            }}
          >
            <BrandIcon size={40} />
          </div>
          <div>
            <h1 style={{ fontFamily: "Sora, sans-serif", fontSize: 28, fontWeight: 800, color: "#16202E", margin: 0 }}>{t.appName}</h1>
            <p style={{ fontSize: 11, color: "#94A3B8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", marginTop: 4 }}>{t.appSubtitle}</p>
          </div>
        </div>

        {error && (
          <div
            style={{
              background: "#FEF2F2",
              border: "1px solid #FEE2E2",
              borderRadius: 14,
              padding: "14px 18px",
              fontSize: 13,
              fontWeight: 600,
              color: "#EF4444",
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              gap: 10
            }}
          >
            <AlertTriangle size={18} /> {error}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ textAlign: isRtl ? "right" : "left" }}>
            <label style={{ display: "block", fontSize: 10, fontWeight: 900, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10, fontFamily: "Sora, sans-serif" }}>
              {t.emailLabel}
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder={t.emailPlaceholder}
                style={{
                  width: "100%",
                  height: 52,
                  padding: "0 18px",
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  borderRadius: 14,
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#334155",
                  outline: "none",
                  textAlign: isRtl ? "right" : "left",
                  transition: "all 0.2s"
                }}
              />
            </div>
          </div>

          <div style={{ textAlign: isRtl ? "right" : "left" }}>
            <label style={{ display: "block", fontSize: 10, fontWeight: 900, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10, fontFamily: "Sora, sans-serif" }}>
              {t.passwordLabel}
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="••••••••"
                style={{
                  width: "100%",
                  height: 52,
                  padding: isRtl ? "0 48px 0 18px" : "0 18px 0 48px",
                  paddingRight: isRtl ? 18 : 48,
                  paddingLeft: isRtl ? 48 : 18,
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  borderRadius: 14,
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#334155",
                  outline: "none",
                  textAlign: isRtl ? "right" : "left",
                  transition: "all 0.2s"
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: isRtl ? "auto" : 12,
                  left: isRtl ? 12 : "auto",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  padding: 8,
                  color: "#94A3B8",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
        </div>

        <div style={{ textAlign: isRtl ? "left" : "right", marginTop: 12, marginBottom: 32 }}>
          <span
            onClick={() => setShowForgotPassword(true)}
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#3A6EF2",
              cursor: "pointer",
              fontFamily: "Sora, sans-serif"
            }}
          >
            {t.forgotPassword}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            style={{
              width: "100%",
              height: 52,
              background: isLoading ? "#94A3B8" : "#3A6EF2",
              color: "white",
              borderRadius: 14,
              fontSize: 15,
              fontWeight: 800,
              fontFamily: "Sora, sans-serif",
              border: "none",
              cursor: isLoading ? "not-allowed" : "pointer",
              boxShadow: "0 10px 15px -3px rgba(58, 110, 242, 0.25)",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10
            }}
          >
            {isLoading && <Loader2 size={20} className="animate-spin" />}
            {isLoading ? t.signingIn : t.loginBtn}
          </button>

          <button
            onClick={onSignupClick}
            style={{
              width: "100%",
              height: 52,
              background: "white",
              border: "1px solid rgba(82, 183, 136, 0.4)",
              color: "#2D6A4F",
              borderRadius: 14,
              fontSize: 15,
              fontWeight: 800,
              fontFamily: "Sora, sans-serif",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              transition: "all 0.2s"
            }}
          >
            {t.createAccountBtn}
          </button>

          <button
            onClick={onGuestLogin}
            style={{
              width: "100%",
              height: 52,
              background: "#F8FAFC",
              border: "1px solid #E2E8F0",
              color: "#64748B",
              borderRadius: 14,
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "Sora, sans-serif",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              transition: "all 0.2s"
            }}
          >
            <span>👤</span> {t.continueAsGuest}
          </button>
        </div>
      </div>
    </div>
  );
}
