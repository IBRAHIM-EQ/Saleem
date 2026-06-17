import React from "react";
import { motion } from "motion/react";
import { ShieldCheck, Search, Users, BookOpen, Bell, ArrowLeft, ArrowRight } from "lucide-react";
import { T } from "../constants";

interface GuestIntroPageProps {
  onStartBrowsing: () => void;
  lang?: "ar" | "en";
}

export function GuestIntroPage({ onStartBrowsing, lang = "en" }: GuestIntroPageProps) {
  const isRtl = lang === "ar";

  const t = {
    welcome: isRtl ? "مرحباً بكم في" : "Welcome to",
    tagline: isRtl 
      ? "سليم هو المنصة الشاملة الأولى من نوعها لمساعدتك في التعايش السليم مع الحساسية الغذائية واتخاذ خيارات غذائية آمنة بكل ثقة واطمئنان."
      : "Saleem is the first comprehensive platform in the region dedicated to helping individuals with food allergies navigate their daily choices with confidence.",
    feature1Title: isRtl ? "إدارة مسببات الحساسية" : "Allergen Management",
    feature1Desc: isRtl 
      ? "تتبع مسببات الحساسية الغذائية وإدارتها بدقة مذهلة عبر ملفك الشخصي الذكي."
      : "Precisely track and manage your food allergies with our smart profiling system.",
    feature2Title: isRtl ? "اكتشاف ملاءمة المنتجات" : "Product Discovery",
    feature2Desc: isRtl 
      ? "تصفح آلاف المنتجات الغذائية والتحقق فوراً من خلوها التام والموثوق من مسببات الحساسية."
      : "Browse thousands of products verified for safety based on your specific allergens.",
    feature3Title: isRtl ? "استشاريو وأخصائيو التغذية" : "Expert Specialists",
    feature3Desc: isRtl 
      ? "تواصل مباشر مع نخبة من أخصائيي وأطباء التغذية المعتمدين للحصول على إرشادات وحلول تهمك."
      : "Connect with certified dietitians and medical experts for personalized guidance.",
    feature4Title: isRtl ? "موسوعة سليم المعرفية" : "Safe Wiki",
    feature4Desc: isRtl 
      ? "مكتبة علمية شاملة وموثوقة مليئة بالمعلومات والنصائح حول مكونات الأطعمة ومسببات الحساسية."
      : "A comprehensive library of information about allergens and ingredients.",
    readyToDiscover: isRtl ? "هل أنت مستعد لتصفح المنتجات الآمنة؟" : "Ready to discover safe products?",
    readyDesc: isRtl 
      ? "بصفتك ضيفاً، يمكنك تصفح الكاتالوج العام والبحث عن المنتجات. أنشئ حساباً مجانياً لتفعيل التصفية الذكائية التلقائية والتواصل المباشر مع استشاريي التغذية."
      : "As a guest, you can browse all verified products in our database. Create an account to unlock personalized filtering, expert consulting, and more.",
    btnCatalog: isRtl ? "الذهاب إلى دليل المنتجات 🍏" : "Go to Products Catalog",
  };

  const features = [
    {
      icon: <ShieldCheck size={28} color={T.mint} />,
      title: t.feature1Title,
      description: t.feature1Desc
    },
    {
      icon: <Search size={28} color={T.mint} />,
      title: t.feature2Title,
      description: t.feature2Desc
    },
    {
      icon: <Users size={28} color={T.mint} />,
      title: t.feature3Title,
      description: t.feature3Desc
    },
    {
      icon: <BookOpen size={28} color={T.mint} />,
      title: f => t.feature4Title, // dynamic title helper
      description: t.feature4Desc
    }
  ];

  return (
    <div style={{ padding: "40px 20px", maxWidth: 1000, margin: "0 auto", paddingBottom: 100, direction: isRtl ? "rtl" : "ltr" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: "center", marginBottom: 60 }}
      >
        <h1 style={{ fontFamily: "Sora, sans-serif", fontSize: 42, fontWeight: 900, color: T.text, marginBottom: 16 }}>
          {t.welcome} <span style={{ color: T.mint }}>Saleem</span>
        </h1>
        <p style={{ fontSize: 18, color: T.textMid, maxWidth: 650, margin: "0 auto", lineHeight: 1.6 }}>
          {t.tagline}
        </p>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, marginBottom: 80 }}>
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            style={{ 
              background: "white", 
              padding: 32, 
              borderRadius: 24, 
              border: "1px solid #E5E7EB",
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.02)",
              textAlign: isRtl ? "right" : "left"
            }}
          >
            <div style={{ 
              width: 56, 
              height: 56, 
              borderRadius: 16, 
              background: "rgba(82,183,136,0.1)", 
              display: "flex", 
              alignItems: "center", 
              justifyItems: "center", 
              justifyContent: "center", 
              marginBottom: 20,
              marginLeft: isRtl ? "auto" : "0",
              marginRight: isRtl ? "0" : "auto"
            }}>
              {f.icon}
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: T.text, marginBottom: 12 }}>{typeof f.title === "function" ? f.title(null) : f.title}</h3>
            <p style={{ color: T.textMid, lineHeight: 1.5, fontSize: 15 }}>{f.description}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        style={{ 
          background: "#0F172A", 
          borderRadius: 32, 
          padding: "60px 40px", 
          color: "white", 
          textAlign: "center",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div style={{ position: "relative", zIndex: 2 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 20 }}>{t.readyToDiscover}</h2>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.7)", marginBottom: 40, maxWidth: 600, margin: "0 auto 40px auto" }}>
            {t.readyDesc}
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStartBrowsing}
              style={{ 
                background: T.mint, 
                color: "#0F172A", 
                padding: "16px 32px", 
                borderRadius: 16, 
                fontSize: 18, 
                fontWeight: 800, 
                cursor: "pointer", 
                border: "none",
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexDirection: isRtl ? "row-reverse" : "row"
              }}
            >
              <span>{t.btnCatalog}</span>
              <ArrowRight size={20} style={{ transform: isRtl ? "rotate(180deg)" : "none" }} />
            </motion.button>
          </div>
        </div>
        
        {/* Abstract background elements */}
        <div style={{ position: "absolute", top: -50, right: -50, width: 200, height: 200, borderRadius: "50%", background: "rgba(82,183,136,0.1)", filter: "blur(40px)" }} />
        <div style={{ position: "absolute", bottom: -50, left: -50, width: 250, height: 250, borderRadius: "50%", background: "rgba(82,183,136,0.05)", filter: "blur(60px)" }} />
      </motion.div>
    </div>
  );
}
