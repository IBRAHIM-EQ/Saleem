/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { T } from "../constants";
import { 
  ArrowRight, 
  Info, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Loader2, 
  Heart, 
  Search, 
  PhoneCall, 
  HelpCircle, 
  Sparkles,
  BookOpen,
  UserCheck,
  RefreshCw,
  Shield
} from "lucide-react";
import { getAllergenEmoji, getAllergyDetails, mapAllergenName } from "../lib/allergyService";
import { ProductModal } from "../components/ProductModal";
import { AnimatePresence, motion } from "motion/react";
import { storage } from "../lib/storage";

interface HomePageProps {
  profile: any;
  products: any[];
  totalProductCount?: number;
  onNavigateFeed: () => void;
  username: string | null;
  onProfileUpdate: (newUsername: string, newProfile: any) => void;
  isGuest?: boolean;
  onInteractionRequired?: () => void;
  lang?: "ar" | "en";
}

const translations = {
  ar: {
    hello: "مرحباً بك،",
    guest: "الزائر الكريم",
    allergenMonitoring: "سليم يتابع ويبسط سلامة غذائك لحمايتك من {count} مهيجات.",
    noAllergensYet: "ابدأ بتحديد مسببات الحساسية المخصصة في حسابك لسلامة تامة",
    totalProducts: "إجمالي الأطعمة",
    allergensTracked: "مسببات مراقبة",
    dailyTipTitle: "نصيحة الأمان الوقائي والسريرية",
    emergencyCardTitle: "مركز الطوارئ والدفاع المدني بالأردني",
    emergencyCardTitleSub: "تأهّب فوري على مدار 24 ساعة",
    emergencyCardDesc: "في حالات الاختناق أو صدمة الحساسية الحادة، استخدم إبرة الأدرينالين واتصل فوراً بأبطال الدفاع المدني على الخط الساخن 911.",
    safeProductsTitle: "الأطعمة والمنتجات الآمنة لك",
    seeAll: "تصفح كافة الدليل",
    searchPlaceholder: "البحث السريع في الأطعمة الآمنة والموثوقة...",
    noProductsFound: "لم نجد منتجات آمنة مطابقة لبحثك في هذا القسم.",
    loadingPersonalized: "جاري تحليل مكونات الأطعمة لمطابقتها مع ملفك الطبي...",
    aboutAllergy: "المعلومات الطبية لمسبب الحساسية",
    aboutAllergyDesc: "نظرة عامة سريرية",
    symptomsTitle: "الأعراض السريرية الشائعة",
    preventionTitle: "الوقاية والاحتراز بالأردن",
    avoidTitle: "مكونات وأطعمة تجنبها تماماً",
    alternativesTitle: "البدائل الآمنة الموصى بها",
    understandBtn: "فهمت الإرشاد الطبي، شكراً",
    severityLabel: "مستوى شدة التفاعل:",
    quickGuidance: "التصرف السليم العاجل",
    jordanGuideText: "اختر أي مسبب حساسية من القائمة أعلاه لعرض الدليل الطبي والغذائي المتكامل وبدائله المتاحة في الأردن.",
    safeBadge: "آمن ومعتمد لملفك",
    notTrackedWarn: "يرجى مراعاة تحديد مسببات حساسية لتفعيل المرشح الذكي.",
    viewScientificGuide: "انقر فوق مسببات الحساسية لعرض الدليل السريري المرفق 🔬",
  },
  en: {
    hello: "Welcome,",
    guest: "Guest Explorer",
    allergenMonitoring: "Saleem is actively monitoring your profile safety for {count} allergen triggers.",
    noAllergensYet: "Configure your allergen profile to activate customized biological surveillance.",
    totalProducts: "Total Monitored Foods",
    allergensTracked: "Allergens Tracked",
    dailyTipTitle: "Daily Prevention & Clinical Insight",
    emergencyCardTitle: "Jordan Civil Defense Emergencies",
    emergencyCardTitleSub: "24/7 Priority Emergency Line",
    emergencyCardDesc: "For acute anaphylactic reactions or airway tightness, administer your EpiPen and dial Jordan Civil Defense at 911 immediately.",
    safeProductsTitle: "Recommended Safe Food Catalog",
    seeAll: "Browse complete catalog",
    searchPlaceholder: "Fast search safe dishes & ingredients...",
    noProductsFound: "No safe products match your active search terms.",
    loadingPersonalized: "Analyzing molecular triggers and verifying food components...",
    aboutAllergy: "Allergy Clinical Intelligence Profile",
    aboutAllergyDesc: "Clinical Overview",
    symptomsTitle: "Common Clinical Symptoms",
    preventionTitle: "Guidance Prevention Measures",
    avoidTitle: "Critical Triggers & Additives to Avoid",
    alternativesTitle: "Certified Allergen-Safe Substitutes",
    understandBtn: "I understand the guidance, close",
    severityLabel: "Reaction Severity Level:",
    quickGuidance: "Medical Action Protocol",
    jordanGuideText: "Click on any active allergen above to view full chemical watchlists, local Jordan alternatives, and clinical diagnostic guidelines.",
    safeBadge: "Safe for your profile",
    notTrackedWarn: "Verify and choose your tracked allergens to activate smart safety guards.",
    viewScientificGuide: "Click any allergen above to view scientific advisory guidelines 🔬"
  }
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
};

