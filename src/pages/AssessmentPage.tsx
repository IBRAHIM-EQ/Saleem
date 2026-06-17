/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { T } from "../constants";
import { BrandIcon } from "../components/BrandIcon";
import { Check, ArrowRight } from "lucide-react";
import { profileApi, tokenStore } from "../lib/api";
import { getAllAllergens, getAllergenEmoji, mapAllergenName } from "../lib/allergyService";

interface AssessmentPageProps {
  onSave: (profile: any) => void;
  initialProfile: any;
  username: string | null;
  onProfileUpdate: (newUsername: string, newProfile: any) => void;
  isEmbedded?: boolean;
  lang?: "ar" | "en";
}

export function AssessmentPage({ onSave, initialProfile, username, onProfileUpdate, isEmbedded = false, lang = "en" }: AssessmentPageProps) {
  const [selectedAllergens, setSelectedAllergens] = useState<{key: string, severity: string}[]>(() => {
    const initial = initialProfile?.allergens || [];
    const seen = new Set();
    const result: {key: string, severity: string}[] = [];

    initial.forEach((a: any) => {
      const k = typeof a === 'string' ? a : (a?.key || a?.allergenKey);
      if (k && !seen.has(k)) {
        seen.add(k);
        result.push({
          key: k,
          severity: typeof a === 'object' && a?.severity ? a.severity : "Moderate"
        });
      }
    });
    return result;
  });
  const [allergenError, setAllergenError] = useState(false);

  const translateAllergen = (key: string) => {
    return mapAllergenName(key, lang);
  };

  const t = {
    allergens: lang === "ar" ? "مسببات الحساسية" : "Allergens",
    subtitle: lang === "ar" ? "حدد مسببات الحساسية التي تؤثر عليك لتخصيص تجربتك بشكل كامل في سليم" : "Personalize your experience by choosing what affects you",
    severityLevel: lang === "ar" ? "مستوى خطورة الحساسية" : "Severity Level",
    defineSensitivity: lang === "ar" ? "حدد مدى حساسيتك وخطورتها تجاه هذا المكون" : "Define your sensitivity to this allergen",
    selectLeastOne: lang === "ar" ? "يرجى تحديد مسبب حساسية واحد على الأقل للمتابعة." : "Please select at least one allergen to continue.",
    saveBtn: isEmbedded
      ? (lang === "ar" ? "حفظ التغييرات" : "Save Changes")
      : (lang === "ar" ? "حفظ الإعدادات والمتابعة" : "Save Settings & Continue"),
  };

  const toggleAllergen = (key: string) => {
    setSelectedAllergens((prev) => {
      const exists = prev.find(a => a.key === key);
      if (exists) {
        return prev.filter(a => a.key !== key);
      } else {
        return [...prev, { key, severity: "Moderate" }];
      }
    });
    setAllergenError(false);
  };

  const updateSeverity = (key: string, severity: string) => {
    setSelectedAllergens(prev => prev.map(a => a.key === key ? { ...a, severity } : a));
  };

  const handleSave = async () => {
    if (!selectedAllergens.length) {
      setAllergenError(true);
      return;
    }

    const formattedAllergies = selectedAllergens.map(a => ({
      allergenKey: a.key,
      severity: a.severity
    }));

    if (tokenStore.getAccess()) {
      try {
        await profileApi.updateAllergies(formattedAllergies);
      } catch {
        // Network issue — still proceed locally
      }
    }

    onSave(formattedAllergies);
  };

  const severityLevels = [
    { key: "Mild", label: lang === "ar" ? "خفيفة" : "Mild", color: "#4CAF50" },
    { key: "Moderate", label: lang === "ar" ? "متوسطة" : "Moderate", color: "#FF9800" },
    { key: "Severe", label: lang === "ar" ? "شديدة" : "Severe", color: "#F44336" },
  ];

  return (
    <div
      style={isEmbedded ? {
        minHeight: "100%",
        background: "#F9FAFB",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "24px 16px",
        direction: lang === "ar" ? "rtl" : "ltr",
        flex: 1
      } : {
        minHeight: "100vh",
        background: "#F9FAFB",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 16px",
        direction: lang === "ar" ? "rtl" : "ltr"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 700,
          background: T.white,
          borderRadius: 32,
          border: "1px solid #E5E7EB",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.08)",
          overflow: "hidden",
          position: "relative"
        }}
      >
        <div style={{ padding: "48px 40px" }}>
          <header style={{ marginBottom: 40, textAlign: lang === "ar" ? "right" : "left" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16, flexDirection: lang === "ar" ? "row-reverse" : "row" }}>
              <div style={{ width: 56, height: 56, background: "rgba(58,110,242,0.08)", color: T.blue, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BrandIcon size={32} />
              </div>
              <div>
                <h1 style={{ fontFamily: "Sora, sans-serif", fontSize: 24, fontWeight: 800, color: T.text, marginBottom: 4 }}>{t.allergens}</h1>
                <p style={{ fontSize: 14, color: T.grayDark, fontWeight: 500 }}>{t.subtitle}</p>
              </div>
            </div>
            <div style={{ height: 1, background: "linear-gradient(90deg, #E5E7EB 0%, rgba(229,231,235,0) 100%)" }} />
          </header>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 16, marginBottom: 40 }}>
            {getAllAllergens().map((a, idx) => {
              const isSelected = selectedAllergens.some(sa => sa.key === a.key);
              return (
                <div
                  key={`${a.key}-${idx}`}
                  onClick={() => toggleAllergen(a.key)}
                  style={{
                    background: isSelected ? "rgba(58,110,242,0.03)" : T.white,
                    border: `2px solid ${isSelected ? T.blue : "#F3F4F6"}`,
                    borderRadius: 20,
                    padding: "20px 12px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 12,
                    cursor: "pointer",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    boxShadow: isSelected ? "0 10px 20px -5px rgba(58,110,242,0.15)" : "none",
                    transform: isSelected ? "translateY(-4px)" : "translateY(0)",
                    position: "relative"
                  }}
                >
                  <div style={{
                    fontSize: 36,
                    filter: isSelected ? "none" : "grayscale(0.4) opacity(0.8)",
                    transform: isSelected ? "scale(1.1)" : "scale(1)",
                    transition: "all 0.3s ease"
                  }}>
                    {a.emoji}
                  </div>
                  <span style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: isSelected ? T.blue : T.textMid,
                    textAlign: "center",
                    fontFamily: "Sora, sans-serif"
                  }}>
                    {translateAllergen(a.key)}
                  </span>
                  {isSelected && (
                    <div style={{ position: "absolute", top: 8, left: 8, background: T.blue, color: "white", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Check size={12} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {selectedAllergens.length > 0 && (
            <div style={{ marginBottom: 40, textAlign: lang === "ar" ? "right" : "left" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, flexDirection: lang === "ar" ? "row-reverse" : "row" }}>
                <div style={{ width: 4, height: 20, background: T.blue, borderRadius: 2 }} />
                <h3 style={{ fontSize: 18, fontWeight: 800, color: T.text, fontFamily: "Sora, sans-serif" }}>{t.severityLevel}</h3>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {selectedAllergens.map((sa, idx) => {
                  const emoji = getAllergenEmoji(sa.key);
                  return (
                    <div
                      key={`${sa.key}-${sa.severity}-${idx}`}
                      style={{
                        background: "#F9FAFB",
                        padding: "20px",
                        borderRadius: 24,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        border: "1px solid #F3F4F6",
                        flexDirection: lang === "ar" ? "row-reverse" : "row"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 16, flexDirection: lang === "ar" ? "row-reverse" : "row" }}>
                        <div style={{ width: 52, height: 52, background: T.white, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                           {emoji}
                        </div>
                        <div style={{ textAlign: lang === "ar" ? "right" : "left" }}>
                          <div style={{ fontWeight: 800, fontSize: 16, color: T.text }}>{translateAllergen(sa.key)}</div>
                          <div style={{ fontSize: 12, color: T.grayDark, fontWeight: 500 }}>{t.defineSensitivity}</div>
                        </div>
                      </div>

                      <div style={{ display: "flex", background: T.white, padding: "5px", borderRadius: 16, border: "1px solid #E5E7EB", gap: 6, flexDirection: lang === "ar" ? "row-reverse" : "row" }}>
                        {severityLevels.map((lvl, lIdx) => {
                          const isActive = sa.severity === lvl.key;
                          return (
                            <button
                              key={`${sa.key}-${lvl.key}-${lIdx}`}
                              onClick={() => updateSeverity(sa.key, lvl.key)}
                              style={{
                                padding: "8px 18px",
                                borderRadius: 12,
                                border: "none",
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: "pointer",
                                background: isActive ? lvl.color : "transparent",
                                color: isActive ? "white" : T.grayDark,
                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                boxShadow: isActive ? `0 4px 12px ${lvl.color}40` : "none",
                              }}
                            >
                              {lvl.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {allergenError && (
            <div style={{ color: T.red, fontSize: 13, fontWeight: 600, textAlign: "center", marginBottom: 16 }}>
              {t.selectLeastOne}
            </div>
          )}

          <button
            onClick={handleSave}
            style={{
              width: "100%",
              height: 60,
              background: T.blue,
              color: "white",
              borderRadius: 20,
              border: "none",
              fontSize: 16,
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 10px 20px -5px rgba(58, 110, 242, 0.3)",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              fontFamily: "Sora, sans-serif",
              flexDirection: lang === "ar" ? "row-reverse" : "row"
            }}
            onMouseOver={e => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 15px 30px -5px rgba(58, 110, 242, 0.4)";
              e.currentTarget.style.background = "#2D5BD6";
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 10px 20px -5px rgba(58, 110, 242, 0.3)";
              e.currentTarget.style.background = T.blue;
            }}
          >
            <span>{t.saveBtn}</span>
            <ArrowRight size={20} style={{ transform: lang === "ar" ? "rotate(180deg)" : "none" }} />
          </button>
        </div>
      </div>
    </div>
  );
}
