/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { T } from "../constants";
import { motion, AnimatePresence } from "motion/react";
import { getAllAllergens, getAllergyDetails, mapAllergenName } from "../lib/allergyService";
import { 
  Info, 
  ShieldAlert, 
  Lightbulb, 
  X, 
  Search, 
  Heart, 
  Check, 
  Plus, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  BookOpen
} from "lucide-react";

export function WikiPage({ 
  lang = "en", 
  profile, 
  onUpdateProfile 
}: { 
  lang?: "ar" | "en"; 
  profile?: any; 
  onUpdateProfile?: (p: any) => void; 
}) {
  const [selectedAllergy, setSelectedAllergy] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const allergiesEn = [
    {
      id: 1,
      key: "Dairy",
      category: "dairy-bakery",
      name: "Milk Allergy",
      emoji: "🥛",
      color: "#F0F7FF",
      iconColor: "#3D82C4",
      borderColor: "#BFDBFE",
      description: "An immune reaction to proteins found in cow's milk and its derivatives.",
      symptoms: ["Hives or skin rash", "Swelling of the lips and tongue", "Shortness of breath", "Vomiting or cramps"],
      avoid: ["Milk", "Cheese", "Yogurt", "Butter", "Ice cream", "Whey protein"],
      alternatives: ["Almond milk", "Oat milk", "Soy milk", "Coconut yogurt"],
      tip: "Always look for terms like 'Casein' and 'Whey' in the ingredients.",
    },
    {
      id: 2,
      key: "Peanuts",
      category: "nuts",
      name: "Peanut Allergy",
      emoji: "🥜",
      color: "#FFF7ED",
      iconColor: "#E65100",
      borderColor: "#FED7AA",
      description: "One of the most common and potentially severe types of allergies.",
      symptoms: ["Skin reactions", "Tingling in the mouth", "Digestive problems", "Anaphylaxis"],
      avoid: ["Peanuts", "Peanut butter", "Peanut oil", "Asian dishes using nuts"],
      alternatives: ["Sunflower butter", "Soy butter", "Tahini"],
      tip: "Peanuts may be present in factories that produce other sweets; pay attention to 'may contain traces' warnings.",
    },
    {
      id: 3,
      key: "Gluten",
      category: "dairy-bakery",
      name: "Gluten Allergy / Celiac",
      emoji: "🌾",
      color: "#F0FDF4",
      iconColor: "#2E7D32",
      borderColor: "#BBF7D0",
      description: "An autoimmune disorder where eating gluten leads to damage in the small intestine.",
      symptoms: ["Bloating and gas", "Persistent fatigue", "Skin rash", "Joint pain"],
      avoid: ["Wheat", "Barley", "Bulgur", "Traditional pasta", "Regular baked goods"],
      alternatives: ["Rice", "Corn", "Quinoa", "Potatoes"],
      tip: "Look for 'Gluten-Free' labels to ensure safety.",
    },
    {
      id: 4,
      key: "Eggs",
      category: "dairy-bakery",
      name: "Egg Allergy",
      emoji: "🥚",
      color: "#FEFCE8",
      iconColor: "#CA8A04",
      borderColor: "#FEF08A",
      description: "The second most common type of allergy in children.",
      symptoms: ["Eczema", "Nasal congestion", "Abdominal pain", "Allergic asthma"],
      avoid: ["Eggs", "Mayonnaise", "Egg-glazed pastries", "Some types of pasta"],
      alternatives: ["Plant-based egg substitutes", "Ground flaxseeds", "Mashed banana (in baking)"],
      tip: "Pay attention to ingredients like 'Albumin' and 'Lecithin' if derived from eggs.",
    },
    {
      id: 5,
      key: "Soy",
      category: "other",
      name: "Soy Allergy",
      emoji: "🌱",
      color: "#F4FBF7",
      iconColor: "#16A34A",
      borderColor: "#DCFCE7",
      description: "A reaction to soy protein, often beginning in childhood.",
      symptoms: ["Skin redness", "Diarrhea", "Nausea", "Facial swelling"],
      avoid: ["Soybeans", "Soy milk", "Soy sauce", "Soy oil"],
      alternatives: ["Coconut milk", "Coconut Aminos", "Other legumes"],
      tip: "Soy is present in many processed foods and vegetable oils; read labels carefully.",
    },
    {
      id: 6,
      key: "Tree Nuts",
      category: "nuts",
      name: "Tree Nut Allergy",
      emoji: "🌰",
      color: "#FDF6F0",
      iconColor: "#4E342E",
      borderColor: "#F5E6D3",
      description: "Allergy to nuts such as almonds, walnuts, and cashews.",
      symptoms: ["Throat swelling", "Coughing", "Stomach pain", "Weak pulse"],
      avoid: ["Almonds", "Walnuts", "Cashews", "Pistachios", "Hazelnuts"],
      alternatives: ["Seeds (like sunflower and pumpkin)", "Roasted chickpeas"],
      tip: "Nut oils may also be used in cosmetics; be careful.",
    },
    {
      id: 7,
      key: "Fish",
      category: "seafood",
      name: "Fish Allergy",
      emoji: "🐟",
      color: "#F0FDFA",
      iconColor: "#0D9488",
      borderColor: "#CCFBF1",
      description: "A reaction to fish proteins, which can develop at any stage of life.",
      symptoms: ["Skin rash", "Nasal congestion", "Nausea", "Asthma"],
      avoid: ["Tuna", "Salmon", "Cod", "Canned seafood"],
      alternatives: ["Legumes", "Chicken", "Red meat", "Plant-based Omega-3"],
      tip: "Avoid foods with unknown ingredients in seafood restaurants.",
    },
  ];

  const allergiesAr = [
    {
      id: 1,
      key: "Dairy",
      category: "dairy-bakery",
      name: "حساسية الحليب والألبان",
      emoji: "🥛",
      color: "#F0F7FF",
      iconColor: "#3D82C4",
      borderColor: "#BFDBFE",
      description: "رد فعل مناعي تجاه البروتينات الموجودة في حليب البقر ومشتقاته في الأطعمة المختلفة.",
      symptoms: ["طفح جلدي أو شرى (أرتيكاريا)", "انتفاخ الشفاه واللسان", "ضيق وصعوبة في التنفس", "تقيؤ أو تشنجات معوية وألم في المعدة"],
      avoid: ["الحليب بكافة أنواعه", "الأجبان بجميع أنواعها", "اللبن والزبادي والقشطة", "الزبدة والسمنة", "المثلجات والآيس كريم", "بروتين مصل اللبن (الواي)"],
      alternatives: ["حليب اللوز", "حليب الشوفان", "حليب الصويا", "لبن وجوز الهند"],
      tip: "ابحث دائماً عن مصطلحات مثل 'الكازين' (Casein) و'مصل اللبن' (Whey) في قائمة المكونات.",
    },
    {
      id: 2,
      key: "Peanuts",
      category: "nuts",
      name: "حساسية الفول السوداني",
      emoji: "🥜",
      color: "#FFF7ED",
      iconColor: "#E65100",
      borderColor: "#FED7AA",
      description: "واحدة من أكثر مسببات الحساسية الغذائية شيوعاً وأشدها خطورة وتأثيراً مفاجئاً.",
      symptoms: ["تفاعلات جلدية وحكة شديدة", "تنميل أو وخز في الفم وحوله", "مشاكل هضمية شديدة", "صدمة الحساسية المفرطة وضيق التنفس"],
      avoid: ["الفول السوداني", "زبدة الفول السوداني", "زيت الفول السوداني", "الحلويات والمكسرات المختلطة", "الأطباق الآسيوية التي تستخدم المكسرات"],
      alternatives: ["زبدة بذور عباد الشمس", "زبدة الصويا الآمنة", "الطحينة النقية"],
      tip: "قد يتواجد الفول السوداني في المصانع التي تنتج حلويات أخرى؛ انتبه دائماً لتحذير 'قد يحتوي على آثار من الفول السوداني'.",
    },
    {
      id: 3,
      key: "Gluten",
      category: "dairy-bakery",
      name: "حساسية الغلوتين ومرض السيلياك",
      emoji: "🌾",
      color: "#F0FDF4",
      iconColor: "#2E7D32",
      borderColor: "#BBF7D0",
      description: "اضطراب في المناعة الذاتية حيث يؤدي تناول الغلوتين إلى تلف جدار الأمعاء الدقيقة وصعوبة الامتصاص.",
      symptoms: ["انتفاخ شديد وغازات مزعجة", "تعب وإرهاق عام مستمر", "طفح جلدي وحكة", "ألم في العظام والمفاصل"],
      avoid: ["القمح والطحين العادي", "الشعير والجاودار", "البرغل والفريكة والسميد", "المعكرونة والسباغيتي التقليدية", "المخبوزات والحلويات العادية"],
      alternatives: ["طحين الأرز والذرة", "حبوب الكينوا", "البطاطا والنشا الطبيعي", "البقوليات والأرز البني"],
      tip: "ابحث دائماً عن ملصق أو شارة 'خالٍ من الغلوتين' (Gluten-Free) لضمان سلامتك التامة.",
    },
    {
      id: 4,
      key: "Eggs",
      category: "dairy-bakery",
      name: "حساسية البيض",
      emoji: "🥚",
      color: "#FEFCE8",
      iconColor: "#CA8A04",
      borderColor: "#FEF08A",
      description: "ثاني أكثر أنواع الحساسية الغذائية انتشاراً وشيوعاً لدى الأطفال والرضع.",
      symptoms: ["تهيج الجلد أو الأكزيما", "احتقان شديد بالأنف وعطاس", "آلام معوية وتشنجات في البطن", "الربو والضيق التحسسي"],
      avoid: ["البيض (البياض والصفار)", "صلصات المايونيز والترتار", "المعجنات والمخبوزات المدهونة بالبيض", "بعض أنواع المعكرونة غامقة اللون"],
      alternatives: ["بدائل البيض النباتية المصنعة", "بذور الكتان المطحونة والمبللة", "الموز المهروس أو التفاح المطبوخ (في الخبز)"],
      tip: "انتبه جيداً لقراءة المكونات والبحث عن 'الألبومين' (Albumin) و'الليسيتين' (Lecithin)، فكلاهما قد يشتقان من البيض.",
    },
    {
      id: 5,
      key: "Soy",
      category: "other",
      name: "حساسية الصويا",
      emoji: "🌱",
      color: "#F4FBF7",
      iconColor: "#16A34A",
      borderColor: "#DCFCE7",
      description: "رد هجومي خلايا المناعة على بروتين الصويا، وغالباً ما يبدأ في مرحلة الطفولة الأولى.",
      symptoms: ["احمرار وتورم شديد في الجلد", "الإسهال والمغص الهضمي", "الغثيان والدوار والتقيؤ", "تورم الشفاه والوجه بشكل ملحوظ"],
      avoid: ["فول الصويا الأخضر والناشف", "حليب الصويا ولبن الصويا", "صلصة التوفو والصلصات الآسيوية مثل الصويا صوص", "زيوت الصويا ومحسنات الخبز المشتقة منها"],
      alternatives: ["حليب اللوز وجوز الهند الأروماتي", "أمينو جوز الهند البديل للصلصة", "الحمص والعدس والبقوليات الأخرى آمنة المصدر"],
      tip: "تدخل الصويا ومشتقاتها في الغالبية العظمى من الأغذية المصنعة والزيوت المهدرجة؛ اقرأ نشرة المكونات بحذر تام.",
    },
    {
      id: 6,
      key: "Tree Nuts",
      category: "nuts",
      name: "حساسية المكسرات الشجرية",
      emoji: "🌰",
      color: "#FDF6F0",
      iconColor: "#4E342E",
      borderColor: "#F5E6D3",
      description: "رد فعل مفرط وتراكمي تجاه المكسرات التي تنمو على الأشجار كاللوز، الجوز، والكاجو والفستق.",
      symptoms: ["تورم سريع وحكّة في الحلق", "السعال المستمر وصعوبة البلع", "تشنجات وآلام في المعدة", "ضعف وتسارع في ضربات النبض"],
      avoid: ["اللوز والكاجو والفسق", "الجوز واللوز البرازيلي ومكسرات المكاديميا", "البندق وجوز البقان وزبدة هذه المكسرات", "العديد من الحلويات والشكولاتة الجاهزة"],
      alternatives: ["بذور السمسم وعباد الشمس واليقطين", "الحمص والترمس المحمص للتسالي", "جوز الهند غني النكهة"],
      tip: "تدخل زيوت المكسرات الشجرية بكثرة في مستحضرات التجميل والمرطبات؛ احرص على تتبعها أيضاً خارج مطبخك.",
    },
    {
      id: 7,
      key: "Fish",
      category: "seafood",
      name: "حساسية الأسماك",
      emoji: "🐟",
      color: "#F0FDFA",
      iconColor: "#0D9488",
      borderColor: "#CCFBF1",
      description: "رد فعل مناعي مفرط ومستمر تجاه بروتينات الأسماك، والتي يمكن أن تتطور في أي مرحلة من الحياة.",
      symptoms: ["طفح جلدي شديد وحكة", "احتقان وصعوبة بالتنفس", "الغثيان والقيئ فور التناول", "الربو وضيق في مجرى التنفس"],
      avoid: ["الأسماك الطازجة والمجمدة", "علب التونة والسردين والسلمون", "المرق والصلصات التي يدخل فيها مستخلص السمك"],
      alternatives: ["البقوليات الغنية بالبروتين", "الدواجن واللحوم الحمراء", "الأوميغا 3 المستخرج من الطحالب البحرية الآمنة"],
      tip: "يرجى تجنب طلب الأطعمة من مطابخ مشتركة في مطاعم السمك لتلافي حدوث تلوث تبادلي خطير بمعدات الطبخ.",
    },
  ];

  const baseAllergies = lang === "ar" ? allergiesAr : allergiesEn;
  const activeAllergensList = getAllAllergens(false); // get non-hidden/non-deleted ones

  const allergies = activeAllergensList.map((alg, index) => {
    // 1. Check if we have standard wiki content for this key
    const existing = baseAllergies.find((b) => b.key.toLowerCase() === alg.key.toLowerCase());
    if (existing) {
      return {
        ...existing,
        id: existing.id || index + 1,
        emoji: alg.emoji || existing.emoji,
      };
    }
    
    // 2. Otherwise treat as a custom or extra standard key (e.g. Shellfish, Sesame, Mustard)
    const details = getAllergyDetails(alg.key, lang);
    
    // Parse symptoms: can be a string, or string[], or comma-separated
    let symptomsArr: string[] = [];
    if (details?.symptoms) {
      if (Array.isArray(details.symptoms)) {
        symptomsArr = details.symptoms;
      } else if (typeof details.symptoms === "string") {
        symptomsArr = details.symptoms.split(/[،,.]+/).map(s => s.trim()).filter(Boolean);
      }
    }
    if (symptomsArr.length === 0) {
      symptomsArr = lang === "ar" ? ["تحسس أو تفاعلات غير مريحة عند التناول"] : ["Allergic reactions upon ingestion"];
    }

    const nameText = details?.name || mapAllergenName(alg.key, lang);
    const descText = details?.description || (lang === "ar" ? `مسبب حساسيات معتمد في نظام سليم.` : `Approved allergen in Saleem system.`);
    
    let avoidArr = (details?.avoidFoods && details.avoidFoods.length > 0) ? details.avoidFoods : [alg.key];
    if (typeof avoidArr === "string") {
      avoidArr = (avoidArr as string).split(/[،,.]+/).map(s => s.trim()).filter(Boolean);
    }

    let alternativesArr = (details?.safeFoods && details.safeFoods.length > 0) ? details.safeFoods : (lang === "ar" ? ["استشارة أخصائي التغذية للبدائل والخيارات الآمنة"] : ["Consult dietitian for safe alternative options"]);
    if (typeof alternativesArr === "string") {
      alternativesArr = (alternativesArr as string).split(/[،,.]+/).map(s => s.trim()).filter(Boolean);
    }

    const tipText = details?.prevention || (lang === "ar" ? "قراءة ملصق المكونات والتحقق من شعار خلو المنتج قبل الشراء." : "Read ingredients list carefully and check certified labels.");

    return {
      id: 5000 + index, // unique ID
      key: alg.key,
      category: details?.type === "Food" || details?.type === "Food Allergy" ? "dairy-bakery" : "other", // default categorization
      name: nameText,
      emoji: alg.emoji,
      color: index % 3 === 0 ? "#F0F7FF" : index % 3 === 1 ? "#FFF7ED" : "#F4FBF7",
      iconColor: index % 3 === 0 ? "#3D82C4" : index % 3 === 1 ? "#E65100" : "#16A34A",
      borderColor: index % 3 === 0 ? "#BFDBFE" : index % 3 === 1 ? "#FED7AA" : "#DCFCE7",
      description: descText,
      symptoms: symptomsArr,
      avoid: avoidArr,
      alternatives: alternativesArr,
      tip: tipText,
    };
  });

  const t = {
    title: lang === "ar" ? "موسوعة الحساسية الرقمية" : "Digital Allergy Wiki",
    subtitle: lang === "ar" ? "دليل ممتد وأكاديمي تم إعداده وتدقيقه بواسطة خبراء سليم ومطابقتهم الطبية لسلامتك" : "An academic guidance catalog peer-reviewed by Saleem medical experts for your safety.",
    aboutTitle: lang === "ar" ? "الوصف الطبي والسريري" : "Clinical Description",
    symptomsTitle: lang === "ar" ? "أبرز الأعراض والمظاهر الجسدية" : "Core Pathological Symptoms",
    avoidTitle: lang === "ar" ? "🚫 أطعمة ومصادر ممنوعة" : "🚫 Avoid Checklist",
    alternativesTitle: lang === "ar" ? "✅ بدائل غذائية وطبيعية آمنة" : "✅ Certified Replacements",
    tipTitle: lang === "ar" ? "💡 توصية فريق سليم الطبي" : "💡 Saleem Clinical Advisor",
    profileMeta: lang === "ar" ? "الرصد في الملف الطبي" : "Profile Clinical Track",
    activeMeta: lang === "ar" ? "مراقب نشط" : "Actingly Monitored",
    notTrackedMeta: lang === "ar" ? "غير مضاف لملفك" : "Unmonitored in Profile",
    closeBtn: lang === "ar" ? "العودة للموسوعة" : "Back to Catalog",
    searchPlaceholder: lang === "ar" ? "ابحث عن مسبب، عرض، بديل، أو منتج..." : "Search allergens, symptoms, or diets...",
    filterAll: lang === "ar" ? "الكل" : "All Space",
    filterDairy: lang === "ar" ? "🥛 المنتجات والمخبوزات" : "🥛 Dairy & Bakery",
    filterNuts: lang === "ar" ? "🥜 مكسرات وبذور" : "🥜 Nuts & Seeds",
    filterSeafood: lang === "ar" ? "🐟 مأكولات بحرية" : "🐟 Seafood",
    filterOther: lang === "ar" ? "🌱 أخرى" : "🌱 Other",
    disclaimer: lang === "ar" 
      ? "تنبيه طبي وهام: معلومات هذه الموسوعة هي مرجعية تثقيفية قائمة على الأدلة العلمية. هي لا تغني مطلقاً عن مراجعة أخصائي طبي مؤهل أو الفحوص السريرية المخبرية."
      : "Medical Warning: This encyclopedic guide is purely scientific and educational. It never substitutes customized consulting or in-person pathology tests.",
    activeMonitoringBadge: lang === "ar" ? "تحت المراقبة النشطة 🛡️" : "Monitored Active 🛡️",
    addToProfile: lang === "ar" ? "أضف لملف الحساسية الخاص بي" : "Add to My Safety Profile",
    removeFromProfile: lang === "ar" ? "إيقاف المراقبة وإزالة الحساسية" : "Stop Profile Monitoring",
    profileNotConfigured: lang === "ar" ? "لم تقم بتسجيل الدخول لحفظ الحيازة الطبية" : "Log in to link dynamic health telemetry",
  };

  const categories = [
    { key: "all", label: t.filterAll },
    { key: "dairy-bakery", label: t.filterDairy },
    { key: "nuts", label: t.filterNuts },
    { key: "seafood", label: t.filterSeafood },
    { key: "other", label: t.filterOther },
  ];

  // Logic to checks if allergen is actively tracked inside user profile
  const isCurrentlyTracked = (allergenKey: string) => {
    if (!profile || !profile.allergens) return false;
    return profile.allergens.some((a: any) => {
      const k = typeof a === "string" ? a : (a?.allergenKey || a?.key || "");
      return k.toLowerCase() === allergenKey.toLowerCase();
    });
  };

  // Toggle Tracking handler
  const handleToggleTracking = (allergenKey: string) => {
    if (!profile || !onUpdateProfile) return;
    
    // Check if user is a guest (guests can still save in client local memory!)
    const currentAllergens = profile.allergens || [];
    const exists = currentAllergens.some((a: any) => {
      const k = typeof a === "string" ? a : (a?.allergenKey || a?.key || "");
      return k.toLowerCase() === allergenKey.toLowerCase();
    });

    let updatedAllergens;
    if (exists) {
      updatedAllergens = currentAllergens.filter((a: any) => {
        const k = typeof a === "string" ? a : (a?.allergenKey || a?.key || "");
        return k.toLowerCase() !== allergenKey.toLowerCase();
      });
    } else {
      updatedAllergens = [...currentAllergens, { allergenKey, severity: "Severe" }];
    }

    onUpdateProfile({
      ...profile,
      allergens: updatedAllergens
    });
  };

  // Filtration algorithm
  const filteredAllergies = allergies.filter((allergy) => {
    const matchesCategory = selectedCategory === "all" || allergy.category === selectedCategory;
    const normQuery = searchQuery.toLowerCase().trim();
    if (!normQuery) return matchesCategory;

    const matchesName = allergy.name.toLowerCase().includes(normQuery);
    const matchesDesc = allergy.description.toLowerCase().includes(normQuery);
    const matchesSymptoms = allergy.symptoms.some((s) => s.toLowerCase().includes(normQuery));
    const matchesAvoid = allergy.avoid.some((a) => a.toLowerCase().includes(normQuery));
    const matchesAlternatives = allergy.alternatives.some((alt) => alt.toLowerCase().includes(normQuery));
    const matchesTip = allergy.tip.toLowerCase().includes(normQuery);

    return matchesCategory && (matchesName || matchesDesc || matchesSymptoms || matchesAvoid || matchesAlternatives || matchesTip);
  });

  return (
    <div style={{ padding: "40px 32px", overflowY: "auto", flex: 1, direction: lang === "ar" ? "rtl" : "ltr", background: "#FAFBFD" }}>

      {/* Hero Section */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "38px", 
        flexWrap: "wrap",
        gap: "18px",
        textAlign: lang === "ar" ? "right" : "left" 
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", justifyContent: lang === "ar" ? "flex-start" : "flex-start" }}>
            <span style={{ fontSize: "24px" }}>📚</span>
            <h2 style={{ fontFamily: "Sora, sans-serif", fontSize: "28px", fontWeight: 900, color: T.text, margin: 0 }}>
              {t.title}
            </h2>
          </div>
          <p style={{ fontSize: "14.5px", color: T.grayDark, fontWeight: 600, margin: 0, opacity: 0.9 }}>
            {t.subtitle}
          </p>
        </div>

        {/* Dynamic active status stats indicator */}
        <div style={{
          background: "white",
          border: "1.5px solid #E2E8F0",
          borderRadius: "18px",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)"
        }}>
          <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: T.mintDark, animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: "13.5px", fontWeight: 850, color: T.text }}>
            {lang === "ar" ? "الفحوص النشطة لملفك:" : "Active profile monitors:"} {(profile?.allergens?.length || 0)}
          </span>
        </div>
      </div>

      {/* Search & Navigation Bar */}
      <div style={{ 
        marginBottom: "36px"
      }}>
        {/* Real-time Input search field */}
        <div style={{ position: "relative" }}>
          <Search 
            size={20} 
            style={{ 
              position: "absolute", 
              top: "18px", 
              [lang === "ar" ? "right" : "left"]: "22px", 
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
              height: "56px",
              paddingLeft: lang === "ar" ? "20px" : "56px",
              paddingRight: lang === "ar" ? "56px" : "20px",
              borderRadius: "18px",
              border: "1.5px solid #E2E8F0",
              background: "white",
              fontSize: "15px",
              fontWeight: 600,
              boxShadow: "0 6px 16px rgba(0,0,0,0.015)",
              outline: "none",
              transition: "border-color 0.15s"
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{
                position: "absolute",
                top: "16px",
                [lang === "ar" ? "left" : "right"]: "18px",
                background: "#F1F5F9",
                border: "none",
                borderRadius: "50%",
                width: "24px",
                height: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer"
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Allergies Responsive Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: "24px" }}>
        {filteredAllergies.map((allergy, idx) => {
          const isTracked = isCurrentlyTracked(allergy.key);
          return (
            <motion.div
              key={allergy.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              onClick={() => setSelectedAllergy(allergy)}
              style={{
                background: "white",
                borderRadius: "28px",
                padding: "26px",
                border: `1.5px solid ${isTracked ? T.mint : "#E2E8F0"}`,
                cursor: "pointer",
                textAlign: lang === "ar" ? "right" : "left",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: "220px",
                boxShadow: isTracked ? `0 10px 20px ${T.mint}10` : "0 4px 6px -1px rgba(0,0,0,0.01)"
              }}
              whileHover={{ y: -6, boxShadow: "0 14px 24px -4px rgba(0,0,0,0.05)" }}
            >
              {/* Badge for actively tracked elements */}
              {isTracked && (
                <div style={{
                  position: "absolute",
                  top: "22px",
                  [lang === "ar" ? "left" : "right"]: "22px",
                  background: "#ECFDF5",
                  border: `1px solid ${T.mint}`,
                  color: T.mintDark,
                  borderRadius: "100px",
                  padding: "4px 10px",
                  fontSize: "11px",
                  fontWeight: 900,
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.mintDark }} />
                  <span>{t.activeMonitoringBadge}</span>
                </div>
              )}

              <div>
                <div 
                  style={{ 
                    width: "56px", 
                    height: "56px", 
                    borderRadius: "18px", 
                    background: allergy.color, 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    fontSize: "28px", 
                    marginBottom: "18px",
                    border: `1.5px solid ${allergy.borderColor}`
                  }}
                >
                  {allergy.emoji}
                </div>
                
                <h3 style={{ fontFamily: "Sora, sans-serif", fontSize: "19px", fontWeight: 900, color: T.text, marginBottom: "8px", marginTop: 0 }}>
                  {allergy.name}
                </h3>
                
                <p style={{ fontSize: "13.5px", color: T.textMid, lineHeight: "1.6", fontWeight: 500, margin: "0 0 16px 0" }}>
                  {allergy.description.substring(0, 100)}...
                </p>
              </div>

              {/* Action and status at bottom of card */}
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                borderTop: "1.5px solid #F1F5F9",
                paddingTop: "14px",
                marginTop: "10px"
              }}>
                <span style={{ fontSize: "12.5px", color: T.blue, fontWeight: 800, display: "flex", alignItems: "center", gap: "4px" }}>
                  {lang === "ar" ? "اقرأ التفاصيل الطبية" : "Read clinical details"} 
                  {lang === "ar" ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Detail Modal Overlay with AnimatePresence */}
      <AnimatePresence>
        {selectedAllergy && (
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
            onClick={() => setSelectedAllergy(null)}
          >
            <motion.div
              initial={{ scale: 0.94, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 15 }}
              style={{
                background: "white",
                borderRadius: "32px",
                maxWidth: "650px",
                width: "100%",
                maxHeight: "90vh",
                overflowY: "auto",
                position: "relative",
                padding: 0,
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                direction: lang === "ar" ? "rtl" : "ltr"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div style={{ 
                padding: "32px 32px 24px", 
                borderBottom: "1.5px solid #F1F5F9", 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "flex-start", 
                flexDirection: lang === "ar" ? "row" : "row-reverse" 
              }}>
                <button 
                  onClick={() => setSelectedAllergy(null)}
                  style={{ 
                    background: "#F1F5F9", 
                    border: "none", 
                    borderRadius: "14px", 
                    width: "40px", 
                    height: "40px", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    cursor: "pointer", 
                    color: T.text,
                    transition: "all 0.15s"
                  }}
                >
                  <X size={18} />
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                  <div style={{ textAlign: lang === "ar" ? "right" : "left" }}>
                    <h2 style={{ fontFamily: "Sora, sans-serif", fontSize: "24px", fontWeight: 900, color: T.text, marginBottom: "6px", marginTop: 0 }}>
                      {selectedAllergy.name}
                    </h2>
                    
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: lang === "ar" ? "flex-start" : "flex-start" }}>
                      <span style={{ fontSize: "13px", color: T.grayDark, fontWeight: 700 }}>{t.profileMeta}:</span>
                      <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: isCurrentlyTracked(selectedAllergy.key) ? T.mintDark : "#CBD5E1" }} />
                      <span style={{ fontSize: "13px", color: isCurrentlyTracked(selectedAllergy.key) ? T.mintDark : T.grayDark, fontWeight: 800 }}>
                        {isCurrentlyTracked(selectedAllergy.key) ? t.activeMeta : t.notTrackedMeta}
                      </span>
                    </div>
                  </div>

                  <div 
                    style={{ 
                      width: "72px", 
                      height: "72px", 
                      background: selectedAllergy.color, 
                      borderRadius: "22px", 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center", 
                      fontSize: "42px",
                      boxShadow: "inset 0 2px 4px rgba(0,0,0,0.03)",
                      border: `1.5px solid ${selectedAllergy.borderColor}`
                    }}
                  >
                    {selectedAllergy.emoji}
                  </div>
                </div>
              </div>

              {/* Body Content */}
              <div style={{ padding: "32px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  
                  {/* About Description */}
                  <div style={{ textAlign: lang === "ar" ? "right" : "left" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", justifyContent: lang === "ar" ? "flex-start" : "flex-start" }}>
                      <Info size={18} style={{ color: T.blue }} />
                      <h3 style={{ fontSize: "15.5px", fontWeight: 850, color: T.text, fontFamily: "Sora, sans-serif", margin: 0 }}>
                        {t.aboutTitle}
                      </h3>
                    </div>
                    <p style={{ fontSize: "14.5px", lineHeight: "1.7", color: T.textMid, fontWeight: 500, margin: 0 }}>
                      {selectedAllergy.description}
                    </p>
                  </div>

                  {/* Symptoms Alert Box */}
                  <div style={{ 
                    background: "#FEF2F2", 
                    padding: "22px 24px", 
                    borderRadius: "24px", 
                    border: "1px solid #FCA5A5", 
                    textAlign: lang === "ar" ? "right" : "left" 
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px", justifyContent: lang === "ar" ? "flex-start" : "flex-start" }}>
                      <ShieldAlert size={18} style={{ color: "#EF4444" }} />
                      <h3 style={{ fontSize: "15px", fontWeight: 850, color: "#991B1B", fontFamily: "Sora, sans-serif", margin: 0 }}>
                        {t.symptomsTitle}
                      </h3>
                    </div>
                    <ul style={{ 
                      paddingLeft: lang === "ar" ? 0 : "20px", 
                      paddingRight: lang === "ar" ? "20px" : 0, 
                      margin: 0, 
                      fontSize: "14px", 
                      color: "#991B1B", 
                      lineHeight: "1.8", 
                      listStyleType: "disc", 
                      fontWeight: 650 
                    }}>
                      {selectedAllergy.symptoms.map((s: string, idx: number) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Avoid & Alternatives Columns */}
                  <div style={{ 
                    display: "flex", 
                    flexWrap: "wrap", 
                    gap: "20px", 
                    width: "100%", 
                    flexDirection: lang === "ar" ? "row" : "row" 
                  }}>
                    
                    {/* Avoid list */}
                    <div style={{ 
                      flex: "1 1 250px", 
                      background: "#FFF5F5", 
                      border: "1px solid #FFE4E6", 
                      borderRadius: "24px", 
                      padding: "20px", 
                      textAlign: lang === "ar" ? "right" : "left" 
                    }}>
                      <h4 style={{ 
                        fontSize: "14.5px", 
                        fontWeight: 850, 
                        color: "#991B1B", 
                        marginBottom: "14px", 
                        marginTop: 0,
                        fontFamily: "Sora, sans-serif" 
                      }}>
                        {t.avoidTitle}
                      </h4>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: lang === "ar" ? "flex-start" : "flex-start" }}>
                        {selectedAllergy.avoid.map((s: string, idx: number) => (
                          <span 
                            key={idx} 
                            style={{ 
                              background: "white", 
                              color: "#B91C1C", 
                              padding: "6px 12px", 
                              borderRadius: "12px", 
                              fontSize: "12px", 
                              fontWeight: 750, 
                              border: "1px solid #FFE4E6" 
                            }}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Alternatives list */}
                    <div style={{ 
                      flex: "1 1 250px", 
                      background: "#ECFDF5", 
                      border: "1px solid #D1FAE5", 
                      borderRadius: "24px", 
                      padding: "20px", 
                      textAlign: lang === "ar" ? "right" : "left" 
                    }}>
                      <h4 style={{ 
                        fontSize: "14.5px", 
                        fontWeight: 850, 
                        color: "#065F46", 
                        marginBottom: "14px", 
                        marginTop: 0,
                        fontFamily: "Sora, sans-serif" 
                      }}>
                        {t.alternativesTitle}
                      </h4>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: lang === "ar" ? "flex-start" : "flex-start" }}>
                        {selectedAllergy.alternatives.map((s: string, idx: number) => (
                          <span 
                            key={idx} 
                            style={{ 
                              background: "white", 
                              color: "#047857", 
                              padding: "6px 12px", 
                              borderRadius: "12px", 
                              fontSize: "12px", 
                              fontWeight: 750, 
                              border: "1px solid #D1FAE5" 
                            }}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Saleem Team Tip */}
                  <div style={{ 
                    background: "#F0FDFA", 
                    padding: "20px", 
                    borderRadius: "24px", 
                    border: "1px solid #D1FAE5", 
                    display: "flex", 
                    gap: "14px", 
                    alignItems: "flex-start", 
                    flexDirection: lang === "ar" ? "row" : "row-reverse", 
                    textAlign: lang === "ar" ? "right" : "left" 
                  }}>
                    <div style={{ 
                      background: "white", 
                      borderRadius: "12px", 
                      width: "36px", 
                      height: "36px", 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center", 
                      flexShrink: 0, 
                      boxShadow: "0 2px 4px rgba(6,95,70,0.03)" 
                    }}>
                      <Lightbulb size={18} style={{ color: "#0D9488" }} />
                    </div>
                    <div>
                      <h4 style={{ fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 850, color: "#0F766E", margin: "0 0 4px 0" }}>
                        {t.tipTitle}
                      </h4>
                      <p style={{ fontSize: "13.5px", color: "#115E59", lineHeight: "1.6", fontStyle: "italic", fontWeight: 600, margin: 0 }}>
                        {selectedAllergy.tip}
                      </p>
                    </div>
                  </div>

                  {/* Allergy Profile Warning / Reminder Box */}
                  <div style={{
                    background: "#FFFBEB",
                    padding: "20px",
                    borderRadius: "24px",
                    border: "1px solid #FDE68A",
                    display: "flex",
                    gap: "14px",
                    alignItems: "center",
                    flexDirection: lang === "ar" ? "row" : "row-reverse",
                    textAlign: lang === "ar" ? "right" : "left",
                    marginTop: "20px"
                  }}>
                    <div style={{
                      background: "white",
                      borderRadius: "12px",
                      width: "36px",
                      height: "36px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      boxShadow: "0 2px 4px rgba(217,119,6,0.03)"
                    }}>
                      <ShieldAlert size={18} style={{ color: "#D97706" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "14px", color: "#92400E", lineHeight: "1.6", fontWeight: 700, margin: 0 }}>
                        {lang === "ar" 
                          ? "تنبيه: إذا كانت تعانيك هذه الأعراض، تذكر أن تضيف نوع الحساسية هذا إلى حسابك لتفعيل فلاتر المنع والحماية لسلامتك." 
                          : "Reminder: If you experience these symptoms, remember to add this allergy type to your account to activate safety and restriction filters."}
                      </p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedAllergy(null)} 
                  style={{
                    width: "100%",
                    height: "56px",
                    background: "#F1F5F9",
                    color: T.text,
                    borderRadius: "18px",
                    border: "none",
                    fontSize: "15px",
                    fontWeight: 800,
                    cursor: "pointer",
                    marginTop: "32px",
                    transition: "all 0.15s ease"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = "#EBF0F5"}
                  onMouseOut={(e) => e.currentTarget.style.background = "#F1F5F9"}
                >
                  {t.closeBtn}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
