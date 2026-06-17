/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { T } from "../constants";
import { 
  Info, 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  Activity, 
  Grid, 
  List, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  MapPin, 
  Tag, 
  Check, 
  HelpCircle,
  SlidersHorizontal,
  Lock
} from "lucide-react";
import { ProductModal } from "../components/ProductModal";
import { motion, AnimatePresence } from "motion/react";
import { storage } from "../lib/storage";
import { mapAllergenName } from "../lib/allergyService";

export function FeedPage({ 
  products, 
  isGuest, 
  isLoading = false,
  onInteractionRequired, 
  lang = "en" 
}: { 
  products: any[], 
  isGuest?: boolean,
  isLoading?: boolean,
  onInteractionRequired?: () => void, 
  lang?: "ar" | "en" 
}) {
  console.log("[DEBUG] FeedPage mounted/rendered. products count:", products?.length, "isGuest:", isGuest, "isLoading:", isLoading);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  
  // Custom states for highly professional interactive catalog
  const [layoutMode, setLayoutMode] = useState<"grid" | "list">("grid");
  const [personalSafetyGuard, setPersonalSafetyGuard] = useState<boolean>(true); // Enabled by default to highlight user's safety profile

  // Retrieve user health profile
  const profile = storage.get("saleem_profile", { allergens: [], isGuest: true });
  
  // Safeguards list extracted from the profile (allergens is an array of objects or strings)
  const activeAllergens = (profile?.allergens || []).map((a: any) => {
    return typeof a === "string" ? a : (a?.allergenKey || a?.key || "");
  }).filter(Boolean);

  const isRtl = lang === "ar";

  const allergenArabic: Record<string, string> = {
    Dairy: "الحليب والألبان",
    Peanuts: "الفول السوداني",
    Gluten: "الغلوتين والقمح",
    Eggs: "البيض",
    Fish: "الأسماك",
    Soy: "الصويا",
    "Tree Nuts": "المكسرات الشجرية",
    Shellfish: "القشريات البحرية",
    Sesame: "السمسم",
    Mustard: "الخردل",
    None: "آمن إجمالي / بلا محاذير",
  };

  const allergenEmojis: Record<string, string> = {
    Dairy: "🥛",
    Peanuts: "🥜",
    Gluten: "🌾",
    Eggs: "🥚",
    Fish: "🐟",
    Soy: "🫘",
    "Tree Nuts": "🌰",
    Shellfish: "🦐",
    Sesame: "🌿",
    Mustard: "🌼",
    None: "✅",
  };

  const mapAllergen = (key: string) => {
    if (!key || key.toLowerCase() === "none") {
      return isRtl ? "آمن / بلا قلق" : "Allergen-Free Entry";
    }
    return mapAllergenName(key, isRtl ? "ar" : "en");
  };

  // Helper to determine if a product is a conflict for the active profile
  const checkHasConflict = (p: any) => {
    // Check multiple unsuitable allergens if present
    if (p.unsuitableAllergens && Array.isArray(p.unsuitableAllergens)) {
      return p.unsuitableAllergens.some((unsuitable: string) => 
        activeAllergens.some(a => a.toLowerCase() === unsuitable.toLowerCase())
      );
    }
    
    const allergenKey = p.allergenKey || p.allergen;
    if (!allergenKey || allergenKey.toLowerCase() === "none") return false;
    return activeAllergens.some(a => a.toLowerCase() === allergenKey.toLowerCase());
  };

  // 2. Comprehensive Translations Dictionary
  const t = {
    title: isRtl ? "" : "Clinical Food Registry",
    subtitle: isRtl ? "المرجع الطبي التفاعلي للتحقق من المنتجات ومطابقتها للمواصفات الصحية بالأردن" : "The JFDA-synchronized verification portal for safe food consumption",
    searchPlaceholder: isRtl ? "البحث عن منتج، علامة تجارية، أو مسبب حساسية..." : "Search by product name, manufacturer, or trigger...",
    viewStore: isRtl ? "معلومات منافذ البيع والتوفر" : "Verified Store Outlets",
    noProducts: isRtl ? "لم يتم العثور على سلع مطابقة لإعدادات المعايرة الوقائية الحالية" : "No products matched your safeguard parameters",
    personalShieldTitle: isRtl ? "درع الفلترة الذكي ومناعة الملف" : "Somatic Shield Profiling",
    personalShieldConnected: isRtl ? "فلتر الملف الشخصي: نشط" : "Profile Safeguard: ACTIVE",
    personalShieldGuest: isRtl ? "سجل لتفعيل الفلتر التلقائي" : "Sign in to isolate allergies",
    allAllergens: isRtl ? "الكل" : "Show All",
    safeOnlyFilter: isRtl ? "الآمن كلياً" : "100% Safe Choice",
    statsTotalTitle: isRtl ? "إجمالي السلع المراقبة" : "Monitored Goods",
    statsSafeTitle: isRtl ? "خيارات آمنة تماماً" : "Ultra-Safe Options",
    statsBrandsTitle: isRtl ? "العلامات التجارية المدمجة" : "Registered Brands",
    syncBadge: isRtl ? "قاعدة بيانات JFDA ملوّنة" : "Clinical Spec Sync: 2026 Live",
    clinicalIndicator: isRtl ? "يتم فرز الأغذية تلقائياً حسب محددات ملفك الصحي الحالي للوقاية من:" : "Products are automatically filtered based on your safe-profile preferences for:",
    safeBadge: isRtl ? "مطابق وآمن لملفك" : "Safe Selection",
    conflictBadge: isRtl ? "تحذير: يحتوي على حساسية مسجلة!" : "CONFLICT: Contains Allergy Trigger!",
    neutralSafe: isRtl ? "مكون مستبعد" : "No Conflict",
    brandLabel: isRtl ? "العلامة التجارية:" : "Producer Brand:",
    mySafeguardInactive: isRtl ? "تفعيل درع الملف" : "Somatic Shield: INACTIVE",
  };

  // 3. Process Products List with advanced filters
  const filtered = products.filter((p) => {
    // Hide conflicting products only when the safety guard is active
    if (personalSafetyGuard && activeAllergens.length > 0) {
      if (checkHasConflict(p)) {
        console.log("[DEBUG] Product hidden by safety guard:", p.name);
        return false;
      }
    }

    // Search query matches name, brand, or allergen
    const nameStr = p.name || "";
    const brandStr = p.brand || "";
    const itemAllergen = p.allergenKey || p.allergen || "None";
    const allergenArabicName = allergenArabic[itemAllergen] || "";

    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      nameStr.toLowerCase().includes(query) ||
      brandStr.toLowerCase().includes(query) ||
      itemAllergen.toLowerCase().includes(query) ||
      allergenArabicName.toLowerCase().includes(query);

    if (!matchesSearch) console.log("[DEBUG] Product hidden by search:", p.name);
    return matchesSearch;
  });
  
  console.log("[DEBUG] FeedPage final filtered products count:", filtered.length);

  // Calculate statistics for display indicators
  const totalInRegistry = products.length;
  const safeProductsCount = products.filter(p => {
    const allergy = p.allergenKey || p.allergen || "None";
    return !allergy || allergy.toLowerCase() === "none";
  }).length;
  
  // Extract unique brands count
  const uniqueBrands = Array.from(new Set(products.map(p => p.brand).filter(Boolean)));
  const totalBrandsCount = uniqueBrands.length || 8;

  const handleProductCardClick = (p: any) => {
    if (isGuest) {
      // Teaser: intercept the click and redirect to login so guests
      // are shown the value proposition before accessing full details.
      if (onInteractionRequired) onInteractionRequired();
      return;
    }
    setSelectedProduct(p);
  };


  // Loading skeleton — shown while the anonymous guest product fetch is in-flight.
  // Prevents the "no products" empty-state from rendering as a false result.
  if (isLoading) {
    return (
      <div style={{ padding: "32px", minHeight: "100%", background: "#F8FAFC", direction: isRtl ? "rtl" : "ltr" }}>
        {/* Pulse animation keyframes */}
        <style>{`
          @keyframes feedSkeleton {
            0%   { opacity: 1; }
            50%  { opacity: 0.45; }
            100% { opacity: 1; }
          }
          .feed-skel { animation: feedSkeleton 1.4s ease-in-out infinite; background: #E2E8F0; border-radius: 16px; }
        `}</style>

        {/* Skeleton search bar */}
        <div className="feed-skel" style={{ height: 52, borderRadius: 16, marginBottom: 32 }} />

        {/* Skeleton card grid — 6 placeholder cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 28 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ background: "white", borderRadius: 24, border: "1.5px solid #ECEFF4", padding: 24, boxShadow: "0 4px 10px rgba(15,23,42,0.03)" }}>
              <div className="feed-skel" style={{ height: 150, borderRadius: 18, marginBottom: 20 }} />
              <div className="feed-skel" style={{ height: 12, width: "40%", marginBottom: 10 }} />
              <div className="feed-skel" style={{ height: 20, width: "75%", marginBottom: 18 }} />
              <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                <div className="feed-skel" style={{ height: 28, width: 90, borderRadius: 10 }} />
                <div className="feed-skel" style={{ height: 28, width: 70, borderRadius: 10 }} />
              </div>
              <div className="feed-skel" style={{ height: 1, marginBottom: 16 }} />
              <div className="feed-skel" style={{ height: 14, width: "55%" }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "32px", minHeight: "100%", width: "100%", overflowY: "auto", background: "#F8FAFC", direction: isRtl ? "rtl" : "ltr" }}>
      
      {/* 3. Controls & Filter Bar Area */}
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        gap: "16px", 
        marginBottom: "32px",
        background: "white",
        borderRadius: "24px",
        padding: "24px",
        border: "1px solid #E2E8F0",
        boxShadow: "0 4px 12px rgba(15, 23, 42, 0.02)"
      }}>
        {/* Search Input and grid/list view buttons */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between", 
          gap: "16px", 
          flexWrap: "wrap",
          flexDirection: isRtl ? "row-reverse" : "row" 
        }}>
          {/* Main Search */}
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "12px", 
            background: "#F1F5F9", 
            border: "1.5px solid #E2E8F0", 
            borderRadius: "16px", 
            padding: "0 18px", 
            height: "52px", 
            flex: 1,
            minWidth: "280px",
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)",
            flexDirection: isRtl ? "row-reverse" : "row",
            transition: "all 0.2s"
          }}
          className="focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/10"
          >
            <Search size={20} color="#64748B" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              type="text"
              placeholder={t.searchPlaceholder}
              style={{ 
                flex: "1", 
                background: "none", 
                border: "none", 
                outline: "none", 
                fontSize: "14px", 
                fontWeight: "600",
                color: T.text, 
                textAlign: isRtl ? "right" : "left", 
                direction: isRtl ? "rtl" : "ltr" 
              }}
            />
          </div>

          {/* Interactive Actions - Layout Mode */}
          <div style={{ display: "flex", gap: "8px", flexDirection: isRtl ? "row-reverse" : "row", flexWrap: "wrap" }}>

            {/* Safety Guard Toggle */}
            {!isGuest && activeAllergens.length > 0 && (
              <button
                onClick={() => setPersonalSafetyGuard(v => !v)}
                title={personalSafetyGuard
                  ? (isRtl ? "إظهار جميع المنتجات" : "Show all products")
                  : (isRtl ? "إخفاء المنتجات المتعارضة" : "Hide conflicting products")}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "0 16px", height: 52, borderRadius: 16,
                  border: `1.5px solid ${personalSafetyGuard ? T.mintDark : "#E2E8F0"}`,
                  background: personalSafetyGuard ? `${T.mint}15` : "#F1F5F9",
                  color: personalSafetyGuard ? T.mintDark : "#64748B",
                  cursor: "pointer", fontWeight: 700, fontSize: 13,
                  transition: "all 0.2s",
                  flexDirection: isRtl ? "row-reverse" : "row",
                }}
              >
                <SlidersHorizontal size={16} />
                <span>{personalSafetyGuard
                  ? (isRtl ? "درع الحماية: نشط" : "Safety Guard: ON")
                  : (isRtl ? "درع الحماية: متوقف" : "Safety Guard: OFF")}</span>
              </button>
            )}

            {/* Layout Toggles */}
            <div style={{ display: "flex", background: "#F1F5F9", borderRadius: "16px", padding: "4px", border: "1.5px solid #E2E8F0" }}>
              <button
                onClick={() => setLayoutMode("grid")}
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "none",
                  background: layoutMode === "grid" ? "white" : "transparent",
                  color: layoutMode === "grid" ? T.blueDark : "#64748B",
                  cursor: "pointer",
                  boxShadow: layoutMode === "grid" ? "0 4px 6px -1px rgba(0,0,0,0.05)" : "none",
                  transition: "all 0.2s"
                }}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setLayoutMode("list")}
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "none",
                  background: layoutMode === "list" ? "white" : "transparent",
                  color: layoutMode === "list" ? T.blueDark : "#64748B",
                  cursor: "pointer",
                  boxShadow: layoutMode === "list" ? "0 4px 6px -1px rgba(0,0,0,0.05)" : "none",
                  transition: "all 0.2s"
                }}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Warning banner if user has profile conflict showing on top of list */}
      {personalSafetyGuard && activeAllergens.length > 0 && (
        <div style={{ 
          background: "linear-gradient(135deg, #EBF7F1 0%, #E8F2FB 100%)", 
          borderRadius: "20px", 
          padding: "18px 24px", 
          border: "1.5px solid #C0E8D5",
          marginBottom: "28px",
          display: "flex",
          alignItems: "center",
          gap: "14px",
          flexDirection: isRtl ? "row-reverse" : "row",
          boxShadow: "0 10px 25px -5px rgba(45, 158, 107, 0.08)"
        }}>
          <div style={{ 
            width: "36px", 
            height: "36px", 
            borderRadius: "10px", 
            backgroundColor: "rgba(45, 158, 107, 0.15)", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            color: T.mintDark
          }}>
            <ShieldCheck size={20} />
          </div>
          <div style={{ textAlign: isRtl ? "right" : "left", flex: 1 }}>
            <h4 style={{ margin: "0 0 2px 0", fontSize: "14px", fontWeight: "800", color: T.blueDark }}>
              {isRtl ? "درع الحماية لملفك الصحي نشط" : "Dynamic Safeguard Shield Enabled"}
            </h4>
            <span style={{ fontSize: "12px", color: T.textMid, fontWeight: "600", opacity: 0.9 }}>
              {t.clinicalIndicator} <strong style={{ color: T.red, fontWeight: 800 }}>{activeAllergens.map(a => mapAllergen(a)).join("، ")}</strong>
            </span>
          </div>
        </div>
      )}

      {/* 6. Products Collection Render */}
      {filtered.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ 
            padding: "50px 32px", 
            textAlign: "center", 
            background: "white", 
            borderRadius: "28px", 
            border: "1.5px dashed #E2E8F0", 
            color: T.grayDark, 
            fontWeight: 700 
          }}
        >
          <div style={{ width: "64px", height: "64px", margin: "0 auto 16px", borderRadius: "20px", background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8" }}>
            <HelpCircle size={32} style={{ margin: "auto" }} />
          </div>
          <p style={{ fontSize: "16px", color: T.textMid, marginBottom: "8px" }}>{t.noProducts}</p>
          <p style={{ fontSize: "13px", color: T.grayDark, fontWeight: 500 }}>
            {isRtl ? "جرب تخفيف فلاتر التصفية أو طبقة الحساسية المحددة للوصول للنتائج" : "Try relaxing your search terms or choosing another food group pill"}
          </p>
        </motion.div>
      ) : layoutMode === "grid" ? (
        
        /* 6.1 Grid Mode Layout */
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: "28px" }}>
          {filtered.map((p, idx) => {
            const hasConflict = checkHasConflict(p);
            const allergenVal = p.allergenKey || p.allergen || "None";
            const isAllergenFree = !p.allergenKey || p.allergenKey.toLowerCase() === "none";
            
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(idx * 0.05, 0.4) }}
                onClick={() => handleProductCardClick(p)}
                style={{
                  background: "white",
                  borderRadius: "24px",
                  border: hasConflict ? "1.5px solid #FCA5A5" : "1.5px solid #ECEFF4",
                  padding: "24px",
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: hasConflict ? "0 8px 20px rgba(239, 68, 68, 0.03)" : "0 4px 10px rgba(15, 23, 42, 0.03)",
                  position: "relative",
                  overflow: "hidden",
                  textAlign: isRtl ? "right" : "left",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-6px)";
                  e.currentTarget.style.boxShadow = hasConflict 
                    ? "0 20px 30px rgba(239, 68, 68, 0.08)" 
                    : "0 20px 30px rgba(15, 23, 42, 0.08)";
                  e.currentTarget.style.borderColor = hasConflict ? "#EF4444" : "#CBD5E1";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = hasConflict 
                    ? "0 8px 20px rgba(239, 68, 68, 0.03)" 
                    : "0 4px 10px rgba(15, 23, 42, 0.03)";
                  e.currentTarget.style.borderColor = hasConflict ? "#FCA5A5" : "#ECEFF4";
                }}
              >
                {/* Upper Card Area */}
                <div>
                  
                  {/* Image/Visual component */}
                  <div style={{ 
                    width: "100%", 
                    height: "150px", 
                    background: hasConflict ? "#FFF8F8" : "#F8FAFC", 
                    borderRadius: "18px", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    overflow: "hidden",
                    marginBottom: "20px",
                    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)",
                    border: hasConflict ? "1px solid rgba(239, 68, 68, 0.08)" : "1px solid #F1F5F9",
                    position: "relative"
                  }}>
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} referrerPolicy="no-referrer" />
                    ) : (
                      <span style={{ fontSize: "52px", filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.05))" }}>{p.emoji || "📦"}</span>
                    )}

                    {/* Quick Conflict Overlay indicator */}
                    {personalSafetyGuard && (
                      <div style={{ position: "absolute", top: "12px", right: "12px", left: "12px" }}>
                        {hasConflict ? (
                          <span style={{ 
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            background: "#EF4444",
                            color: "white",
                            borderRadius: "8px",
                            padding: "4px 10px",
                            fontSize: "10px",
                            fontWeight: 800,
                            boxShadow: "0 4px 10px rgba(239, 68, 68, 0.3)"
                          }}>
                            <ShieldAlert size={10} />
                            <span>{isRtl ? "مخالفة لملفك" : "Allergy Conflict"}</span>
                          </span>
                        ) : (
                          <span style={{ 
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            background: "#10B981",
                            color: "white",
                            borderRadius: "8px",
                            padding: "4px 10px",
                            fontSize: "10px",
                            fontWeight: 800,
                            boxShadow: "0 4px 10px rgba(16, 185, 129, 0.3)"
                          }}>
                            <ShieldCheck size={10} />
                            <span>{isRtl ? "آمن كلياً" : "Bio-Matched Safe"}</span>
                          </span>
                        )}
                      </div>
                    )}

                    {/* Teaser lock overlay for guests */}
                    {isGuest && (
                      <div style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: "18px",
                        background: "rgba(15,23,42,0.38)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backdropFilter: "blur(2px)",
                      }}>
                        <span style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          background: "rgba(255,255,255,0.92)",
                          borderRadius: "10px",
                          padding: "6px 12px",
                          fontSize: "11px",
                          fontWeight: 800,
                          color: "#0F172A",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                        }}>
                          <Lock size={11} />
                          <span>{isRtl ? "سجّل للمشاهدة" : "Sign in to view"}</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Brand & Title Info */}
                  <div style={{ marginBottom: "12px" }}>
                    <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", color: T.grayDark, fontWeight: 700, marginBottom: "4px" }}>
                      {p.brand || "Brand Unknown"}
                    </div>
                    <div style={{ fontFamily: "Sora, sans-serif", fontSize: "18px", fontWeight: 800, color: T.text, lineHeight: "1.3" }}>
                      {p.name}
                    </div>
                  </div>
                </div>

                {/* Lower Card Area - Badges & Shop Triggers */}
                <div>
                  
                  {/* Allergy Metadata Badges */}
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", margin: "14px 0 16px", flexDirection: isRtl ? "row-reverse" : "row" }}>
                    
                    {/* Primary allergen key indicator */}
                    <span style={{ 
                      background: isAllergenFree ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)", 
                      borderRadius: "10px", 
                      padding: "6px 12px", 
                      fontSize: "11px", 
                      fontWeight: 800, 
                      color: isAllergenFree ? T.mintDark : "#EF4444",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      flexDirection: isRtl ? "row-reverse" : "row"
                    }}>
                      <span>{allergenEmojis[allergenVal] || "⚠️"}</span>
                      <span>{mapAllergen(allergenVal)}</span>
                    </span>

                    {/* Verified Safe Profile match tag */}
                    {personalSafetyGuard && !hasConflict && (
                      <span style={{ 
                        background: "rgba(58, 110, 242, 0.08)", 
                        borderRadius: "10px", 
                        padding: "6px 12px", 
                        fontSize: "11px", 
                        fontWeight: 800, 
                        color: T.blueDark,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px"
                      }}>
                        <Check size={11} />
                        <span>{isRtl ? "مطابق" : "Safe Profile"}</span>
                      </span>
                    )}
                  </div>

                  {/* Footer Action - Outlet info */}
                  <div style={{ 
                    paddingTop: "16px", 
                    borderTop: "1.5px solid #F1F5F9", 
                    fontSize: "12px", 
                    color: hasConflict ? "#EF4444" : T.blue, 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "space-between",
                    fontWeight: 800,
                    flexDirection: isRtl ? "row-reverse" : "row"
                  }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", flexDirection: isRtl ? "row-reverse" : "row" }}>
                      <MapPin size={13} />
                      <span>{t.viewStore}</span>
                    </span>
                    <span style={{ fontSize: "14px" }}>{isRtl ? "←" : "→"}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (

        /* 6.2 Compact List Mode Layout */
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filtered.map((p, idx) => {
            const hasConflict = checkHasConflict(p);
            const allergenVal = p.allergenKey || p.allergen || "None";
            const isAllergenFree = !p.allergenKey || p.allergenKey.toLowerCase() === "none";

            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: Math.min(idx * 0.03, 0.3) }}
                onClick={() => handleProductCardClick(p)}
                style={{
                  background: "white",
                  borderRadius: "20px",
                  border: hasConflict ? "1.5px solid #FCA5A5" : "1.5px solid #E2E8F0",
                  padding: "16px 20px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px",
                  flexWrap: "wrap",
                  flexDirection: isRtl ? "row-reverse" : "row",
                  transition: "all 0.2s"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = hasConflict ? "#EF4444" : T.blue;
                  e.currentTarget.style.boxShadow = "0 8px 16px rgba(15,23,42,0.05)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = hasConflict ? "#FCA5A5" : "#E2E8F0";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* Product primary block */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1, flexDirection: isRtl ? "row-reverse" : "row" }}>
                  <div style={{ 
                    width: "56px", 
                    height: "56px", 
                    borderRadius: "14px", 
                    background: hasConflict ? "#FFF1F2" : "#F8FAFC",
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    border: "1px solid #F1F5F9",
                    overflow: "hidden"
                  }}>
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} referrerPolicy="no-referrer" />
                    ) : (
                      <span style={{ fontSize: "28px" }}>{p.emoji || "📦"}</span>
                    )}
                  </div>

                  <div style={{ textAlign: isRtl ? "right" : "left" }}>
                    <div style={{ fontFamily: "Sora, sans-serif", fontSize: "16px", fontWeight: 800, color: T.text }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: "12px", color: T.grayDark, fontWeight: 600 }}>
                      {t.brandLabel} <strong style={{ color: T.textMid }}>{p.brand}</strong>
                    </div>
                  </div>
                </div>

                {/* Custom warning badges inside List Mode */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexDirection: isRtl ? "row-reverse" : "row" }}>
                  
                  {/* Allergen Spec Badge */}
                  <span style={{ 
                    background: isAllergenFree ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)", 
                    borderRadius: "10px", 
                    padding: "6px 12px", 
                    fontSize: "11px", 
                    fontWeight: 800, 
                    color: isAllergenFree ? T.mintDark : "#EF4444",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    flexDirection: isRtl ? "row-reverse" : "row"
                  }}>
                    <span>{allergenEmojis[allergenVal] || "⚠️"}</span>
                    <span>{mapAllergen(allergenVal)}</span>
                  </span>

                  {/* Micro-Safety Index Indicators */}
                  {personalSafetyGuard && (
                    hasConflict ? (
                      <span style={{ 
                        fontSize: "11px", 
                        fontWeight: 800, 
                        color: "#EF4444", 
                        background: "rgba(239,68,68,0.08)", 
                        padding: "6px 12px", 
                        borderRadius: "10px" 
                      }}>
                        {t.conflictBadge}
                      </span>
                    ) : (
                      <span style={{ 
                        fontSize: "11px", 
                        fontWeight: 800, 
                        color: T.mintDark, 
                        background: "rgba(16,185,129,0.08)", 
                        padding: "6px 12px", 
                        borderRadius: "10px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px"
                      }}>
                        <Check size={11} />
                        <span>{t.safeBadge}</span>
                      </span>
                    )
                  )}

                  <div style={{ 
                    padding: "10px", 
                    color: T.blue, 
                    fontSize: "12px", 
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  }}>
                    <span>{isRtl ? "عرض" : "Outlets"}</span>
                    <span style={{ fontSize: "14px" }}>{isRtl ? "←" : "→"}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* 7. Underneath Product Detail modal popup */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductModal 
            product={selectedProduct} 
            onClose={() => setSelectedProduct(null)} 
            lang={lang}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
