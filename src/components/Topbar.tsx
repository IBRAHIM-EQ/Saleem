/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { T } from "../constants";
import { BrandIcon } from "./BrandIcon";

interface TopbarProps {
  title: string;
  onLogout: () => void;
  isGuest?: boolean;
  activeGuestPage?: string;
  onNavigateGuest?: (page: string) => void;
  lang: "ar" | "en";
  onLangChange: (lang: "ar" | "en") => void;
}

const pageTitles: Record<string, Record<"ar" | "en", string>> = {
  home: { en: "Home Dashboard", ar: "لوحة التحكم الرئيسية" },
  feed: { en: "Safe Products", ar: "الأطعمة الآمنة" },
  chat: { en: "AI Assistant", ar: "المساعد الطبي الذكي" },
  wiki: { en: "Allergy Wiki", ar: "موسوعة الحساسية الطبية" },
  directory: { en: "Nutritionists Desk", ar: "أخصائيو التغذية" },
  allergens: { en: "My Allergens Settings", ar: "إعدادات الحساسية الخاصة بي" },
  intro: { en: "About Saleem Companion", ar: "عن مساعد سليم" }
};

const uiTranslations = {
  ar: {
    viewingAsGuest: "تصفح كزائر سريع",
    signIn: "تسجيل الدخول",
    logout: "خروج",
    aboutSaleem: "عن مساعد سليم",
    products: "المنتجات الغذائية"
  },
  en: {
    viewingAsGuest: "Viewing as guest",
    signIn: "Sign In",
    logout: "Logout",
    aboutSaleem: "About Saleem",
    products: "Safe Products"
  }
};

export function Topbar({ title, onLogout, isGuest, activeGuestPage, onNavigateGuest, lang, onLangChange }: TopbarProps) {
  const isSupportedPage = title === "home" || title === "feed" || title === "chat" || title === "wiki" || title === "directory" || title === "allergens" || title === "intro";
  const effectiveLang = isSupportedPage ? lang : "en";
  const isRtl = effectiveLang === "ar";
  const t = uiTranslations[effectiveLang];
  const translatedTitle = pageTitles[title]?.[effectiveLang] || title;

  return (
    <header
      style={{
        height: 64,
        background: T.white,
        borderBottom: "1px solid #E5E7EB",
        display: "flex",
        alignItems: "center",
        padding: "0 32px",
        gap: 16,
        flexShrink: 0,
        direction: isRtl ? "rtl" : "ltr"
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          background: T.mintLight,
          border: `1px solid ${T.mintMid}`,
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <BrandIcon size={16} />
      </div>
      {isGuest && (
        <div style={{ 
          fontFamily: "Sora, sans-serif", 
          fontSize: 18, 
          fontWeight: 900, 
          color: T.mint,
          letterSpacing: "-0.5px",
          marginRight: isRtl ? 0 : 10,
          marginLeft: isRtl ? 10 : 0
        }}>
          Saleem
        </div>
      )}
      
      {isGuest && onNavigateGuest ? (
        <div style={{ display: "flex", alignItems: "center", gap: 32, flex: 1 }}>
          <button
            onClick={() => onNavigateGuest("intro")}
            style={{
              background: "none",
              border: "none",
              fontFamily: "Sora, sans-serif",
              fontSize: 15,
              fontWeight: activeGuestPage === "intro" ? 800 : 500,
              color: activeGuestPage === "intro" ? T.mint : T.textMid,
              cursor: "pointer",
              padding: "10px 0",
              borderBottom: activeGuestPage === "intro" ? `3px solid ${T.mint}` : "3px solid transparent",
              transition: "all 0.2s"
            }}
          >
            {t.aboutSaleem}
          </button>
          <button
            onClick={() => onNavigateGuest("feed")}
            style={{
              background: "none",
              border: "none",
              fontFamily: "Sora, sans-serif",
              fontSize: 15,
              fontWeight: activeGuestPage === "feed" ? 800 : 500,
              color: activeGuestPage === "feed" ? T.mint : T.textMid,
              cursor: "pointer",
              padding: "10px 0",
              borderBottom: activeGuestPage === "feed" ? `3px solid ${T.mint}` : "3px solid transparent",
              transition: "all 0.2s"
            }}
          >
            {t.products}
          </button>
        </div>
      ) : (
        <div
          style={{
            fontFamily: "Sora, sans-serif",
            fontSize: 17,
            fontWeight: 800,
            color: T.text,
            flex: 1,
            textAlign: isRtl ? "right" : "left"
          }}
        >
          {translatedTitle}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {isGuest && (
          <div style={{ fontSize: 13, fontWeight: 500, color: T.grayDark }}>
            {t.viewingAsGuest}
          </div>
        )}

        {/* Professional Global Lang Switcher in Topbar Header - visible only on supported pages */}
        {isSupportedPage && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#F1F5F9",
              padding: "2px",
              borderRadius: "10px",
              border: "1px solid #E2E8F0",
            }}
          >
            <button
              onClick={() => onLangChange("en")}
              style={{
                padding: "4px 10px",
                borderRadius: "8px",
                fontSize: "11px",
                fontWeight: 800,
                cursor: "pointer",
                border: "none",
                background: effectiveLang === "en" ? "white" : "transparent",
                color: effectiveLang === "en" ? T.blueDark : T.grayDark,
                boxShadow: effectiveLang === "en" ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
                transition: "all 0.15s ease",
                display: "flex",
                alignItems: "center",
                gap: 4
              }}
            >
              <span>🇬🇧</span>
              <span>EN</span>
            </button>
            <button
              onClick={() => onLangChange("ar")}
              style={{
                padding: "4px 10px",
                borderRadius: "8px",
                fontSize: "11px",
                fontWeight: 800,
                cursor: "pointer",
                border: "none",
                background: effectiveLang === "ar" ? "white" : "transparent",
                color: effectiveLang === "ar" ? T.blueDark : T.grayDark,
                boxShadow: effectiveLang === "ar" ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
                transition: "all 0.15s ease",
                display: "flex",
                alignItems: "center",
                gap: 4
              }}
            >
              <span>🇯🇴</span>
              <span>AR</span>
            </button>
          </div>
        )}

        <button
          onClick={onLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            height: 38,
            padding: "0 14px",
            background: isGuest ? T.mint : T.gray,
            border: isGuest ? "none" : "1px solid #E5E7EB",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 700,
            fontFamily: "DM Sans, sans-serif",
            color: isGuest ? "white" : T.textMid,
            boxShadow: isGuest ? "0 4px 6px -1px rgba(82, 183, 136, 0.2)" : "none"
          }}
        >
          {isGuest ? (
            <>
              <svg 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                style={{ transform: isRtl ? "rotate(180deg)" : "none" }}
              >
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              <span>{t.signIn}</span>
            </>
          ) : (
            <>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ transform: isRtl ? "rotate(180deg)" : "none" }}
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>{t.logout}</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
