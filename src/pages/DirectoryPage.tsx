/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { T } from "../constants";
import {
  Mail,
  ShieldCheck,
  Star,
  Users,
  Search,
  Calendar,
  Clock,
  X,
  CheckCircle,
  FileText,
  BadgeAlert,
  Phone,
  Sparkles,
  Printer
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { storage } from "../lib/storage";

const WhatsAppIcon = ({ size = 18 }: { size?: number }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
    style={{ display: "inline-block", verticalAlign: "middle" }}
  >
    <path d="M12.004 2C6.48 2 2.014 6.47 2.014 12c0 1.91.53 3.69 1.45 5.22L2 22l4.95-1.3c1.55.85 3.32 1.3 5.06 1.3 5.53 0 10-4.47 10-10S17.534 2 12.004 2zm6.65 14.28c-.28.78-1.42 1.42-2.18 1.54-.62.1-1.43.14-2.28-.13-.85-.27-1.7-.54-2.55-1.02-3.19-1.81-5.32-5.06-5.48-5.28-.16-.22-1.31-1.74-1.31-3.32 0-1.58.82-2.35 1.11-2.66.29-.31.64-.39.85-.39h.61c.19 0 .44-.01.68.52.26.58.88 2.14.96 2.3.08.16.13.35.03.55-.1.2-.15.34-.31.52-.16.18-.34.4-.48.54-.16.16-.33.34-.14.67.19.33.85 1.39 1.82 2.26 1.25 1.11 2.3 1.45 2.63 1.61.33.16.52.13.72-.09.2-.22.86-1 .98-1.52.12-.52.24-.44.42-.38.18.06 1.16.55 1.36.65.2.1.33.15.38.24.05.09.05.51-.23 1.29z"/>
  </svg>
);

const formatWhatsAppNumber = (rawNum: string): string => {
  let clean = rawNum.replace(/\D/g, "");
  if (clean.startsWith("00")) {
    clean = clean.substring(2);
  }
  // Replace 9620 with 962 (handling +962 079... format error)
  if (clean.startsWith("9620") && clean.length === 13) {
    clean = "962" + clean.substring(4);
  }
  if (clean.startsWith("07") && clean.length === 10) {
    clean = "962" + clean.substring(1);
  } else if (clean.startsWith("7") && clean.length === 9) {
    clean = "962" + clean;
  }
  return clean;
};

export function DirectoryPage({ 
  specialists, 
  lang = "en" 
}: { 
  specialists: any[]; 
  lang?: "ar" | "en"; 
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [whatsAppPromptNumber, setWhatsAppPromptNumber] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  // Appointment Intake Modal State
  const [bookingSpecialist, setBookingSpecialist] = useState<any>(null);
  const [bookingForm, setBookingForm] = useState({
    patientName: "",
    phone: "",
    preferredDate: "",
    preferredTime: "10:00",
    advisoryMode: "clinic", // clinic, online, whatsapp
    notes: ""
  });
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [activeTicket, setActiveTicket] = useState<any>(null); // To show printable receipt

  const translateSpecialist = (s: any) => {
    // Inject locale-specific parameters (Cities & categories)
    // Map existing IDs to local Jordan details safely
    let category = "diet";
    let price = "JD 15";

    if (s.id === 1 || s.name?.includes("Sara")) {
      category = "allergy";
      price = "JD 25";
      if (lang === "ar") {
        return {
          ...s,
          name: "د. سارة النوري",
          title: "أخصائية تغذية علاجية · استشارية حساسية معتمدة",
          bio: "د. سارة النوري هي طبيبة أخصائية مسجلة بخبرة تزيد عن 8 سنوات متخصصة في تشخيص الحساسية الغذائية والأنظمة الإقصائية وخطط التغذية السريرية للأطفال والبالغين.",
          category,
          price,
        };
      }
    } else if (s.id === 2 || s.name?.includes("Khalid")) {
      category = "allergy";
      price = "JD 20";
      if (lang === "ar") {
        return {
          ...s,
          name: "د. خالد حسن",
          title: "بروفيسور حِميات وغذاء · خبير عدم تحمل الأطعمة",
          bio: "يتخصص الدكتور خالد حسن في إدارة حالات عدم تحمل القمح والغلوتين الصعبة، مع توجيه بروتوكولات حيوية لتعافي البيئة المعوية لمرضى السيلياك بكفاءة.",
          category,
          price,
        };
      }
    } else if (s.id === 3 || s.name?.includes("Lina")) {
      category = "pediatric";
      price = "JD 15";
      if (lang === "ar") {
        return {
          ...s,
          name: "أ. لينا مرزوق",
          title: "أخصائية تغذية مرخصة · مناعة وتغذية الأطفال",
          bio: "تتخصص السيدة لينا مرزوق في شؤون وبحوث تغذية الرضع وتجاوز صدمات الحساسية الغذائية المبكرة، لمساعدة العائلات في التغلب على التحديات الغذائية بذكاء وطمأنينة.",
          category,
          price,
        };
      }
    }

    // Default return for custom admin-created specialists
    return {
      ...s,
      category: s.category || "diet",
      price: s.price || "JD 15",
    };
  };

  const t = {
    title: lang === "ar" ? "دليل الأخصائيين الطبيين" : "Medical Specialist Directory",
    subtitle: lang === "ar" ? "تواصل واحجز موعد استشارة مع نخبة من أطباء الحساسية وأخصائيي التغذية المسجلين والمعتمدين بالأردن" : "Connect and schedule certified on-clinic consultations with Jordanian experts.",
    badgeLabel: lang === "ar" ? "أخصائي مرخص في سليم" : "Certified Saleem Specialists",
    certifiedBadge: lang === "ar" ? "أخصائي معتمد" : "Certified",
    expLabel: lang === "ar" ? "سنوات خبرة" : "years of experience",
    whatsappBtn: lang === "ar" ? "واتساب سريع" : "WhatsApp Chat",
    contactUnavailable: lang === "ar" ? "عذراً، رقم الهاتف غير متاح حالياً." : "Contact details are unavailable.",
    searchPlaceholder: lang === "ar" ? "ابحث باسم الطبيب، التخصص، أو الكلمات المفتاحية..." : "Search doctors, titles, or bios...",
    catAll: lang === "ar" ? "كل التخصصات" : "All Specialties",
    catAllergy: lang === "ar" ? "أخصائي حساسية" : "Allergy Specialist",
    catDiet: lang === "ar" ? "تغذية علاجية" : "Clinical Dietetics",
    catPediatric: lang === "ar" ? "أطفال ورضع" : "Pediatric Specialist",

    fees: lang === "ar" ? "رسوم الكشفية المقدرة:" : "Est. consultation fees:",
    bookBtn: lang === "ar" ? "حجز موعد استشارة الآن 🩺" : "Schedule Clinical Consultation 🩺",
    reviewsCount: lang === "ar" ? "تقييم" : "reviews",
    
    // Booking Form Strings
    bookingTitle: lang === "ar" ? "طلب حجز موعد طبي" : "Schedule Advisory Consulting",
    bookingSubtitle: lang === "ar" ? "أدخل تفاصيلك لمطابقة المواعيد المتاحة لدى الطبيب وإصدار تذكرة مسبقة مجاناً" : "Complete your profile details to obtain your admission clinical pass instantly.",
    patientNameLbl: lang === "ar" ? "اسم المريض الكامل (إلزامي)" : "Full Patient Name (Required)",
    patientNamePlc: lang === "ar" ? "مثال: حسام أحمد العلي" : "e.g., Hossam Ahmed Al-Ali",
    phoneLbl: lang === "ar" ? "رقم الهاتف الفعال بالأردن (إلزامي)" : "Active Jordan Tel. (Required)",
    phonePlc: lang === "ar" ? "مثال: 07XXXXXXXX" : "e.g., 0797123456",
    dateLbl: lang === "ar" ? "التاريخ المفضل للطلب" : "Preferred Date",
    timeLbl: lang === "ar" ? "الوقت المفضل" : "Preferred Time Slot",
    modeLbl: lang === "ar" ? "نوع الاستشارة المفضلة" : "Preferred Advisory Mode",
    modeClinic: lang === "ar" ? "في العيادة بالمركز الطبي (حضورياً)" : "In-Clinic Visit (On Person)",
    modeOnline: lang === "ar" ? "استشارة فيديو (Zoom أو Telegram)" : "Video Telehealth Call (Zoom)",
    modeWhatsapp: lang === "ar" ? "متابعة كتابية سريعة بالواتساب" : "Direct WhatsApp Follow-up",
    notesLbl: lang === "ar" ? "تفاصيل الأعراض ومسببات الحساسية" : "Medical Symptoms & Allergies Overview",
    notesPlc: lang === "ar" ? "يرجى ذكر أي أطعمة تسبب لك تهيجاً لتجهيز ملفك الطبي قبل الموعد..." : "Please enlist active food triggers so the expert prepares your clinical files...",
    submitBooking: lang === "ar" ? "تأكيد حجز الموعد وإصدار تذكرة الدخول" : "Confirm Clinical Appt & Generate Pass",
    errorRequired: lang === "ar" ? "يرجى تعبئة الحقول الإلزامية (الاسم الكامل ورقم الهاتف وتحديد تاريخ الموعد)" : "Please fill in all required fields (Full name, Phone and Date)",
    
    // Ticket Receipt Strings
    ticketTitle: lang === "ar" ? "تذكرة تأكيد الموعد الطبي 🎟️" : "Clinical Admission Ticket 🎟️",
    ticketSubtitle: lang === "ar" ? "سليم يهنئك! رصيدك آمن وتم تأكيد طلب الحجز ومطابقته لدى نظام الطبيب" : "Appointment confirmed! Show this clinical pass upon clinic reception check-in.",
    ticketCode: lang === "ar" ? "رقم التذكرة التعريفي:" : "Intake ID:",
    pName: lang === "ar" ? "اسم المريض المقيد:" : "Registered Patient:",
    dName: lang === "ar" ? "اسم الطبيب المعالج:" : "Assigned Specialist:",
    apptSched: lang === "ar" ? "الموعد المقيد للزيارة:" : "Scheduled Admission:",
    ticketDiscl: lang === "ar" ? "يرجى الوصول للعيادة قبل الموعد بـ 15 دقيقة مصطحباً بطاقة الأحوال وفحوص الحساسية الدموية إن وجدت." : "Please arrive 15 minutes prior to your slots. Bring any IgE blood test logs.",
    printBtn: lang === "ar" ? "طباعة تذكرة الحجز" : "Print Admission Pass",
    closeTicket: lang === "ar" ? "العودة للدليل الطبي" : "Back to Directory"
  };

  const categories = [
    { key: "all", label: t.catAll },
    { key: "allergy", label: t.catAllergy },
    { key: "diet", label: t.catDiet },
    { key: "pediatric", label: t.catPediatric }
  ];

  // Specialty & Location Filtering Algorithm
  const filteredSpecialists = specialists.map(s => translateSpecialist(s)).filter((s) => {
    const matchesCategory = selectedCategory === "all" || s.category === selectedCategory;

    const normQuery = searchQuery.toLowerCase().trim();
    if (!normQuery) return matchesCategory;

    const matchesName = s.name.toLowerCase().includes(normQuery);
    const matchesTitle = s.title.toLowerCase().includes(normQuery);
    const matchesBio = s.bio.toLowerCase().includes(normQuery);

    return matchesCategory && (matchesName || matchesTitle || matchesBio);
  });

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.patientName?.trim() || !bookingForm.phone?.trim() || !bookingForm.preferredDate) {
      setBookingError(t.errorRequired);
      return;
    }
    setBookingError(null);

    // Create printable receipt with customized ticket schema
    const ticketId = `SLM-${1000 + Math.floor(Math.random() * 8999)}-2026`;
    const newAppointment = {
      ticketId,
      specialistId: bookingSpecialist.id,
      specialistName: bookingSpecialist.name,
      specialistTitle: bookingSpecialist.title,
      patientName: bookingForm.patientName,
      phone: bookingForm.phone,
      preferredDate: bookingForm.preferredDate,
      preferredTime: bookingForm.preferredTime,
      advisoryMode: bookingForm.advisoryMode,
      notes: bookingForm.notes,
      createdAt: new Date().toISOString()
    };

    // Save historically to local storage safely
    const existing = storage.get("saleem_consultations", []);
    storage.set("saleem_consultations", [newAppointment, ...existing]);

    setActiveTicket(newAppointment);
    setBookingSpecialist(null); // Close Intake form
  };

  return (
    <div style={{ padding: "40px 32px", overflowY: "auto", flex: 1, direction: lang === "ar" ? "rtl" : "ltr", background: "#FAFBFD" }}>
      
      {/* Modern Dynamic Header and Intro Banner */}
      <header style={{ 
        marginBottom: "38px", 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "flex-end", 
        flexDirection: lang === "ar" ? "row" : "row-reverse", 
        flexWrap: "wrap", 
        gap: "20px",
        textAlign: lang === "ar" ? "right" : "left"
      }}>
        <div style={{ 
          background: "white", 
          padding: "10px 20px", 
          borderRadius: "16px", 
          border: "1px solid #E2E8F0",
          fontSize: "13.5px",
          fontWeight: 800,
          color: T.grayDark,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          direction: lang === "ar" ? "rtl" : "ltr"
        }}>
          <ShieldCheck size={18} style={{ color: T.mintDark }} />
          <span>{filteredSpecialists.length} {t.badgeLabel}</span>
        </div>

        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: lang === "ar" ? "flex-start" : "flex-start" }}>
            <div style={{ padding: "8px", background: `${T.blue}12`, borderRadius: "12px", color: T.blue }}>
              <Users size={24} />
            </div>
            <h2 style={{ fontFamily: "Sora, sans-serif", fontSize: "28px", fontWeight: 900, color: T.text, margin: 0 }}>
              {t.title}
            </h2>
          </div>
          <p style={{ fontSize: "14.5px", color: T.grayDark, fontWeight: 600, marginTop: "8px", marginBottom: 0 }}>
            {t.subtitle}
          </p>
        </div>
      </header>

      {/* Advanced Filter controls: Search + Category + Jordanian Clinics Locations */}
      <div style={{
        background: "white",
        borderRadius: "24px",
        border: "1.5px solid #E2E8F0",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "18px",
        marginBottom: "38px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.01)"
      }}>
        {/* Row 1: Search Inputs & Jordan Province Selector */}
        <div style={{ 
          display: "flex", 
          gap: "16px", 
          flexWrap: "wrap",
          flexDirection: lang === "ar" ? "row" : "row-reverse"
        }}>
          {/* Dynamic Search */}
          <div style={{ position: "relative", flex: "1 1 310px" }}>
            <Search 
              size={18} 
              style={{ 
                position: "absolute", 
                top: "15px", 
                [lang === "ar" ? "right" : "left"]: "18px", 
                color: T.grayDark 
              }} 
            />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                height: "48px",
                paddingLeft: lang === "ar" ? "16px" : "48px",
                paddingRight: lang === "ar" ? "48px" : "16px",
                borderRadius: "14px",
                border: "1.5px solid #CBD5E1",
                fontSize: "13.5px",
                fontWeight: 600,
                outline: "none"
              }}
            />
          </div>

        </div>

        {/* Row 2: Specialty Tabs */}
        <div style={{ 
          display: "flex", 
          gap: "8px", 
          overflowX: "auto",
          paddingBottom: "4px",
          scrollbarWidth: "none"
        }}>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "12px",
                  background: isSelected ? T.blue : "#F1F5F9",
                  color: isSelected ? "white" : T.textMid,
                  border: "none",
                  fontSize: "13px",
                  fontWeight: 800,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s"
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Specialists Visual UI Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))", gap: "28px" }}>
        {filteredSpecialists.map((s, idx) => {
          return (
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={s.id}
              style={{
                background: "white",
                borderRadius: "28px",
                border: "1.5px solid #E2E8F0",
                padding: "28px",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.01)",
                textAlign: lang === "ar" ? "right" : "left",
                position: "relative"
              }}
              whileHover={{ y: -5, boxShadow: "0 12px 24px -6px rgba(0,0,0,0.05)" }}
            >
              {/* Profile Top info row */}
              <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", flexDirection: lang === "ar" ? "row" : "row-reverse" }}>
                
                {/* Visual Bio section */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap", justifyContent: lang === "ar" ? "flex-start" : "flex-start" }}>
                    <h3 style={{ fontSize: "18px", fontWeight: 900, color: T.text, margin: 0 }}>
                      {s.name}
                    </h3>
                    <div style={{ background: `${T.mint}15`, color: T.mintDark, borderRadius: "8px", padding: "2px 8px", fontSize: "10px", fontWeight: 900, display: "flex", alignItems: "center", gap: "2px" }}>
                      <ShieldCheck size={12} />
                      <span>{t.certifiedBadge}</span>
                    </div>
                  </div>

                  <div style={{ fontSize: "13px", color: T.blue, fontWeight: 800, marginBottom: "8px" }}>
                    {s.title}
                  </div>

                  {/* Rating */}
                  <div style={{ display: "flex", gap: "12px", alignItems: "center", fontSize: "12.5px", color: T.grayDark, fontWeight: 700, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Star size={15} fill="#F59E0B" color="#F59E0B" />
                      <span>{s.rating || "4.9"}</span>
                    </div>
                  </div>
                </div>

                {/* Avatar Icon */}
                <div style={{ 
                  width: "68px", 
                  height: "68px", 
                  background: `linear-gradient(135deg, ${T.mintLight} 0%, #E0F2F1 100%)`, 
                  borderRadius: "20px", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  overflow: "hidden",
                  flexShrink: 0,
                  boxShadow: "0 6px 12px rgba(0,0,0,0.03)",
                  border: "1.5px solid #E2E8F0"
                }}>
                  {s.imageUrl ? (
                    <img src={s.imageUrl} alt={s.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} referrerPolicy="no-referrer" />
                  ) : (
                    <span style={{ fontSize: "32px" }}>👩‍⚕️</span>
                  )}
                </div>
              </div>

              {/* Specialist Clinical bio */}
              <p style={{ 
                fontSize: "13.5px", 
                color: T.textMid, 
                lineHeight: "1.6", 
                fontWeight: 500, 
                margin: 0,
                background: "#F8FAFC",
                padding: "12px 16px",
                borderRadius: "14px",
                border: "1px solid #F1F5F9"
              }}>
                {s.bio}
              </p>

              {/* Contact actions bar at bottom */}
              <div style={{ 
                display: "flex", 
                gap: "10px", 
                marginTop: "auto",
                borderTop: "1.5px solid #F1F5F9", 
                paddingTop: "16px",
              }}>
                {/* Whatsapp Trigger - Full Width Primary CTA */}
                <button
                  onClick={() => {
                    const num = s.whatsAppNumber || s.phoneNumber || s.phone || s.contact;
                    if (num) {
                      setWhatsAppPromptNumber(formatWhatsAppNumber(num));
                    } else {
                      alert(t.contactUnavailable);
                    }
                  }}
                  style={{
                    flex: 1,
                    height: "48px",
                    background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
                    border: "none",
                    borderRadius: "14px",
                    color: "white",
                    fontSize: "14px",
                    fontWeight: 850,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    boxShadow: "0 6px 14px rgba(37, 211, 102, 0.15)",
                    transition: "all 0.15s",
                    flexDirection: "row"
                  }}
                >
                  <WhatsAppIcon size={20} />
                  <span>
                    {lang === "ar" ? "واتس اب" : "WhatsApp"}
                  </span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Booking Form Intake Modal */}
      <AnimatePresence>
        {bookingSpecialist && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(15, 23, 42, 0.5)",
              backdropFilter: "blur(10px)",
              zIndex: 10000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
            onClick={() => setBookingSpecialist(null)}
          >
            <motion.div
              initial={{ scale: 0.94, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 15 }}
              style={{
                background: "white",
                borderRadius: "30px",
                maxWidth: "580px",
                width: "100%",
                maxHeight: "90vh",
                overflowY: "auto",
                position: "relative",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                direction: lang === "ar" ? "rtl" : "ltr"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div style={{ 
                padding: "28px 28px 20px", 
                borderBottom: "1.5px solid #F1F5F9", 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                flexDirection: lang === "ar" ? "row" : "row-reverse"
              }}>
                <div style={{ textAlign: lang === "ar" ? "right" : "left" }}>
                  <span style={{ fontSize: "11px", color: T.blue, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    {t.bookingTitle}
                  </span>
                  <h3 style={{ margin: "4px 0 0 0", fontSize: "20px", fontWeight: 900, color: T.text }}>
                    {t.bookingTitle} / {bookingSpecialist.name}
                  </h3>
                </div>
                <button 
                  onClick={() => setBookingSpecialist(null)}
                  style={{
                    background: "#F1F5F9",
                    border: "none",
                    borderRadius: "12px",
                    width: "36px",
                    height: "36px",
                    cursor: "pointer"
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleCreateAppointment} style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "20px" }}>
                
                <p style={{ margin: 0, fontSize: "13.5px", color: T.textMid, lineHeight: "1.6" }}>
                  {t.bookingSubtitle}
                </p>

                {bookingError && (
                  <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", color: "#B91C1C", padding: "12px 16px", borderRadius: "12px", fontSize: "13px", fontWeight: 700 }}>
                    ⚠️ {bookingError}
                  </div>
                )}

                {/* Patient Name */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 800, color: T.text }}>{t.patientNameLbl}</label>
                  <input
                    type="text"
                    required
                    placeholder={t.patientNamePlc}
                    value={bookingForm.patientName}
                    onChange={(e) => setBookingForm({ ...bookingForm, patientName: e.target.value })}
                    style={{
                      height: "48px",
                      padding: "0 16px",
                      borderRadius: "12px",
                      border: "1.5px solid #CBD5E1",
                      fontSize: "14px",
                      fontWeight: 600,
                      outline: "none"
                    }}
                  />
                </div>

                {/* Phone & Date */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "13px", fontWeight: 800, color: T.text }}>{t.phoneLbl}</label>
                    <input
                      type="tel"
                      required
                      placeholder={t.phonePlc}
                      value={bookingForm.phone}
                      onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                      style={{
                        height: "48px",
                        padding: "0 16px",
                        borderRadius: "12px",
                        border: "1.5px solid #CBD5E1",
                        fontSize: "14px",
                        fontWeight: 650,
                        outline: "none",
                        textAlign: "left"
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "13px", fontWeight: 800, color: T.text }}>{t.dateLbl}</label>
                    <input
                      type="date"
                      required
                      value={bookingForm.preferredDate}
                      onChange={(e) => setBookingForm({ ...bookingForm, preferredDate: e.target.value })}
                      style={{
                        height: "48px",
                        padding: "0 16px",
                        borderRadius: "12px",
                        border: "1.5px solid #CBD5E1",
                        fontSize: "14px",
                        fontWeight: 800,
                        outline: "none"
                      }}
                    />
                  </div>
                </div>

                {/* Time & Advisory Type */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "13px", fontWeight: 800, color: T.text }}>{t.timeLbl}</label>
                    <input
                      type="time"
                      value={bookingForm.preferredTime}
                      onChange={(e) => setBookingForm({ ...bookingForm, preferredTime: e.target.value })}
                      style={{
                        height: "48px",
                        padding: "0 16px",
                        borderRadius: "12px",
                        border: "1.5px solid #CBD5E1",
                        fontSize: "14px",
                        fontWeight: 800,
                        outline: "none"
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "13px", fontWeight: 800, color: T.text }}>{t.modeLbl}</label>
                    <select
                      value={bookingForm.advisoryMode}
                      onChange={(e) => setBookingForm({ ...bookingForm, advisoryMode: e.target.value })}
                      style={{
                        height: "48px",
                        padding: "0 12px",
                        borderRadius: "12px",
                        border: "1.5px solid #CBD5E1",
                        fontSize: "13.5px",
                        fontWeight: 800,
                        color: T.text,
                        background: "white"
                      }}
                    >
                      <option value="clinic">{t.modeClinic}</option>
                      <option value="online">{t.modeOnline}</option>
                      <option value="whatsapp">{t.modeWhatsapp}</option>
                    </select>
                  </div>
                </div>

                {/* Patient Case description notes */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 800, color: T.text }}>{t.notesLbl}</label>
                  <textarea
                    rows={3}
                    placeholder={t.notesPlc}
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                    style={{
                      padding: "12px 16px",
                      borderRadius: "12px",
                      border: "1.5px solid #CBD5E1",
                      fontSize: "13.5px",
                      fontWeight: 500,
                      outline: "none",
                      resize: "none"
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    height: "54px",
                    borderRadius: "14px",
                    border: "none",
                    background: T.blue,
                    color: "white",
                    fontSize: "14.5px",
                    fontWeight: 900,
                    cursor: "pointer",
                    boxShadow: "0 6px 20px rgba(61, 130, 196, 0.2)",
                    marginTop: "10px"
                  }}
                >
                  {t.submitBooking}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Appointment Success Check-in Pass Pass Receipt Modal */}
      <AnimatePresence>
        {activeTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(15, 23, 42, 0.65)",
              backdropFilter: "blur(12px)",
              zIndex: 11000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
            onClick={() => setActiveTicket(null)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              style={{
                background: "white",
                borderRadius: "32px",
                maxWidth: "480px",
                width: "100%",
                boxShadow: "0 25px 60px rgba(0, 0, 0, 0.3)",
                direction: lang === "ar" ? "rtl" : "ltr",
                overflow: "hidden"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ background: "linear-gradient(135deg, #10B981 0%, #059669 100%)", padding: "32px 24px", color: "white", textAlign: "center" }}>
                <div style={{ width: "56px", height: "56px", background: "white", color: "#10B981", borderRadius: "50%", display: "flex", alignItems: "center", justifySelf: "center", justifyContent: "center", marginBottom: "16px", boxShadow: "0 6px 12px rgba(0,0,0,0.1)" }}>
                  <CheckCircle size={32} />
                </div>
                <h3 style={{ margin: 0, fontSize: "22px", fontWeight: 900, letterSpacing: -0.5 }}>{t.ticketTitle}</h3>
                <p style={{ margin: "8px 0 0 0", fontSize: "13px", opacity: 0.9, fontWeight: 500, lineHeight: 1.5 }}>
                  {t.ticketSubtitle}
                </p>
              </div>

              {/* Ticket Details Body representation */}
              <div style={{ padding: "28px" }} className="printable-ticket">
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", background: "#F8FAFC", border: "1.5px solid #E2E8F0", padding: "20px", borderRadius: "20px", position: "relative" }}>
                  
                  {/* Intake ID */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1.5px dashed #CBD5E1", paddingBottom: "12px", flexDirection: lang === "ar" ? "row" : "row-reverse" }}>
                    <span style={{ fontSize: "12px", color: T.grayDark, fontWeight: 700 }}>{t.ticketCode}</span>
                    <span style={{ fontSize: "14px", color: T.text, fontWeight: 900, fontFamily: "monospace" }}>{activeTicket.ticketId}</span>
                  </div>

                  {/* Specialist Name */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", textAlign: lang === "ar" ? "right" : "left" }}>
                    <span style={{ fontSize: "11.5px", color: T.grayDark, fontWeight: 700 }}>{t.dName}</span>
                    <span style={{ fontSize: "14.5px", color: T.text, fontWeight: 850 }}>{activeTicket.specialistName}</span>
                    <span style={{ fontSize: "12px", color: T.blue, fontWeight: 600 }}>{activeTicket.specialistTitle}</span>
                  </div>

                  {/* Patient Name */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", textAlign: lang === "ar" ? "right" : "left" }}>
                    <span style={{ fontSize: "11.5px", color: T.grayDark, fontWeight: 700 }}>{t.pName}</span>
                    <span style={{ fontSize: "14.5px", color: T.text, fontWeight: 800 }}>{activeTicket.patientName}</span>
                  </div>

                  {/* Appt Scheduled */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", textAlign: lang === "ar" ? "right" : "left" }}>
                    <span style={{ fontSize: "11.5px", color: T.grayDark, fontWeight: 700 }}>{t.apptSched}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: T.mintDark, fontWeight: 850, fontSize: "13.5px", justifyContent: lang === "ar" ? "flex-start" : "flex-start" }}>
                      <Calendar size={15} />
                      <span>{activeTicket.preferredDate}</span>
                      <Clock size={15} style={{ marginLeft: "8px" }} />
                      <span>{activeTicket.preferredTime}</span>
                    </div>
                  </div>

                  {/* Dummy clinical QR placeholder representation */}
                  <div style={{ display: "flex", justifyContent: "center", marginTop: "10px", borderTop: "1.5px dashed #CBD5E1", paddingTop: "14px" }}>
                    <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                      <div style={{ width: "96px", height: "96px", border: "1px solid #CBD5E1", padding: "6px", borderRadius: "12px", background: "white" }}>
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(activeTicket.ticketId)}`} 
                          alt="Admission Check-in QR Code" 
                          style={{ width: "100%", height: "100%" }} 
                        />
                      </div>
                      <span style={{ fontSize: "10px", color: T.grayDark, fontWeight: 700 }}>سليم لمطابقة السلامة الطبية</span>
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: "12px", color: T.textMid, lineHeight: "1.6", marginTop: "20px", textAlign: "center", fontWeight: 500 }}>
                  ℹ️ {t.ticketDiscl}
                </p>

                {/* Print and Return Command row */}
                <div style={{ display: "flex", gap: "12px", marginTop: "24px", flexDirection: lang === "ar" ? "row" : "row-reverse" }}>
                  <button
                    onClick={() => {
                      window.print();
                    }}
                    style={{
                      height: "50px",
                      borderRadius: "14px",
                      border: "1.5px solid #CBD5E1",
                      background: "white",
                      color: T.text,
                      fontSize: "13.5px",
                      fontWeight: 800,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      flex: 1
                    }}
                  >
                    <Printer size={18} />
                    <span>{t.printBtn}</span>
                  </button>

                  <button
                    onClick={() => setActiveTicket(null)}
                    style={{
                      height: "50px",
                      borderRadius: "14px",
                      border: "none",
                      background: T.blue,
                      color: "white",
                      fontSize: "13.5px",
                      fontWeight: 900,
                      cursor: "pointer",
                      flex: 1,
                      textAlign: "center"
                    }}
                  >
                    {t.closeTicket}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WhatsApp Redirect Confirmation Dialog */}
      <AnimatePresence>
        {whatsAppPromptNumber && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(15, 23, 42, 0.75)",
              backdropFilter: "blur(16px)",
              zIndex: 11000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px",
            }}
            onClick={() => setWhatsAppPromptNumber(null)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 15 }}
              style={{
                background: "white",
                borderRadius: "28px",
                maxWidth: "460px",
                width: "100%",
                padding: "32px",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
                textAlign: "center",
                position: "relative",
                direction: lang === "ar" ? "rtl" : "ltr"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                background: "rgba(37, 211, 102, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#128C7E",
                margin: "0 auto 24px auto",
              }}>
                <WhatsAppIcon size={36} />
              </div>

              <h3 style={{
                fontSize: "20px",
                fontWeight: 900,
                color: T.text,
                marginBottom: "14px",
                letterSpacing: "-0.5px"
              }}>
                {lang === "ar" ? "الانتقال إلى واتس اب" : "Navigate to WhatsApp"}
              </h3>

              <p style={{
                fontSize: "14px",
                lineHeight: "1.6",
                color: T.textMid,
                marginBottom: "28px",
                fontWeight: 550
              }}>
                {lang === "ar" 
                  ? "أنت على وشك الانتقال إلى تطبيق واتساب الخارجي للتواصل المباشر مع الأخصائي وتنسيق موعد جلسة الاستشارة الجديدة. هل تود الاستمرار في الانتقال؟" 
                  : "You are about to run external WhatsApp to contact this specialist and coordinate your advisory session. Would you like to proceed?"}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <button
                  onClick={() => {
                    const number = whatsAppPromptNumber;
                    setWhatsAppPromptNumber(null);
                    window.open(`https://wa.me/${number}`, '_blank');
                  }}
                  style={{
                    width: "100%",
                    height: "50px",
                    background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "16px",
                    fontSize: "15px",
                    fontWeight: 800,
                    cursor: "pointer",
                    boxShadow: "0 8px 20px rgba(37, 211, 102, 0.2)",
                    transition: "all 0.15s ease",
                  }}
                >
                  {lang === "ar" ? "استمرار إلى واتس اب" : "Proceed to WhatsApp"}
                </button>

                <button
                  onClick={() => setWhatsAppPromptNumber(null)}
                  style={{
                    width: "100%",
                    height: "50px",
                    background: "#F8FAFC",
                    color: T.textMid,
                    border: "1.5px solid #E2E8F0",
                    borderRadius: "16px",
                    fontSize: "15px",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {lang === "ar" ? "إلغاء وتراجع ❌" : "Cancel & Go Back ❌"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
