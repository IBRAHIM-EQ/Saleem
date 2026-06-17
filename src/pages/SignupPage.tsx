/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from "react";
import { T } from "../constants";
import { BrandIcon } from "../components/BrandIcon";
import { Eye, EyeOff, Mail, User, Lock, Check, AlertTriangle, Loader2 } from "lucide-react";
import { saveUser, setCurrentUser } from "../lib/storage";
import { authApi, tokenStore, ApiError } from "../lib/api";

interface SignupPageProps {
  onSignupComplete: (userData: any) => void;
  onBackToLogin: () => void;
  lang: "ar" | "en";
  onLangChange: (l: "ar" | "en") => void;
}

export function SignupPage({ onSignupComplete, onBackToLogin, lang, onLangChange }: SignupPageProps) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isRtl = lang === "ar";

  const t = {
    appName: "Saleem",
    createAccount: isRtl ? "إنشاء حساب جديد" : "Create Account",
    subtitle: isRtl ? "انضم إلى سليم وتمتع بتجربة طعام آمنة وذكية" : "Join Saleem for a safe and smart food experience",
    firstName: isRtl ? "الاسم الأول" : "First Name",
    firstNamePlaceholder: isRtl ? "مثال: أحمد" : "e.g. John",
    lastName: isRtl ? "الاسم الأخير" : "Last Name",
    lastNamePlaceholder: isRtl ? "مثال: زهران" : "e.g. Doe",
    email: isRtl ? "البريد الإلكتروني" : "Email Address",
    emailRequired: isRtl ? "البريد الإلكتروني مطلوب." : "Email is required.",
    validEmailRequired: isRtl ? "الرجاء إدخال بريد إلكتروني صالح." : "Please enter a valid email address.",
    namesRequired: isRtl ? "الاسم الأول والأخير مطلوبان." : "First and last names are required.",
    passwordLabel: isRtl ? "كلمة المرور" : "Password",
    passwordRequired: isRtl ? "كلمة المرور مطلوبة." : "Password is required.",
    passwordRequirements: isRtl ? "شروط كلمة المرور:" : "Password Requirements:",
    requirementLength: isRtl ? "بين 6 إلى 12 خانة" : "6-12 characters",
    requirementUpper: isRtl ? "حرف كبير" : "Uppercase char",
    requirementLower: isRtl ? "حرف صغير" : "Lowercase char",
    requirementNumber: isRtl ? "رقم واحد" : "One number",
    requirementSpecial: isRtl ? "رمز خاص" : "Special symbol",
    meetRequirements: isRtl ? "الرجاء استيفاء جميع شروط كلمة المرور التالية." : "Please meet all password requirements.",
    confirmPassword: isRtl ? "تأكيد كلمة المرور" : "Confirm Password",
    passwordsMismatch: isRtl ? "كلمتا المرور غير متطابقتين." : "Passwords do not match.",
    createBtn: isRtl ? "✨ إنشاء حساب جديد" : "✨ Create New Account",
    creatingBtn: isRtl ? "جاري إنشاء الحساب..." : "Creating account...",
    backToLogin: isRtl ? "← العودة لتسجيل الدخول" : "← Back to Login",
  };

  // Validate password
  const getPasswordErrors = useCallback((pass: string) => {
    return {
      length: pass.length < 6 || pass.length > 12,
      uppercase: !/[A-Z]/.test(pass),
      lowercase: !/[a-z]/.test(pass),
      number: !/[0-9]/.test(pass),
      special: !/[@!#$%^&*]/.test(pass), 
    };
  }, []);

  const isPasswordValid = useCallback(
    (pass: string) => {
      const errors = getPasswordErrors(pass);
      return !Object.values(errors).some(Boolean);
    },
    [getPasswordErrors]
  );

  const currentErrors = getPasswordErrors(password);

  const handleSignup = async () => {
    setError("");

    // Validate email
    if (!email.trim()) {
      setError(t.emailRequired);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t.validEmailRequired);
      return;
    }

    // Validate Name
    if (!firstName.trim() || !lastName.trim()) {
      setError(t.namesRequired);
      return;
    }

    // Validate password
    if (!password) {
      setError(t.passwordRequired);
      return;
    }
    if (!isPasswordValid(password)) {
      setError(t.meetRequirements);
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setError(t.passwordsMismatch);
      return;
    }

    setIsLoading(true);

    try {
      // 1. Register via backend API
      const data = await authApi.register({ firstName, lastName, email, password });
      tokenStore.setTokens(data.accessToken, data.refreshToken);

      // 2. Also save to localStorage for admin-local logic
      saveUser(email, password, {
        firstName,
        lastName,
        allergens: [],
        onboardingComplete: false,
        role: "User",
      });
      setCurrentUser(email);

      onSignupComplete({
        email: data.email,
        fullName: data.fullName,
        role: data.role,
        onboardingComplete: false,
        allergens: [],
      });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 400 && err.message.toLowerCase().includes("email")) {
          setError(lang === "ar" ? "هذا البريد الإلكتروني مسجل مسبقاً." : "This email is already registered.");
        } else {
          setError(err.message);
        }
      } else {
        // Fallback: save locally if server unreachable
        saveUser(email, password, {
          firstName,
          lastName,
          allergens: [],
          onboardingComplete: false,
          role: "User",
        });
        setCurrentUser(email);
        onSignupComplete({
          email,
          fullName: `${firstName} ${lastName}`,
          role: "User",
          onboardingComplete: false,
          allergens: [],
        });
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
      <div style={{ position: "absolute", top: 0, right: 0, width: 320, height: 320, background: "rgba(59,130,246,0.05)", borderRadius: "50%", filter: "blur(96px)", marginRight: -160, marginTop: -160 }}></div>
      <div style={{ position: "absolute", bottom: 0, left: 0, width: 320, height: 320, background: "rgba(16,185,129,0.05)", borderRadius: "50%", filter: "blur(96px)", marginLeft: -160, marginBottom: -160 }}></div>

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

      <div
        style={{
          width: "100%",
          maxWidth: 600,
          background: "white",
          borderRadius: 32,
          padding: 56,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.08)",
          border: "1px solid rgba(226,232,240,0.8)",
          zIndex: 10,
          margin: "32px 0",
          overflowY: "auto",
          maxHeight: "90vh"
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
            <h1 style={{ fontFamily: "Sora, sans-serif", fontSize: 28, fontWeight: 800, color: "#16202E", margin: 0 }}>{t.createAccount}</h1>
            <p style={{ fontSize: 13, color: "#94A3B8", fontWeight: 600, marginTop: 8 }}>{t.subtitle}</p>
          </div>
        </div>

        {error && (
          <div
            style={{
              background: "#FEF2F2",
              border: "1px solid #FEE2E2",
              borderRadius: 14,
              padding: "16px 20px",
              fontSize: 14,
              fontWeight: 600,
              color: "#EF4444",
              marginBottom: 32,
              display: "flex",
              alignItems: "center",
              gap: 12,
              textAlign: isRtl ? "right" : "left"
            }}
          >
            <AlertTriangle size={20} />
            <span style={{ flex: 1 }}>{error}</span>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24, textAlign: isRtl ? "right" : "left" }}>
          {/* First Name */}
          <div>
            <label style={{ display: "block", fontSize: 10, fontWeight: 900, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10, fontFamily: "Sora, sans-serif" }}>{t.firstName}</label>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 18px", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 14, flexDirection: isRtl ? "row-reverse" : "row" }}>
              <User size={18} color="#94A3B8" />
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder={t.firstNamePlaceholder} style={{ flex: 1, height: 52, background: "transparent", border: "none", outline: "none", fontSize: 14, color: "#334155", textAlign: isRtl ? "right" : "left" }} />
            </div>
          </div>
          {/* Last Name */}
          <div>
            <label style={{ display: "block", fontSize: 10, fontWeight: 900, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10, fontFamily: "Sora, sans-serif" }}>{t.lastName}</label>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 18px", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 14, flexDirection: isRtl ? "row-reverse" : "row" }}>
              <User size={18} color="#94A3B8" />
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder={t.lastNamePlaceholder} style={{ flex: 1, height: 52, background: "transparent", border: "none", outline: "none", fontSize: 14, color: "#334155", textAlign: isRtl ? "right" : "left" }} />
            </div>
          </div>
        </div>

        {/* Email Field */}
        <div style={{ marginBottom: 24, textAlign: isRtl ? "right" : "left" }}>
          <label style={{ display: "block", fontSize: 10, fontWeight: 900, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10, fontFamily: "Sora, sans-serif" }}>{t.email}</label>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 18px", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 14, flexDirection: isRtl ? "row-reverse" : "row" }}>
            <Mail size={18} color="#94A3B8" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={{ flex: 1, height: 52, background: "transparent", border: "none", outline: "none", fontSize: 14, color: "#334155", textAlign: isRtl ? "right" : "left" }} />
          </div>
        </div>

        {/* Password Field */}
        <div style={{ marginBottom: 24, textAlign: isRtl ? "right" : "left" }}>
          <label style={{ display: "block", fontSize: 10, fontWeight: 900, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10, fontFamily: "Sora, sans-serif" }}>{t.passwordLabel}</label>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: isRtl ? "0 18px" : "0 18px", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 14, position: "relative", flexDirection: isRtl ? "row-reverse" : "row" }}>
            <Lock size={18} color="#94A3B8" />
            <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={{ flex: 1, height: 52, background: "transparent", border: "none", outline: "none", fontSize: 14, color: "#334155", textAlign: isRtl ? "right" : "left", paddingRight: isRtl ? 10 : 40, paddingLeft: isRtl ? 40 : 10 }} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: isRtl ? "auto" : 12, left: isRtl ? 12 : "auto", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94A3B8", cursor: "pointer", display: "flex" }}>
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div style={{ marginTop: 16, padding: 20, background: "#F8FAFC", borderRadius: 20, border: "1px solid #E2E8F0" }}>
            <p style={{ fontSize: 10, fontWeight: 900, color: "#94A3B8", marginBottom: 12, textTransform: "uppercase", letterSpacing: "1px" }}>{t.passwordRequirements}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px" }}>
               <Requirement met={password.length >= 6 && password.length <= 12} text={t.requirementLength} isRtl={isRtl} />
               <Requirement met={!currentErrors.uppercase} text={t.requirementUpper} isRtl={isRtl} />
               <Requirement met={!currentErrors.lowercase} text={t.requirementLower} isRtl={isRtl} />
               <Requirement met={!currentErrors.number} text={t.requirementNumber} isRtl={isRtl} />
               <Requirement met={!currentErrors.special} text={t.requirementSpecial} isRtl={isRtl} />
            </div>
          </div>
        </div>

        {/* Confirm Password Field */}
        <div style={{ marginBottom: 40, textAlign: isRtl ? "right" : "left" }}>
          <label style={{ display: "block", fontSize: 10, fontWeight: 900, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10, fontFamily: "Sora, sans-serif" }}>{t.confirmPassword}</label>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 18px", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 14, position: "relative", flexDirection: isRtl ? "row-reverse" : "row" }}>
            <Check size={18} color="#94A3B8" />
            <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" style={{ flex: 1, height: 52, background: "transparent", border: "none", outline: "none", fontSize: 14, color: "#334155", textAlign: isRtl ? "right" : "left", paddingRight: isRtl ? 10 : 40, paddingLeft: isRtl ? 40 : 10 }} />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: "absolute", right: isRtl ? "auto" : 12, left: isRtl ? 12 : "auto", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94A3B8", cursor: "pointer", display: "flex" }}>
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <button
            onClick={handleSignup}
            disabled={isLoading}
            style={{
              width: "100%",
              height: 56,
              background: isLoading ? "#E2E8F0" : "linear-gradient(90deg, #52B788, #3A6EF2)",
              color: "white",
              borderRadius: 16,
              fontSize: 16,
              fontWeight: 800,
              fontFamily: "Sora, sans-serif",
              border: "none",
              cursor: isLoading ? "default" : "pointer",
              boxShadow: isLoading ? "none" : "0 10px 20px rgba(82, 183, 136, 0.2)",
              transition: "all 0.2s"
            }}
          >
            {isLoading ? t.creatingBtn : t.createBtn}
          </button>

          <button 
            onClick={onBackToLogin}
            style={{
              width: "100%",
              height: 52,
              background: "white",
              border: "1px solid #E2E8F0",
              color: "#64748B",
              borderRadius: 14,
              fontSize: 15,
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
            {t.backToLogin}
          </button>
        </div>
      </div>
    </div>
  );
}

function Requirement({ met, text, isRtl }: { met: boolean; text: string; isRtl?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: met ? T.mintDark : T.grayDark, flexDirection: isRtl ? "row-reverse" : "row" }}>
      <span style={{ fontSize: 12 }}>{met ? "✓" : "○"}</span>
      <span>{text}</span>
    </div>
  );
}
