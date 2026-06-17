/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { T } from "../constants";
import { BrandIcon } from "./BrandIcon";

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  profile: any;
  username: string | null;
  lang?: "ar" | "en";
}

const translations: Record<"ar" | "en", Record<string, string>> = {
  ar: {
    intro: "حول سليم 👋",
    feed: "الأطعمة الآمنة 🍽️",
    home: "لوحة التحكم 🏠",
    chat: "المساعد الذكي 🤖",
    wiki: "موسوعة الحساسية 📚",
    directory: "أخصائيو التغذية 👩‍⚕️",
    allergens: "مسببات الحساسية ⚙️",
    Main: "الرئيسية",
    Resources: "المصادر والإرشاد",
    guestUser: "حساب زائر مؤقت",
    signInNote: "سجّل الدخول للمتابعة الطبية",
  },
  en: {
    intro: "About Saleem",
    feed: "Safe Products",
    home: "Dashboard",
    chat: "AI Assistant",
    wiki: "Allergy Wiki",
    directory: "Nutritionists",
    allergens: "My Allergens",
    Main: "Main Menu",
    Resources: "Resources Desk",
    guestUser: "Guest User",
    signInNote: "Sign In for full clinic access",
  }
};

export function Sidebar({ activePage, onNavigate, profile, username, lang = "en" }: SidebarProps) {
  const isGuest = profile?.isGuest;
  const isSupportedPage = activePage === "home" || activePage === "feed" || activePage === "chat" || activePage === "wiki" || activePage === "directory" || activePage === "allergens";
  const effectiveLang = isSupportedPage ? lang : "en";
  const isRtl = effectiveLang === "ar";
  const t = translations[effectiveLang];

  const baseNavItems = isGuest ? [
    { key: "intro", icon: "✨", label: t.intro, section: "Main" },
    { key: "feed", icon: "🍽️", label: t.feed, section: "Main" },
  ] : [
    { key: "home", icon: "🏠", label: t.home, section: "Main" },
    { key: "feed", icon: "🍽️", label: t.feed, section: "Main" },
    { key: "chat", icon: "🤖", label: t.chat, section: "Main" },
    { key: "wiki", icon: "📚", label: t.wiki, section: "Resources" },
    {
      key: "directory",
      icon: "👩‍⚕️",
      label: t.directory,
      section: "Resources",
    },
    {
      key: "allergens",
      icon: "⚙️",
      label: t.allergens,
      section: "Resources",
    },
  ];

  const adminItem = (!isGuest && profile?.role === "Admin") ? [
    {
      key: "admin",
      icon: "🛡️",
      label: isRtl ? "لوحة الإدارة 🔐" : "Admin Panel 🔐",
      section: "Resources",
    }
  ] : [];

  const navItems = [...baseNavItems, ...adminItem];

  const sections = isGuest ? ["Main"] : ["Main", "Resources"];

  // Get first letter of firstName or username for avatar
  const getAvatarLetter = () => {
    const name = profile.firstName || username;
    if (name && name.length > 0) {
      return name.charAt(0).toUpperCase();
    }
    return "👤";
  };

  return (
    <nav
      style={{
        width: 240,
        background: "linear-gradient(180deg,#1A2740 0%,#16202E 100%)",
        borderRight: isRtl ? "none" : "1px solid rgba(255,255,255,0.04)",
        borderLeft: isRtl ? "1px solid rgba(255,255,255,0.04)" : "none",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        height: "100%",
        direction: isRtl ? "rtl" : "ltr"
      }}
    >
        <div
          style={{
            padding: "24px 20px 20px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              background: "rgba(82,183,136,0.15)",
              border: "1px solid rgba(82,183,136,0.22)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BrandIcon size={20} />
          </div>
          <div>
            <div
              style={{
                fontFamily: "Sora, sans-serif",
                fontSize: 18,
                fontWeight: 800,
                color: "white",
                letterSpacing: "-0.3px",
              }}
            >
              Saleem
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
              {isRtl ? "مساعد سلامة الغذاء الذكي" : "Food Safety Companion"}
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {sections.map((section) => (
            <div key={section}>
              <div
                style={{
                  fontFamily: "Sora, sans-serif",
                  fontSize: 10,
                  fontWeight: 900,
                  letterSpacing: isRtl ? 0 : 2,
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.4)",
                  padding: "20px 20px 8px",
                  textAlign: isRtl ? "right" : "left"
                }}
              >
                {t[section] || section}
              </div>
              <div
                style={{
                  padding: "0 12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                {navItems
                  .filter((n) => n.section === section)
                  .map((item) => {
                    const isActive = activePage === item.key;
                    return (
                      <div
                        key={item.key}
                        onClick={() => onNavigate(item.key)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "10px 12px",
                          borderRadius: 8,
                          cursor: "pointer",
                          background: isActive
                            ? "rgba(82,183,136,0.12)"
                            : "transparent",
                          borderLeft: (!isRtl && isActive)
                            ? `3px solid ${T.mint}`
                            : "3px solid transparent",
                          borderRight: (isRtl && isActive)
                            ? `3px solid ${T.mint}`
                            : "3px solid transparent",
                          transition: "background 0.15s",
                        }}
                      >
                        <span
                          style={{ fontSize: 16, width: 22, textAlign: "center" }}
                        >
                          {item.icon}
                        </span>
                        <span
                          style={{
                            fontFamily: "Sora, sans-serif",
                            fontSize: 13,
                            fontWeight: isActive ? 800 : 500,
                            color: isActive ? T.mint : "rgba(255,255,255,0.65)",
                          }}
                        >
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>

        {/* User Profile Section */}
        <div
          style={{
            padding: "16px 20px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "rgba(82,183,136,0.05)",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              background: "rgba(82,183,136,0.2)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 700,
              color: T.mint,
              border: "1px solid rgba(82,183,136,0.3)",
              flexShrink: 0,
            }}
          >
            {isGuest ? "👤" : getAvatarLetter()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: "Sora, sans-serif",
                fontSize: 13,
                fontWeight: 700,
                color: "white",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                textAlign: isRtl ? "right" : "left"
              }}
            >
              {isGuest ? t.guestUser : ((profile.firstName && profile.lastName) ? `${profile.firstName} ${profile.lastName}` : (username || "Guest"))}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textAlign: isRtl ? "right" : "left" }}>
              {isGuest ? t.signInNote : (isRtl ? `متابعة ${profile.allergens.length} مسببات حساسية` : `${profile.allergens.length} allergens tracked`)}
            </div>
          </div>
        </div>
      </nav>
  );
}