const allergyTips = {
  Dairy: {
    ar: "شاورما وكفتة اللحم بالأردن: يُستعمل اللبن أو مصل الحليب أحياناً في التتبيلات لمنح اللحوم طراوة فائقة. يرجى توجيه المطعم صراحة قبل الطلب.",
    en: "Amman Shawarma & Kofta alert: Many local chefs use yogurt or milk whey solids in traditional meat marinades. Always notify staff before eating."
  },
  Peanuts: {
    ar: "محامص عمان المفتوحة (المحمص): يتم خلط الملاعق وتعبئة الحليب والمكسرات والفستق بنفس الأواني وآلات التحميص. التلوث الخلطي بها مرتفع للغاية؛ اشترِ العبوات المغلقة فقط.",
    en: "Amman open roasteries (Mahmas) pose a massive cross-contamination risk because scoops and roasting cylinders are shared. Always opt for factory-packaged nuts."
  },
  Gluten: {
    ar: "الفريكة ومفتول الضيعة بالأردن: تُطحن وتُحصد الفريكة المحلية بآلات مزارع مشتركة لحبوب القمح؛ اختر علامات تجارية موثقة بخلوها تماماً من الجلوتين.",
    en: "Local Jordan Freekeh and Maftoul: Often harvested and processed in shared local mills with wheat. Buy certified gluten-free labeled brands only."
  },
  Eggs: {
    ar: "كعك الطاوة والمعجنات بالأردن: تقوم الأفران بدهن المخبوزات بصفار بيض مسال لإعطاء لمعان ذهبي جذاب. اسأل خبازك إذا كان الخبز مدهوناً.",
    en: "Amman Ka'ak & Pastries: Sweet sesame Ka'ak and savory pastries are commonly brushed with raw egg yolk glaze for a shiny finish. Request unglazed items."
  },
  "Tree Nuts": {
    ar: "صواني الكنافة والحلويات العربية: الهريسة، البقلاوة، والكنافة الأردنية تُرش باللوز والفستق الحلبي، وتلامس الصواني والسكاكين ببعضها شائع. تجنب حلويات المتجر المشتركة.",
    en: "Arabic Bakery Trays: Traditional Jordan sweets like Knafeh and Baklava are often cross-contaminated via shared slicing knives and pistachio toppings."
  },
  Sesame: {
    ar: "الطحينية والقدحة بالأردن: الطحينة هي عنصر رئيسي في الحمص والفلافل المتبل. يرجى التنبيه على خلو وجبتك من سائل الطحين تماماً لتجنب الحساسية الحادة.",
    en: "Jordan Tahini warning: Tahini liquid is highly concentrated sesame and is deeply integrated into traditional hummus, mutabbal, and falafel. Ask for tahini-free sauces."
  },
  Mustard: {
    ar: "المخللات والصلصات الجاهزة: تُستخدم بذور الخردل بكثرة كمثبت في الصوصات غير الموثقة كالثومية وصوص الشاورما بالمطاعم الأردنية.",
    en: "Local Shawarma Garlic Sauce: Often contains hidden mustard paste or mustard oil as an emulsifier. Always consult the restaurant chef."
  },
  generic: {
    ar: "نصيحة سليم لحمايتك: اقرأ قائمة المكونات الخلفية كاملة للمنتج تحت خانة 'قد يحتوي على'. تفادَ البهارات المفتوحة السائبة لخطورة خلطها في المطاحن.",
    en: "Saleem safety advice: Always scan the back allergen warning label. Avoid scoop-dispensed unlabelled spices owing to frequent mill contamination."
  }
};

