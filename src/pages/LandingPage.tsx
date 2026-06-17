/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { T } from "../constants";
import { BrandIcon } from "../components/BrandIcon";
import { motion } from "motion/react";
import { ShieldCheck, Brain, Heart, ArrowRight } from "lucide-react";

interface LandingPageProps {
  onContinue: () => void;
  onBrowseGuest: () => void;
  lang: "ar" | "en";
  onLangChange: (l: "ar" | "en") => void;
}

export function LandingPage({ onContinue, onBrowseGuest, lang, onLangChange }: LandingPageProps) {
  const isRtl = lang === "ar";

  const t = {
    appName: "Saleem",
    heroTitlePart1: isRtl ? "رفيقك الذكي لغذاء" : "Your Smart Companion for",
    heroTitlePart2: isRtl ? "أكثر أماناً وموثوقية" : "Safer Food Choices",
    heroDesc: isRtl 
      ? "تطبيق سليم هو منصتك الشاملة الأولى بالوطن العربي والشرق الأوسط المتخصصة بإدارة مسببات الحساسية الغذائية، لمساعدتك في اكتشاف الأطعمة الآمنة تماماً والتواصل مع كوكبة من أفضل استشاريي التغذية بكل أريحية."
      : "Saleem is your first application specializing in food allergen management, helping you discover safe products and connect with experts with ease.",
    startJourney: isRtl ? "تصفح كضيف 🚀" : "Browse as Guest 🚀",
    signIn: isRtl ? "تسجيل الدخول" : "Sign In",
    safeLabel: isRtl ? "خالي من اللاكتوز" : "Lactose Free",
    askLabel: isRtl ? "اسأل سليم" : "Ask Saleem",
    safeTitle: isRtl ? "سلامتك خطنا الأحمر" : "Your Safety First",
    safeDesc: isRtl 
      ? "نساعدك في تتبع مسببات الحساسية بدقة متناهية لضمان سلامة الأطعمة قبل تناولها."
      : "We help you track allergens with extreme accuracy to ensure the safety of every meal you eat.",
    aiTitle: isRtl ? "رفيق ذكي بالذكاء الاصطناعي" : "AI Companion",
    aiDesc: isRtl 
      ? "تحدث مع مساعدك الشخصي 'سليم' في أي وقت ليجيبك بدقة عن ملاءمة المكونات لملفك الصحي."
      : "Your personal assistant 'Saleem' is always ready to answer your questions about ingredients and products.",
    healthTitle: isRtl ? "صحتك تستحق الأفضل" : "Your Health is Precious",
    healthDesc: isRtl 
      ? "قاعدة بيانات متجددة للمنتجات الآمنة، ونخبة من أفضل خبراء التغذية في الأردن بلمسة زر."
      : "A constantly updated database of safe products and the best nutrition experts in Jordan at your fingertips.",
    footer: isRtl 
      ? "© 2026 تطبيق سليم - الرفيق الذكي للسلامة الغذائية. صُنع بكل حب لسلامتكم وصحتكم كأولوية قصوى."
      : "© 2026 Saleem AI Food Safety Companion. Made with love for your safety.",
  };

  const features = [
    {
      icon: <ShieldCheck size={24} color={T.mint} />,
      title: t.safeTitle,
      desc: t.safeDesc
    },
    {
      icon: <Brain size={24} color={T.blue} />,
      title: t.aiTitle,
      desc: t.aiDesc
    },
    {
      icon: <Heart size={24} color={T.red} />,
      title: t.healthTitle,
      desc: t.healthDesc
    }
  ];

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: `linear-gradient(135deg, ${T.dark} 0%, ${T.darker} 100%)`,
      color: "white",
      overflow: "hidden",
      position: "relative",
      direction: isRtl ? "rtl" : "ltr"
    }}>
      {/* Background Decorative Elements */}
      <div style={{
        position: "absolute",
        top: "-10%",
        right: isRtl ? "auto" : "-5%",
        left: isRtl ? "-5%" : "auto",
        width: "40vw",
        height: "40vw",
        background: `radial-gradient(circle, ${T.mint}15 0%, transparent 70%)`,
        borderRadius: "50%",
        zIndex: 0
      }} />
      <div style={{
        position: "absolute",
        bottom: "-5%",
        left: isRtl ? "auto" : "-5%",
        right: isRtl ? "-5%" : "auto",
        width: "30vw",
        height: "30vw",
        background: `radial-gradient(circle, ${T.blue}10 0%, transparent 70%)`,
        borderRadius: "50%",
        zIndex: 0
      }} />

      <div style={{ 
        maxWidth: 1200, 
        margin: "0 auto", 
        padding: "40px 24px",
        position: "relative",
        zIndex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh"
      }}>
        {/* Header */}
        <header style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between",
          gap: 12, 
          marginBottom: 80,
          flexDirection: "row"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <BrandIcon size={40} />
            <h1 style={{ 
              fontFamily: "Sora, sans-serif", 
              fontSize: 28, 
              fontWeight: 800, 
              letterSpacing: "-1px" 
            }}>Saleem</h1>
          </div>
          
          <button
            onClick={() => onLangChange(isRtl ? "en" : "ar")}
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              padding: "10px 18px",
              borderRadius: "14px",
              color: "white",
              fontSize: "14px",
              fontWeight: 750,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s"
            }}
          >
            <span>🌐</span>
            <span>{isRtl ? "English" : "العربية"}</span>
          </button>
        </header>

        {/* Hero Section */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: 80, 
          flex: 1, 
          padding: "40px 0",
          flexDirection: isRtl ? "row-reverse" : "row"
        }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ width: "50%", textAlign: isRtl ? "right" : "left" }}
          >
            <h2 style={{ 
              fontFamily: "Sora, sans-serif", 
              fontSize: isRtl ? 48 : 58, 
              fontWeight: 800, 
              lineHeight: 1.2, 
              marginBottom: 24, 
              color: "white" 
            }}>
              {t.heroTitlePart1} <br />
              <span style={{ background: "linear-gradient(90deg, #52B788, #3A6EF2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {t.heroTitlePart2}
              </span>
            </h2>
            <p style={{ 
              fontSize: 16, 
              color: "rgba(255,255,255,0.7)", 
              lineHeight: 1.8, 
              marginBottom: 40, 
              maxWidth: 500, 
              marginLeft: isRtl ? "auto" : "0",
              marginRight: isRtl ? "0" : "auto"
            }}>
              {t.heroDesc}
            </p>
            
            <div style={{ 
              display: "flex", 
              flexWrap: "wrap", 
              gap: 16,
              justifyContent: isRtl ? "flex-start" : "flex-start",
              flexDirection: isRtl ? "row-reverse" : "row"
            }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBrowseGuest}
                style={{ 
                  background: "#52B788", 
                  color: "#0B1526", 
                  border: "none", 
                  padding: "16px 32px", 
                  borderRadius: 16, 
                  fontSize: 17, 
                  fontWeight: 850, 
                  fontFamily: "Sora, sans-serif", 
                  cursor: "pointer", 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 10,
                  boxShadow: "0 10px 20px rgba(82,183,136,0.2)",
                  flexDirection: isRtl ? "row-reverse" : "row"
                }}
              >
                <span>{t.startJourney}</span>
                <ArrowRight size={20} style={{ transform: isRtl ? "rotate(180deg)" : "none" }} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onContinue}
                style={{ 
                  background: "rgba(255,255,255,0.05)", 
                  color: "white", 
                  border: "1px solid rgba(255,255,255,0.1)", 
                  padding: "16px 32px", 
                  borderRadius: 16, 
                  fontSize: 17, 
                  fontWeight: 700, 
                  fontFamily: "Sora, sans-serif", 
                  cursor: "pointer", 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 10
                }}
              >
                {t.signIn}
              </motion.button>
            </div>
          </motion.div>

          {/* Visual Element */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            style={{ width: "50%", display: "flex", justifyContent: "center" }}
          >
            <div style={{ 
              position: "relative", 
              width: 440, 
              height: 440, 
              background: "rgba(255,255,255,0.03)", 
              border: "1px solid rgba(255,255,255,0.1)", 
              borderRadius: 40, 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              transform: "rotate(-3deg)",
              transition: "transform 0.7s"
            }}>
              <div style={{ transform: "rotate(3deg)", textAlign: "center" }}>
                <BrandIcon size={120} />
                <div style={{ marginTop: 24, fontSize: 20, fontWeight: 800, color: "#52B788" }}>Safe & Smart</div>
              </div>
              
              {/* Floating Cards */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                style={{ 
                  position: "absolute", 
                  top: "10%", 
                  left: isRtl ? "auto" : -20, 
                  right: isRtl ? -20 : "auto", 
                  background: "white", 
                  padding: 16, 
                  borderRadius: 12, 
                  color: "#0B1526", 
                  boxShadow: "0 20px 40px rgba(0,0,0,0.3)", 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 12,
                  flexDirection: isRtl ? "row-reverse" : "row"
                }}
              >
                <span style={{ fontSize: 24 }}>🥛</span>
                <span style={{ fontWeight: 800, fontSize: 14 }}>{t.safeLabel}</span>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                style={{ 
                  position: "absolute", 
                  bottom: "20%", 
                  right: isRtl ? "auto" : -40, 
                  left: isRtl ? -40 : "auto", 
                  background: "#3A6EF2", 
                  padding: 16, 
                  borderRadius: 12, 
                  color: "white", 
                  boxShadow: "0 20px 40px rgba(0,0,0,0.3)", 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 12,
                  flexDirection: isRtl ? "row-reverse" : "row"
                }}
              >
                <span style={{ fontSize: 24 }}>🤖</span>
                <span style={{ fontWeight: 800, fontSize: 14 }}>{t.askLabel}</span>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, padding: "80px 0", marginTop: 40 }}>
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 24,
                padding: 32,
                textAlign: isRtl ? "right" : "left",
                transition: "all 0.3s"
              }}
            >
              <div style={{ 
                width: 56, 
                height: 56, 
                background: "rgba(255,255,255,0.05)", 
                borderRadius: 16, 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                marginBottom: 24, 
                marginLeft: isRtl ? "auto" : "0",
                marginRight: isRtl ? "0" : "auto"
              }}>
                {f.icon}
              </div>
              <h4 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, color: "white", fontFamily: "Sora, sans-serif" }}>{f.title}</h4>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>

        <footer style={{ 
          padding: "40px 0", 
          borderTop: "1px solid rgba(255,255,255,0.08)", 
          textAlign: "center",
          fontSize: 14,
          color: "rgba(255,255,255,0.4)"
        }}>
          {t.footer}
        </footer>
      </div>
    </div>
  );
}
