/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { T } from "../constants";
import { BrandIcon } from "../components/BrandIcon";
import { ArrowRight, ArrowLeft, BookOpen, Search, ShieldCheck, Sparkles, X, Globe } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface TourPageProps {
  onComplete: () => void;
}

export function TourPage({ onComplete }: TourPageProps) {
  const [step, setStep] = useState(0);

  const slides = [
    {
      title: "مرحباً بك في سليم",
      subtitle: "Saleem - رفيقك الذكي لسلامة الغذاء",
      content: "نحن هنا لمساعدتك في اكتشاف المنتجات الغذائية الآمنة لك ولعائلتك بناءً على حساسيتك الخاصة.",
      icon: <BrandIcon size={64} />,
      color: T.mint,
      image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=800"
    },
    {
      title: "قاعدة بيانات المنتجات",
      subtitle: "Products Catalog",
      content: "استعرض آلاف المنتجات والتحقق من مكوناتها. سليم ينبهك فوراً إذا كان المنتج يحتوي على أي مسببات للحساسية لديك.",
      icon: <Search size={40} />,
      color: T.blue,
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
    },
    {
      title: "موسوعة الحساسية (Wiki)",
      subtitle: "Allergy Wiki",
      content: "مكتبة متكاملة توفر لك معلومات دقيقة عن مسببات الحساسية، وطرق الوقاية منها، والبدائل الصحية المتاحة.",
      icon: <Globe size={40} />,
      color: T.mintDark,
      image: "https://images.unsplash.com/photo-1505751172676-d736c58ad982?auto=format&fit=crop&q=80&w=800"
    },
    {
      title: "تحليل المكونات بالذكاء الاصطناعي",
      subtitle: "AI Analysis",
      content: "نستخدم أحدث تقنيات الذكاء الاصطناعي لتحليل ملصقات الطعام المعقدة وتبسيطها لك لضمان أقصى درجات الأمان.",
      icon: <Sparkles size={40} />,
      color: T.mintDark,
      image: "https://images.unsplash.com/photo-1587854692152-cbe660feec91?auto=format&fit=crop&q=80&w=800"
    }
  ];

  const nextStep = () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const currentSlide = slides[step];

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "#F9FAFB", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      padding: "20px",
      direction: "rtl"
    }}>
      <div style={{
        background: "white",
        width: "100%",
        maxWidth: 1000,
        height: "80vh",
        borderRadius: 32,
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.1)",
        display: "flex",
        overflow: "hidden",
        position: "relative"
      }}>
        <button 
          onClick={onComplete}
          style={{
            position: "absolute",
            top: 24,
            left: 24,
            zIndex: 10,
            background: "rgba(255,255,255,0.8)",
            backdropFilter: "blur(4px)",
            border: "1px solid #E5E7EB",
            borderRadius: "50%",
            width: 40,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: T.text
          }}
        >
          <X size={20} />
        </button>

        {/* Left Side: Content */}
        <div style={{ flex: 1, padding: "60px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
            >
              <div style={{ 
                width: 80, 
                height: 80, 
                background: `${currentSlide.color}15`, 
                color: currentSlide.color,
                borderRadius: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 32
              }}>
                {currentSlide.icon}
              </div>

              <h1 style={{ fontFamily: "Sora, sans-serif", fontSize: 32, fontWeight: 800, color: T.text, marginBottom: 8 }}>
                {currentSlide.title}
              </h1>
              <h2 style={{ fontSize: 16, color: T.blue, fontWeight: 700, marginBottom: 24, textTransform: "uppercase", letterSpacing: 1 }}>
                {currentSlide.subtitle}
              </h2>
              <p style={{ fontSize: 18, lineHeight: 1.6, color: T.grayDark, marginBottom: 48, maxWidth: 400 }}>
                {currentSlide.content}
              </p>
            </motion.div>
          </AnimatePresence>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              onClick={nextStep}
              style={{
                height: 56,
                padding: "0 32px",
                background: T.blue,
                color: "white",
                border: "none",
                borderRadius: 16,
                fontSize: 16,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 12,
                boxShadow: "0 10px 15px -3px rgba(58, 110, 242, 0.3)"
              }}
            >
              <span>{step === slides.length - 1 ? "ابدأ الرحلة" : "التالي"}</span>
              <ArrowLeft size={20} />
            </button>

            {step > 0 && (
              <button
                onClick={prevStep}
                style={{
                  height: 56,
                  padding: "0 24px",
                  background: "transparent",
                  color: T.grayDark,
                  border: "none",
                  borderRadius: 16,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8
                }}
              >
                <ArrowRight size={20} />
                <span>السابق</span>
              </button>
            )}
          </div>

          {/* Progress Indicators */}
          <div style={{ display: "flex", gap: 8, marginTop: 40 }}>
            {slides.map((_, i) => (
              <div 
                key={i}
                style={{
                  width: i === step ? 32 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: i === step ? T.blue : "#E5E7EB",
                  transition: "all 0.3s ease"
                }}
              />
            ))}
          </div>
        </div>

        {/* Right Side: Image/Visual */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden", background: "#F3F4F6" }}>
          <AnimatePresence mode="wait">
            <motion.img
              key={step}
              src={currentSlide.image}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.6 }}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                position: "absolute",
                top: 0,
                left: 0
              }}
            />
          </AnimatePresence>
          <div style={{ 
            position: "absolute", 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            background: "linear-gradient(to right, white 0%, transparent 100%)" 
          }} />
        </div>
      </div>
    </div>
  );
}