export function HomePage({ 
  profile, 
  products, 
  totalProductCount, 
  onNavigateFeed, 
  username, 
  onProfileUpdate, 
  isGuest, 
  onInteractionRequired,
  lang
}: HomePageProps) {
  // Read active preferred language
  const userLang = lang || (storage.get("saleem_preferred_lang", "en") as "ar" | "en");
  const t = translations[userLang];
  const isRtl = userLang === "ar";

  const [showAllergyModal, setShowAllergyModal] = useState(false);
  const [selectedAllergy, setSelectedAllergy] = useState<any | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [safeProducts, setSafeProducts] = useState<any[]>([]);
  const [loadingSafe, setLoadingSafe] = useState(!isGuest);
  
  const [calibrationState, setCalibrationState] = useState<"idle" | "scanning" | "success">("idle");
  const [scanProgress, setScanProgress] = useState(0);

  const startBioCalibration = () => {
    if (calibrationState === "scanning") return;
    setCalibrationState("scanning");
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setCalibrationState("success");
          setTimeout(() => {
            setCalibrationState("idle");
          }, 3500);
          return 100;
        }
        return prev + 25;
      });
    }, 450);
  };

  useEffect(() => {
    if (profile.allergens && profile.allergens.length > 0) {
      const safe = products.filter(p => {
        if (p.unsuitableAllergens && Array.isArray(p.unsuitableAllergens)) {
          const isTrigger = p.unsuitableAllergens.some((unsuitable: string) => {
            return profile.allergens.some((a: any) => {
              const k = typeof a === 'string' ? a : (a.allergenKey || a.key || "");
              return k.toLowerCase() === unsuitable.toLowerCase();
            });
          });
          return !isTrigger;
        }
        const allergenKey = p.allergenKey || p.allergen;
        if (!allergenKey) return true;
        const isTrigger = profile.allergens.some((a: any) => {
          const k = typeof a === 'string' ? a : (a.allergenKey || a.key || "");
          return k.toLowerCase() === allergenKey.toLowerCase();
        });
        return !isTrigger;
      });
      setSafeProducts(safe);
    } else {
      setSafeProducts(products);
    }
    setLoadingSafe(false);
  }, [products, profile.allergens]);

  const openAllergyDetails = (allergen: string) => {
    const details = getAllergyDetails(allergen, userLang);
    if (details) {
      setSelectedAllergy(details);
      setShowAllergyModal(true);
    }
  };

  // Extract tailored advice based on their clinical conditions
  const activeAllergens = profile.allergens || [];
  const activeTip = activeAllergens.length > 0 
    // @ts-ignore
    ? (allergyTips[typeof activeAllergens[0] === "string" ? activeAllergens[0] : (activeAllergens[0].allergenKey || activeAllergens[0].key)]?.[userLang] || allergyTips.generic[userLang])
    : allergyTips.generic[userLang];

  // Filtering products currently displayed
  const lowercaseQuery = searchQuery.toLowerCase().trim();
  const filteredProducts = safeProducts.filter(p => {
    if (!lowercaseQuery) return true;
    return (
      p.name.toLowerCase().includes(lowercaseQuery) ||
      (p.brand && p.brand.toLowerCase().includes(lowercaseQuery)) ||
      (p.desc && p.desc.toLowerCase().includes(lowercaseQuery))
    );
  }).slice(0, 8); // show up to 8 safe products in home bento grid

  return (
    <div 
      id="saleem_dashboard_page"
      style={{ 
        padding: "32px", 
        overflowY: "auto", 
        flex: 1, 
        background: "#F8FAFC",
        direction: isRtl ? "rtl" : "ltr"
      }}
    >
      {/* 1. Hero Clinical Guard Header */}
      <motion.div
        id="dashboard_hero_section"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          background: "linear-gradient(135deg, #101F35 0%, #172C4C 50%, #1F3F2F 100%)",
          borderRadius: "28px",
          padding: "36px 40px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "32px",
          border: "1px solid rgba(82, 183, 136, 0.15)",
          position: "relative",
          boxShadow: "0 20px 40px rgba(15, 23, 42, 0.15)",
          gap: "32px"
        }}
      >
        <div style={{ flex: "1 1 500px", zIndex: 2 }}>
          {/* Badge indicator */}
          <div 
            style={{ 
              display: "inline-flex", 
              alignItems: "center", 
              gap: "8px", 
              background: "rgba(82, 183, 136, 0.15)", 
              border: "1px solid rgba(82, 183, 136, 0.25)",
              color: T.mint,
              padding: "6px 14px",
              borderRadius: "50px",
              fontSize: "12px",
              fontWeight: 800,
              marginBottom: "16px",
              letterSpacing: isRtl ? "0" : "0.5px"
            }}
          >
            <UserCheck size={14} />
            <span>{isGuest ? (isRtl ? "تصفح زائر سريع" : "Guest Sandbox") : (isRtl ? "حساب سريري نشط" : "Clinical Active Account")}</span>
          </div>

          <h2
            style={{
              fontSize: "32px",
              fontWeight: 900,
              color: "white",
              marginBottom: "8px",
              letterSpacing: "-0.5px",
              display: "flex",
              alignItems: "center",
              gap: "10px"
            }}
          >
            {t.hello}{" "}
            <span style={{ color: T.mint, textShadow: "0 4px 12px rgba(82,183,136,0.2)" }}>
              {(profile.firstName && profile.lastName) ? `${profile.firstName} ${profile.lastName}` : (username || t.guest)}
            </span>{" "}
            👋
          </h2>
          
          <p
            style={{
              fontSize: "15px",
              color: "rgba(226, 232, 240, 0.8)",
              marginBottom: "24px",
              maxWidth: "580px",
              lineHeight: "1.6"
            }}
          >
            {activeAllergens.length > 0 
              ? t.allergenMonitoring.replace("{count}", String(activeAllergens.length))
              : t.noAllergensYet}
          </p>

          <div
            style={{
              fontSize: "10px",
              fontWeight: 800,
              letterSpacing: isRtl ? "0" : "1.5px",
              textTransform: "uppercase",
              color: "rgba(255, 255, 255, 0.4)",
              marginBottom: "12px",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <span>✨ {t.viewScientificGuide}</span>
          </div>

          {/* Interactive Allergy Badges in Hero */}
          <div className="flex gap-3 flex-wrap">
            {activeAllergens.length > 0 ? (
              activeAllergens.map((a: any, idx: number) => {
                const allergenKey = typeof a === "string" ? a : (a.allergenKey || a.key);
                const allergenSev = a.severity || "Moderate";
                
                const sevLevel: any = {
                  Mild: { label: isRtl ? "خفيف" : "Mild", color: "#10B981" },
                  Moderate: { label: isRtl ? "متوسط" : "Moderate", color: "#F59E0B" },
                  Severe: { label: isRtl ? "حاد" : "Severe", color: "#EF4444" }
                };
                const s = sevLevel[allergenSev] || sevLevel.Moderate;
                
                return (
                  <motion.div
                    key={`${allergenKey}-${idx}`}
                    whileHover={{ scale: 1.03, translateY: -2 }}
                    onClick={() => openAllergyDetails(allergenKey)}
                    className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-3 cursor-pointer hover:bg-white/10 hover:border-white/20 transition-all"
                    style={{ 
                      minWidth: "150px",
                      borderLeft: isRtl ? "none" : `3.5px solid ${s.color}`,
                      borderRight: isRtl ?  `3.5px solid ${s.color}` : "none",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
                    }}
                  >
                    <span className="text-2xl">{getAllergenEmoji(allergenKey)}</span>
                    <div>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: 800,
                          color: "rgba(255, 255, 255, 0.95)",
                        }}
                      >
                        {mapAllergenName(allergenKey, userLang)}
                      </div>
                      <div style={{ fontSize: "11px", fontWeight: 800, color: s.color }}>
                        {s.label}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div 
                style={{ 
                  color: "rgba(255, 255, 255, 0.45)", 
                  fontSize: "13px", 
                  background: "rgba(255, 255, 255, 0.05)",
                  padding: "10px 18px",
                  borderRadius: "14px",
                  border: "1.5px dashed rgba(255, 255, 255, 0.15)"
                }}
              >
                ⚠️ {t.notTrackedWarn}
              </div>
            )}
          </div>
        </div>

        {/* Counters metrics badge right-aligned */}
        <div 
          style={{ 
            display: "flex", 
            gap: "16px", 
            zIndex: 2, 
            flexWrap: "wrap",
            justifyContent: "center"
          }}
        >
          <div 
            style={{ 
              background: "rgba(255, 255, 255, 0.04)", 
              borderRadius: "20px", 
              padding: "20px 24px", 
              border: "1px solid rgba(255, 255, 255, 0.08)", 
              minWidth: "130px", 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center",
              boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
              backdropFilter: "blur(10px)"
            }}
          >
            <div style={{ fontSize: "32px", fontWeight: 900, color: T.mint, lineHeight: 1.1 }}>
              {totalProductCount || products.length}
            </div>
            <div 
              style={{ 
                fontSize: "10px", 
                color: "rgba(255, 255, 255, 0.45)", 
                fontWeight: 800, 
                textTransform: "uppercase", 
                letterSpacing: "0.5px", 
                marginTop: "4px" 
              }}
            >
              {t.totalProducts}
            </div>
          </div>
          
          <div 
            style={{ 
              background: "rgba(255, 255, 255, 0.04)", 
              borderRadius: "20px", 
              padding: "20px 24px", 
              border: "1px solid rgba(255, 255, 255, 0.08)", 
              minWidth: "130px", 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center",
              boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
              backdropFilter: "blur(10px)"
            }}
          >
            <div style={{ fontSize: "32px", fontWeight: 900, color: T.mint, lineHeight: 1.1 }}>
              {activeAllergens.length}
            </div>
            <div 
              style={{ 
                fontSize: "10px", 
                color: "rgba(255, 255, 255, 0.45)", 
                fontWeight: 800, 
                textTransform: "uppercase", 
                letterSpacing: "0.5px", 
                marginTop: "4px" 
              }}
            >
              {t.allergensTracked}
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. Bento Grid Section (Quick Safety Advice & Jordan Emergency Protocol) */}
      <div 
        id="dashboard_bento_grid"
        style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(12, 1fr)", 
          gap: "24px", 
          marginBottom: "32px" 
        }}
      >
        {/* Bento Box A: Clinical Advice Tip */}
        <motion.div
          id="bento_clinical_advice"
          whileHover={{ translateY: -3 }}
          transition={{ duration: 0.2 }}
          style={{
            gridColumn: "span 12",
            background: "white",
            borderRadius: "24px",
            padding: "28px",
            border: "1px solid #E2E8F0",
            boxShadow: "0 10px 25px rgba(226, 232, 240, 0.3)",
            display: "flex",
            gap: "20px",
            alignItems: "flex-start",
            flexDirection: "row"
          }}
        >
          <div 
            style={{ 
              width: "48px", 
              height: "48px", 
              background: T.blueLight, 
              borderRadius: "14px", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              flexShrink: 0 
            }}
          >
            <Sparkles size={24} color={T.blue} />
          </div>
          <div>
            <div 
              style={{ 
                fontSize: "11px", 
                fontWeight: 900, 
                color: T.blueDark, 
                letterSpacing: isRtl ? "0" : "1.5px", 
                textTransform: "uppercase", 
                marginBottom: "6px" 
              }}
            >
              💡 {t.dailyTipTitle}
            </div>
            <h4
              style={{
                fontSize: "16px",
                fontWeight: 800,
                color: T.text,
                lineHeight: "1.6",
                marginBottom: "8px"
              }}
            >
              {activeAllergens.length > 0 
                ? `${isRtl ? "تنبيه خاص بـ" : "Surveillance Tip for"} ${mapAllergenName(typeof activeAllergens[0] === 'string' ? activeAllergens[0] : (activeAllergens[0].allergenKey || activeAllergens[0].key), userLang)}` 
                : (isRtl ? "توجيه سليم العام للغذاء" : "General Dietary Safety Guard")}
            </h4>
            <p style={{ fontSize: "14px", color: T.textMid, lineHeight: "1.7", margin: "0" }}>
              {activeTip}
            </p>
          </div>
        </motion.div>

      </div>

      {/* 3. Section Title & Search Utilities */}
      <div 
        style={{ 
          display: "flex", 
          flexWrap: "wrap", 
          justifyContent: "space-between", 
          alignItems: "center", 
          gap: "16px",
          marginBottom: "20px",
          marginTop: "12px"
        }}
      >
        <div style={{ textAlign: isRtl ? "right" : "left" }}>
          <h3
            style={{
              fontSize: "20px",
              fontWeight: 900,
              color: T.text,
              margin: "0 0 4px 0"
            }}
          >
            {t.safeProductsTitle}
          </h3>
          <p style={{ margin: "0", fontSize: "12px", color: T.grayDark, fontWeight: 500 }}>
            {isRtl ? "تمت تصفية المنتجات غير المتوفق عليها تلقائياً" : "Automatically filtered to exclude your allergen triggers"}
          </p>
        </div>

        {/* Live Search & Filter Bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div 
            style={{ 
              position: "relative",
              background: "white",
              borderRadius: "12px",
              border: "1.5px solid #E2E8F0",
              height: "40px",
              display: "flex",
              alignItems: "center",
              padding: "0 12px",
              boxShadow: "inset 0 1px 3px rgba(0,0,0,0.02)",
              width: "250px"
            }}
          >
            <Search size={16} color={T.grayDark} style={{ marginRight: isRtl ? "0" : "8px", marginLeft: isRtl ? "8px" : "0" }} />
            <input 
              type="text" 
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: "none",
                background: "transparent",
                fontSize: "13px",
                color: T.text,
                outline: "none",
                width: "100%",
                fontWeight: 500
              }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                style={{ background: "none", border: "none", padding: "4px", cursor: "pointer", color: T.grayDark }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div
            onClick={onNavigateFeed}
            className="flex items-center gap-1.5 font-bold text-sm cursor-pointer hover:underline transition-all"
            style={{ color: T.blue }}
          >
            <span>{t.seeAll}</span>
            <ArrowRight size={16} style={{ transform: isRtl ? "rotate(180deg)" : "none" }} />
          </div>
        </div>
      </div>

      {/* Grid of Safe Products */}
      <div 
        id="products_dashboard_deck"
        style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(4, 1fr)", 
          gap: "24px" 
        }}
      >
        {loadingSafe ? (
          <div style={{ gridColumn: "span 4", padding: "80px 0", textAlign: "center", color: T.grayDark }}>
            <Loader2 size={36} className="animate-spin mx-auto mb-4 text-emerald-500" />
            <p style={{ fontWeight: 800 }}>{t.loadingPersonalized}</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map((p: any, idx: number) => (
            <motion.div
              layout
              whileHover={{ y: -6, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
              key={`${p.id || 'product'}-${idx}`}
              onClick={() => {
                if (isGuest && onInteractionRequired) {
                  onInteractionRequired();
                } else {
                  setSelectedProduct(p);
                }
              }}
              style={{ 
                background: "white", 
                borderRadius: "24px", 
                padding: "20px", 
                border: "1.5px solid #ECEFF4", 
                cursor: "pointer", 
                transition: "all 0.2s ease-out",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}
            >
              <div>
                <div
                  style={{ 
                    height: "150px", 
                    background: "#F8FAFC", 
                    borderRadius: "18px", 
                    border: "1px solid #ECEFF4", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    overflow: "hidden", 
                    marginBottom: "16px",
                    position: "relative"
                  }}
                >
                  {p.imageUrl ? (
                    <img 
                      src={p.imageUrl} 
                      alt={p.name} 
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                      referrerPolicy="no-referrer" 
                    />
                  ) : (
                    <span style={{ fontSize: "56px", filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.05))" }}>
                      {p.emoji || "📦"}
                    </span>
                  )}

                  {/* Absolute Safety Tag */}
                  <div 
                    style={{
                      position: "absolute",
                      top: "10px",
                      left: isRtl ? "auto" : "10px",
                      right: isRtl ? "10px" : "auto",
                      background: "rgba(255, 255, 255, 0.9)",
                      backdropFilter: "blur(4px)",
                      padding: "4px 10px",
                      borderRadius: "50px",
                      fontSize: "10px",
                      fontWeight: 800,
                      color: T.mintDark,
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.08)"
                    }}
                  >
                    <CheckCircle2 size={11} color={T.mint} />
                    <span>{t.safeBadge}</span>
                  </div>
                </div>

                <div 
                  style={{ 
                    fontSize: "11px", 
                    fontWeight: 800, 
                    color: T.grayDark, 
                    textTransform: "uppercase", 
                    marginBottom: "4px" 
                  }}
                >
                  {p.brand || "Saleem Select"}
                </div>
                
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: 900,
                    color: T.text,
                    lineHeight: "1.4",
                    marginBottom: "12px",
                  }}
                >
                  {p.name}
                </div>
              </div>

              {/* Action Button Label */}
              <div 
                style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  borderTop: "1px solid #ECEFF4",
                  paddingTop: "12px",
                  marginTop: "8px"
                }}
              >
                <span style={{ fontSize: "12px", color: T.grayDark, fontWeight: 500 }}>
                  {p.allergen === "None" ? (isRtl ? "طبيعي بالكامل" : "Allergen Free") : `${isRtl ? "خالٍ من:" : "No"} ${p.allergen}`}
                </span>
                <span style={{ fontSize: "12px", color: T.blue, fontWeight: 800, display: "flex", alignItems: "center", gap: "4px" }}>
                  <span>{isRtl ? "عرض" : "Inspect"}</span>
                  <ArrowRight size={12} style={{ transform: isRtl ? "rotate(180deg)" : "none" }} />
                </span>
              </div>
            </motion.div>
          ))
        ) : (
          <div style={{ gridColumn: "span 4", padding: "60px 40px", background: "white", border: "1.5px solid #ECEFF4", borderRadius: "24px", textAlign: "center", color: T.grayDark }}>
            <AlertTriangle size={40} style={{ margin: "0 auto 16px", color: T.blue }} />
            <h4 style={{ color: T.text, fontWeight: 800, fontSize: "16px", marginBottom: "8px" }}>{isRtl ? "لا يوجد أطعمة مطابقة" : "No Matches Found"}</h4>
            <p>{t.noProductsFound}</p>
          </div>
        )}
      </div>

       {/* Safe Product Detail Inspector Modal */}
       <AnimatePresence>
         {selectedProduct && (
           <ProductModal 
            product={selectedProduct} 
            onClose={() => setSelectedProduct(null)} 
           />
         )}
       </AnimatePresence>

       {/* Scientific Allergy Advisory Modal popup */}
       {showAllergyModal && selectedAllergy && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(22, 32, 46, 0.45)",
            backdropFilter: "blur(12px)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setShowAllergyModal(false)}
        >
           <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            style={{
              background: T.white,
              borderRadius: "28px",
              maxWidth: "600px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative",
              padding: "0",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              direction: isRtl ? "rtl" : "ltr",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ padding: "32px 32px 24px", borderBottom: "1px solid #F3F4F6", position: "relative" }}>
              <button 
                onClick={() => setShowAllergyModal(false)}
                style={{ 
                  position: "absolute", 
                  top: "24px", 
                  [isRtl ? "left" : "right"]: "24px", 
                  background: "#F3F4F6", 
                  border: "none", 
                  borderRadius: "50%", 
                  width: "36px", 
                  height: "36px", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  cursor: "pointer", 
                  color: T.text,
                  transition: "background 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#E5E7EB"}
                onMouseLeave={(e) => e.currentTarget.style.background = "#F3F4F6"}
              >
                <X size={20} />
              </button>
              
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "8px" }}>
                <div style={{ width: "64px", height: "64px", background: "#F1F5F9", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", border: "1.5px solid #E2E8F0" }}>
                  {selectedAllergy.emoji}
                </div>
                <div>
                  <h2 style={{ fontSize: "24px", fontWeight: 900, color: T.text, margin: "0" }}>{selectedAllergy.name}</h2>
                  <div style={{ fontSize: "11px", color: T.blue, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", marginTop: "4px" }}>
                    ⭐ {t.aboutAllergy}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: "24px 32px 32px" }}>
              {/* Description */}
              <div style={{ marginBottom: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", color: T.text, fontWeight: 800, fontSize: "14px" }}>
                  <Info size={16} style={{ color: T.blue }} />
                  <span>{t.aboutAllergyDesc}</span>
                </div>
                <p style={{ fontSize: "14px", lineHeight: "1.6", color: T.textMid, margin: "0" }}>{selectedAllergy.description}</p>
              </div>

              {/* Prevention & Symptoms */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px", marginBottom: "24px" }}>
                <div style={{ background: "#FFF1F2", padding: "18px", borderRadius: "16px", border: "1px solid #FFE4E6" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", color: "#E11D48", fontWeight: 800, fontSize: "13px" }}>
                    <AlertTriangle size={16} />
                    <span>{t.symptomsTitle}</span>
                  </div>
                  <p style={{ fontSize: "13px", lineHeight: "1.5", color: "#9F1239", margin: "0" }}>{selectedAllergy.symptoms}</p>
                </div>

                <div style={{ background: "#F0F9FF", padding: "18px", borderRadius: "16px", border: "1px solid #E0F2FE" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", color: "#0284C7", fontWeight: 800, fontSize: "13px" }}>
                    <ShieldAlert size={16} />
                    <span>{t.preventionTitle}</span>
                  </div>
                  <p style={{ fontSize: "13px", lineHeight: "1.5", color: "#0C4A6E", margin: "0" }}>{selectedAllergy.prevention}</p>
                </div>
              </div>

              {/* Food Lists */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "28px" }}>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 800, color: T.text, marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <X size={15} style={{ color: T.red }} />
                    <span style={{ color: T.red }}>{t.avoidTitle}</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {selectedAllergy.avoidFoods.map((food, i) => (
                      <span key={i} style={{ background: "#FFF1F2", color: "#E11D48", padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 700 }}>{food}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "13px", fontWeight: 800, color: T.text, marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <CheckCircle2 size={15} style={{ color: T.mintDark }} />
                    <span style={{ color: T.mintDark }}>{t.alternativesTitle}</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {selectedAllergy.safeFoods.map((food, i) => (
                      <span key={i} style={{ background: "#ECFDF5", color: "#047857", padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 700 }}>{food}</span>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setShowAllergyModal(false)}
                style={{ 
                  width: "100%", 
                  height: "48px", 
                  background: T.blue, 
                  color: "white", 
                  borderRadius: "14px", 
                  border: "none", 
                  fontSize: "14px", 
                  fontWeight: 800, 
                  cursor: "pointer", 
                  boxShadow: "0 8px 16px rgba(61, 130, 196, 0.25)",
                  transition: "background 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = T.blueDark}
                onMouseLeave={(e) => e.currentTarget.style.background = T.blue}
              >
                {t.understandBtn}
              </button>
            </div>
          </motion.div>
        </div>
       )}

    </div>
  );
}
