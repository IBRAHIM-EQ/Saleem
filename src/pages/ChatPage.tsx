/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { T } from "../constants";
import { BrandIcon } from "../components/BrandIcon";
import { storage } from "../lib/storage";
import { motion, AnimatePresence } from "motion/react";
import { 
  Send, 
  User, 
  Sparkles, 
  MessageCircle, 
  AlertCircle, 
  Info, 
  Loader2, 
  Trash2, 
  Copy, 
  Download, 
  ThumbsUp, 
  ThumbsDown, 
  Languages, 
  Check, 
  ExternalLink,
  ShieldAlert,
  BookOpen
} from "lucide-react";
import Markdown from "react-markdown";
import { chatApi, tokenStore } from "../lib/api";

// Initialize Gemini Client safely if key is available
import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;
try {
  // @ts-ignore
  const apiKey = (typeof process !== "undefined" && process?.env?.GEMINI_API_KEY) || "";
  if (apiKey && apiKey.trim().length > 0) {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
} catch (e) {
  console.log("Could not initialize GoogleGenAI. Falling back to Saleem Offline Smart Medical Library.");
}

interface ChatPageProps {
  profile: any;
  lang?: "ar" | "en";
  onLangChange?: (lang: "ar" | "en") => void;
}

// Full Bilingual Dictionary
const translations = {
  ar: {
    assistantTitle: "مساعد سليم الطبي الذكي",
    onlineNow: "متصل الآن لسلامتك",
    activeProfile: "الملف الطبي النشط",
    monitoringAlert: "سليم يراقب مسببات الحساسية:",
    variousTriggers: "عدة مهيجات للتحسس",
    askAboutAllergen: "استشر عن",
    placeholder: "اسأل سليم... (مثلاً: ما هي بدائل الحليب الآمنة في عمان؟)",
    clearChat: "مسح المحادثة",
    copyChat: "نسخ الاستشارة",
    downloadReport: "تحميل الملف الطبي",
    demoModeActive: "الوضع الذكي النشط (سليم طبيب التغذية)",
    safetyAdvisoryTitle: "تنبيه طبي هام",
    safetyWarning: "بيانات سليم إرشادية فقط. في حال وجود أعراض حادة (ضيق نفس، تورم اللسان)، اتصل بالدفاع المدني الأردني على (911) أو توجه لأقرب طوارئ فوراً.",
    noAllergensYet: "مستكشف زائر: لم تقم بتحديد مسببات حساسية في حسابك بعد. حددها بالملف لمراقبة مخصصة.",
    suggestionsTitle: "مواضيع طبية شائعة في الأردن:",
    copiedToast: "تم نسخ سجل الاستشارة الطبية بنجاح!",
    clearedToast: "تم إفراغ محادثات سليم.",
    ratingThanks: "شكراً لتقييمك الذكي لمساعد سليم!",
    doctorNoticeTitle: "هل تبحث عن استشارة عيادية؟",
    doctorNoticeText: "دليل سليم يضم أمهر أطباء التغذية والحساسية المعتمدين بالأردن مثل د. سارة النوري وأ. لينا مرزوق.",
    visitDirectory: "تصفح دليل الأطباء 🩺",
    exportHeader: "سجل استشارة تطبيق سليم لسلامة الأغذية بالأردن\nتاريخ التقرير: " + new Date().toLocaleDateString('ar-JO') + "\n----------------------------------------\n",
    clearedConfirm: "هل أنت متأكد من مسح محادثة سليم؟",
    yes: "نعم ومسح",
    no: "تراجع",
    safeAllergen: "آمن للتحسس",
    feedbackAlert: "مساعد سليم قيّم ردك كـ آمن ومفيد!",
    severityLabel: "مستوى التحسس:"
  },
  en: {
    assistantTitle: "Saleem Smart Medical Companion",
    onlineNow: "Active & Guarding",
    activeProfile: "Active Health Profile",
    monitoringAlert: "Saleem is monitoring these allergens:",
    variousTriggers: "various severe triggers",
    askAboutAllergen: "Ask about",
    placeholder: "Ask Saleem... (e.g. Is pita bread gluten-free in Amman?)",
    clearChat: "Clear History",
    copyChat: "Copy Session",
    downloadReport: "Download Report",
    demoModeActive: "Medical Intelligence Mode Active",
    safetyAdvisoryTitle: "Medical Advisory Notice",
    safetyWarning: "Saleem's guidance is educational. For severe symptoms like respiratory distress or mouth swelling, call Jordan Emergency Civil Defense at (911) or visit the ER immediately.",
    noAllergensYet: "Guest mode: No allergens tracked. Fill out the profile config to activate personalized monitoring.",
    suggestionsTitle: "Suggested Medical & Safety Queries:",
    copiedToast: "Clinical consultation copied to clipboard!",
    clearedToast: "Saleem chat history cleared successfully.",
    ratingThanks: "Thank you for rating Saleem's response!",
    doctorNoticeTitle: "Need Clinical Medical Evaluation?",
    doctorNoticeText: "Book certified Jordan clinicians & dietitians on our medical index (such as Ms. Lina Marzouq or Dr. Sara Al-Nouri).",
    visitDirectory: "Browse Specialists Log 🩺",
    exportHeader: "Saleem Food Safety Clinical Consult Log - Amman, Jordan\nReport Generated: " + new Date().toLocaleDateString('en-US') + "\n----------------------------------------\n",
    clearedConfirm: "Are you sure you want to clear this advisory?",
    yes: "Yes, Clear",
    no: "Cancel",
    safeAllergen: "Allergen Monitored",
    feedbackAlert: "Saleem response marked helpful!",
    severityLabel: "Severity Level:"
  }
};

// Common Allergen Emojis Dictionary
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

export function ChatPage({ profile, lang: propLang, onLangChange }: ChatPageProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [langState, setLangState] = useState<"ar" | "en">(() => storage.get("saleem_preferred_lang", "en"));
  const lang = propLang || langState;
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  
  // Track user visual interactions on suggestions
  const [feedbackRatedIdx, setFeedbackRatedIdx] = useState<Record<number, "up" | "down">>({});

  const bottomRef = useRef<HTMLDivElement>(null);

  const t = translations[lang];

  // Dynamic suggestions list
  const suggestionQueries = lang === "ar" ? [
    { text: "هل الخبز العربي يحتوي على الجلوتين؟", tag: "gluten" },
    { text: "ما هي بدائل الحليب واللاكتوز في عمان؟", tag: "dairy" },
    { text: "حساسية المكسرات وتجنب التلوث الخلطي بالحلويات", tag: "nuts" },
    { text: "ما هي أعراض طوارئ الحساسية ورقم الطوارئ؟", tag: "emergency" }
  ] : [
    { text: "Does traditional pita bread contain gluten?", tag: "gluten" },
    { text: "What are safe milk & dairy alternatives in Amman?", tag: "dairy" },
    { text: "Arabic sweets: how to avoid cross-contamination", tag: "nuts" },
    { text: "Anaphylaxis severe symptoms & Jordan emergency contact", tag: "emergency" }
  ];

  // Load history on mount
  useEffect(() => {
    const chatKey = `saleem_chat_history_${profile.email || "guest"}`;
    const history = storage.get(chatKey) || [];

    if (history.length > 0) {
      setMessages(history);
    } else {
      const activeAllergenString = profile.allergens
        ?.map((a: any) => {
          const key = typeof a === "string" ? a : (a.allergenKey || a.key);
          const emoji = allergenEmojis[key] || "⚠️";
          return `${emoji} ${lang === "ar" ? mapAllergenToArabic(key) : key}`;
        })
        .join(", ");

      const welcomeMsgAr = `أهلاً بك يا ${profile.firstName || "سند"} في نظام سليم الغذائي الذكي! 🔬\n\nأنا هنا لحمايتك ومساعدتك على اتخاذ واختيار الأطعمة السليمة والآمنة لك ولعائلتك بالأردن.\n\nمن خلال متابعتي لملفك، أرى أننا نراقب لك حالياً مسببات الحساسية التالية: **[ ${activeAllergenString || "لا يوجد مسببات محددة حالياً - تفضل بذكر ما تعاني منه للبدء"} ]**.\n\nكيف يمكنني دعمك اليوم في البحث عن منتجات، أو قراءة الملصقات بالأردن؟`;
      const welcomeMsgEn = `Hello ${profile.firstName || "Guest"}! Welcome to Saleem, your intelligent food safety advisor in Jordan. 🔬\n\nI am configured and actively monitoring your safety for: **[ ${activeAllergenString || "No allergens tracked currently"} ]**.\n\nAsk me about identifying triggers in Arabic/foreign ingredients, finding dietary-safe Amman bakeries, or diagnosing cross-contamination in restaurants!`;

      setMessages([
        {
          role: "assistant",
          text: lang === "ar" ? welcomeMsgAr : welcomeMsgEn,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
    setLoadingHistory(false);
  }, [profile.allergens, profile.email, lang]);

  // Save changes
  useEffect(() => {
    if (messages.length > 0) {
      const chatKey = `saleem_chat_history_${profile.email || "guest"}`;
      storage.set(chatKey, messages);
    }
  }, [messages, profile.email]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Toast notifier helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  function mapAllergenToArabic(allergen: string): string {
    const mapping: Record<string, string> = {
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
    };
    return mapping[allergen] || allergen;
  }

  // Live and Smart Expert Response Handler
  const handleBotQuery = async (queryText: string, currentChatHistory: any[]) => {
    // 0. Try backend Gemini API (saves history to DB)
    if (tokenStore.getAccess()) {
      try {
        const data = await chatApi.sendMessage(queryText);
        if (data?.reply) return data.reply;
      } catch {
        // Backend unavailable — fall through to local Gemini
      }
    }

    // 1. Try Live Gemini SDK call if API Client is instantiated
    if (ai) {
      try {
        const sysInstruction = `You are Saleem (سليم), an expert, kind and extremely professional clinical food safety and allergy companion in Amman, Jordan. 
Keep your tone empathetic, helpful and medically accurate.
When talking to the user:
- Mention local Jordanian food realities (e.g. traditional bakeries, pita bread, knafeh cross-contamination, freekeh, and Alpro/Koita brand names in Amman).
- Format your response beautifully with markdown bullet points, clear paragraphs, and bold header categories.
- Highlight emergency situations with high severity warning signs if the user mentions acute symptoms.
- Advise them to look for qualified local nutritionists like Ms. Lina Marzouq or Dr. Sara Al-Nouri found in Saleem's Directory for custom plans.
- If they write in Arabic, answer in beautiful premium Arabic. If they write in English, answer in English.`;

        const chat = ai.chats.create({
          model: "gemini-2.5-flash",
          config: {
            systemInstruction: sysInstruction,
            temperature: 0.7,
          }
        });

        const response = await chat.sendMessage({
          message: `User Profile Active Allergens under monitoring: ${JSON.stringify(profile.allergens)}. User typed: "${queryText}"`
        });

        if (response && response.text) {
          return response.text;
        }
      } catch (err) {
        console.warn("Live Gemini api call failed. Releasing Saleem Smart Local Medical Advisor database fallback.", err);
      }
    }

    // 3. High-IQ Expert Dictionary fallback matching Jordan's profile context
    return simulateSaleemExpertResponse(queryText);
  };

  // Meticulously built offline Jordan allergy dictionary
  const simulateSaleemExpertResponse = (text: string): string => {
    const cleanText = text.toLowerCase().trim();
    const isAr = /[\u0600-\u06FF]/.test(text);

    // Topic Matcher
    if (cleanText.includes("قمح") || cleanText.includes("جلوتين") || cleanText.includes("سيلياك") || cleanText.includes("غلوتين") || cleanText.includes("wheat") || cleanText.includes("gluten") || cleanText.includes("celiac")) {
      if (isAr) {
        return `### 🌾 دليل سليم لمرضى السيلياك وحساسية القمح بالأردن:

القمح يحتوي على بروتين **الغلوتين**، الذي يعامل كعدو مناعي لمرضى السيلياك وحساسية القمح:

1. **الخبز والأطعمة الخطيرة:** تجنب الخبز الأردني العادي (الكماج، المشروح)، الفريكة، السميد ومفتول الضيعة، بالإضافة للمعكرونة العادية والمعجنات.
2. **البدائل المتاحة بالأردن:** دقيق الأرز، مخيض الشوفان الخالي من الغلوتين، دقيق الكينوا، والحمص متاح في المولات الكبرى (مثل سيفوي، كوزمو، كارفور).
3. **مخابز معتمدة بعمان:** 
   * **مخبز (GF Bakery)** في تلاع العلي - خبز ومعجنات خالية من الغلوتين مئة بالمئة.
   * **مخبر (Joof Free-From)** - يوفر صمون وحلويات مخصصة آمنة.
4. **تنبيه طبي:** احذر تماماً التلوث الخلطي بالفرن عند إعداد الأطعمة الخالية من الغلوتين في فرن عام.`;
      } else {
        return `### 🌾 Gluten & Wheat Allergy Guide (Jordan Food Safe):

Wheat and **Gluten** pose major health risks for individuals with Wheat Allergies or Celiac Disease:

1. **High-Risk Foods in Jordan:** Traditional Arabic pita bread (Khabz Kammaj), local pastries (Manakish), Freekeh, Semolina (used in Knafeh), and standard pasta.
2. **Safe Ingredients & Flour alternatives:** Brown rice flour, tapioca, chickpea flour (Hummus base), or certified Gluten-Free Oats (widely available in Amman supermarkets like Cozmo, Safeway, and Carrefour).
3. **Certified Gluten-Free Places in Amman:**
   * **GF Bakery** (Tla'a Al-Ali) - 100% dedicated gluten-free arabic bread, cakes, and rolls.
   * **Joof Free-From Bakery** - specialized safe pastries and alternatives.
4. **Prevention Tip:** Avoid buying spices or nuts from open bulk dispensers as they share milling machinery with wheat. Always buy certified packaged items.`;
      }
    }

    if (cleanText.includes("حليب") || cleanText.includes("ألبان") || cleanText.includes("لاكتوز") || cleanText.includes("جبن") || cleanText.includes("milk") || cleanText.includes("dairy") || cleanText.includes("lactose") || cleanText.includes("cheese")) {
      if (isAr) {
        return `### 🥛 دليل حساسية الحليب والألبان بالأردن:

حساسية الألبان (أو عدم تحمل اللاكتوز الشديد) تفرضان امتناعاً تاماً عن مصادر الأبقار والمواشي:

1. **أطعمة يجب تجنبها بالأردن:** اللبنة البلدية، الجميد الكركي، السمن، والجبة البيضاء المغلية، بالإضافة للحلويات التي يضاف لها الحليب كالعوامة والمهلبية.
2. **بدائل الحليب الآمنة المتوفرة:** حليب الشوفان، حليب اللوز، وحليب الصويا لشركات عالمية معتمدة بالأردن مثل (Alpro, Koita, Kirkland).
3. **تنويه هام لقراءة الملصقات:** راقب واقرأ ملصق المكونات جيدا وتجنب المنتجات التي تحتوي على: **مصل اللبن (Whey)**، **كازينات الكالسيوم أو الصوديوم (Caseinate)**، **بروتين الغنم**.`;
      } else {
        return `### 🥛 Dairy, Milk & Lactose Safety Log (Amman):

Dairy Allergy (immunological) and Lactose Intolerance require rigorous monitoring of Jordan’s traditional breakfast items:

1. **High-Risk Traditional Products:** Local Jordan Labneh, Jameed Karaki (Mansaf broth base), municipal white cheeses, and arabic sweets sweetened with milk/ghee (such as Mahalabiya or Baklava).
2. **Safely Certified Alternates in Jordan:** Brand names like *Koita*, *Oatly*, and *Alpro* are widely distributed in Amman supermarkets, offering Almond, Soy, and Oat milks.
3. **Ingredient Watchlist:** Check canned foods and baked items for hidden dairy triggers like **Whey protein**, **Sodium Caseinate**, **Lactose Solids**, and emulsifiers.`;
      }
    }

    if (cleanText.includes("مكسرات") || cleanText.includes("كاجو") || cleanText.includes("فستق") || cleanText.includes("فول") || cleanText.includes("لوز") || cleanText.includes("nuts") || cleanText.includes("peanuts") || cleanText.includes("cashew")) {
      if (isAr) {
        return `### 🥜 تحذير شديد لحالات حساسية الفول السوداني والمكسرات:

حساسية المكسرات الشجرية تعتبر من الحساسيات الشديدة والمنذرة بالخطر:

1. **خطر المحامص في الأردن:** المحامص الشعبية الكبرى (المحمص) تخلط المكسرات في الماكينات وتستخدم أدوات تعبئة مشتركة؛ التلوث الخلطي فيها يصل لـ 90%. اشترِ مكسرات معبأة ومختومة من المصنع كلياً لسلامتك.
2. **مأكولات شعبية بحذر:** انتبه للحلويات العربية (الكنافة، البقلاوة) التي ترش بالفستق الحلبي، والطحينية أو الصلصات المحتوية على بذور السمسم.
3. **توصية طبية عاجلة:** تذكر دائماً حمل حقنة الإبينفرين الذاتية (EpiPen) معك عند الخروج لتناول الطعام بمطاعم عمان.`;
      } else {
        return `### 🥜 Tree Nuts & Peanut Safety Protocol:

Nut and peanut allergies are among the most dangerous allergen groups due to the high risk of anaphylaxis.

1. **Roastery (Mahmas) Warning:** Open roastery dispensers in Jordan pose a severe cross-contamination hazard since scoops and roasting drums are shared. Only buy pre-packaged, factory-sealed nuts.
2. **Arabic Dessert Caution:** Jordanian sweets like Knafeh, Baklava, and Harisa are heavily topped with Pistachios or almond remnants. Always ask restaurant staff if nut traces are active.
3. **Specialist Recommendation:** Always carry your auto-injector (EpiPen) with you and ensure dining staff understand the severe danger of cross-contamination immediately.`;
      }
    }

    if (cleanText.includes("بيض") || cleanText.includes("egg")) {
      if (isAr) {
        return `### 🥚 دليل حساسية البيض بالتغذية الأردنية:

البيض منتشر بكثرة كعنصر خفي في المخبوزات والحلويات التقليدية:

1. **المخبوزات التقليدية:** كعك السمسم الأردني الشهير والمناقيش يدهنان أحياناً بصفار البيض لإعطاء المظهر اللامع. اطلب من الخباز مخبوزات لم تدهن بصفار البيض.
2. **بدائل آمنة:** مايونير خالٍ من البيض (Egg-free Mayo/Vegan Mayo) متاح في كوزمو وبن زايد ومحلات الغذاء الصحي المتخصصة.
3. **الملصق التجاري:** تجنب الكلمات التالية: **ألبومين، ليسيثين البيض، ليفيتين، غلوبولين** كعناصر في المكونات بالأغذية المعلبة.`;
      } else {
        return `### 🥚 Egg Allergy Guidance & Watchlist:

Eggs are a common hidden binding agent in Jordanian baked goods and pastries:

1. **Local Glazing Hazards:** Street Ka'ak with sesame and baked Manakish are often brushed with egg whites or yolks to get a golden-brown finish. Always explicitly ask the bakery.
2. **Safely Certified Alternates:** Egg-free light mayonnaise (or vegan organic mayo) is sold in wellness shops, Cozmo, and health aisles across Amman.
3. **Hidden Ingredeints:** Avoid components with names like **Albumin, Livetin, Egg Lecithin, Globulin, or Lysozyme** on packaged chips and cookies.`;
      }
    }

    if (cleanText.includes("أعراض") || cleanText.includes("طوارئ") || cleanText.includes("مستشفى") || cleanText.includes("emergency") || cleanText.includes("symptoms") || cleanText.includes("911") || cleanText.includes("موت")) {
      if (isAr) {
        return `### 🚨 طوارئ الحساسية والتعامل الفوري بالأردن:

إذا ظهرت عليك أو على طفلك أحد الأعراض الحادة التالية بعد تناول طعام:
* **صعوبة بالغة في التنفس أو صفير بالصدر.**
* **تورم شديد في الشفاه، اللسان، أو الحلق.**
* **دوار شديد، غثيان، أوهبوط ضغط مفاجئ.**

#### 🛑 الإجراءات العاجلة بالأردن:
1. استخدم **حقنة الأدرينالين الذاتية (EpiPen)** فوراً بالجانب الخارجي للفخذ.
2. اتصل على **رقم الدفاع المدني الأردني الموحد للطوارئ: 911** لطلب الإسعاف العاجل.
3. توجه فوراً لقسم الطوارئ في أقرب مستشفى (مثل مستشفى الأردن، التخصصي، أو المدينة الطبية).`;
      } else {
        return `### 🚨 Allergy Emergencies & Action Protocol (Jordan):

If you or a family member experience critical systemic reactions (Anaphylaxis):
* **Severe difficulty breathing, gasping, or wheezing.**
* **Visible swelling of the face, tongue, or larynx causing choking.**
* **Sudden fainting, cold sweats, or a drop in blood pressure.**

#### 🛑 Immediate Jordan Action Plan:
1. Administer your **EpiPen (Epinephrine injection)** immediately into the outer thigh.
2. Call **911 (Jordan Emergency Civil Defense)** immediately to arrange a medical transport unit.
3. Proceed instantly to the emergency department of the nearest large hospital (e.g. Jordan Hospital, Specialty Hospital, or Khalidi Medical Center).`;
      }
    }

    if (cleanText.includes("مطعم") || cleanText.includes("مطاعم") || cleanText.includes("أكل") || cleanText.includes("restaurant") || cleanText.includes("eating out")) {
      if (isAr) {
        return `### 🍽️ إرشادات سليم لتناول الطعام بالمطاعم بأمان:

أكل المطاعم يتطلب حذراً ووضوحاً شديدين لضمان عدم حدوث تلامس:

1. **صيغة واضحة للمطعم:** وجه كلامك للويتر أو المشرف قائلاً: *"عندي حساسية شديدة مميتة تجاه كذا. ممكن تتأكد من الشيف أنها ما تلمس المقالي أو أدوات التقطيع؟"*.
2. **البوفيه المفتوح:** تجنب تماماً البوفيهات المفتوحة حيث يتم خلط المغارف وتتساقط الأطعمة ببعضها.
3. **أطعمة الخطر العالي بالأردن:** حمام الزيت المشترك (حيث يقلى البروستد مع الفلافل مع الخبز ببرميل واحد) والأسطح المشتركة بالمعجنات.`;
      } else {
        return `### 🍽️ Smart Dining & Restaurant Protocol:

Dining out comfortably inside Amman’s robust food scene is simple with explicit communication:

1. **Clear Jordanian Phrasing:** Tell the manager: *"Andi hasasiyeh qawiyyeh shadeedah min [Allergen]. Deek belik, let the chef check they use fresh utensils, clean pans and oil."*
2. **Open Buffets Alert:** Strictly avoid open salad or hummuses buffets dynamically, where cross-contamination occurs 100% of the time via shared spoons.
3. **Common shared Fryers:** Be aware that many local sandwich joints use the same frying oil for Falafel, Bread, and french fries. Always ask!`;
      }
    }

    // Default polite welcome fallback
    if (isAr) {
      return `مرحباً بك! أنا **سليم** مساعدك الغذائي الشخصي للحماية من الحساسية بالأردن. 🔬

لقد حللت سؤالك وهو ضمن دائرة اهتمامي الطبي. يسعدني جداً الإجابة بخصوص:
1. **مكونات الأطعمة المحلية** (الخبز، المعجنات، البهارات الأردنية، والجميد).
2. **البدائل الصحية الخالية من اللاكتوز والغلوتين** المتوفرة بمولات عمان.
3. **طريقة قراءة ملصقات المواد الغذائية**.
4. **تجنب التلوث الخلطي** في المطاعم الشعبية.

مثال للتجربة: *"بدائل الحليب في عمان"* أو *"أعراض حساسية قمح"* أو *"مطاعم آمنة"*. كيف يمكنني إفادتك الليلة؟`;
    } else {
      return `Hello! I am **Saleem**, your dedicated allergen, diet, and clinical food safety guide.

I'm ready to answer any queries about:
1. **Jordanian Food Ingredients**, checking for hidden wheat, nut, or dairy remnants.
2. **Healthy substitutes for Gluten, Dairy, and Eggs** inside local supermarkets.
3. **Cross-contamination protection** in local dining halls.
4. **Active medical consultation tips**.

Try asking: *"Gluten free bakeries in Amman"* or *"dairy hidden names"* or *"emergency 911 symptoms"*. What can I guide you with today?`;
    }
  };

  const sendMessage = async (textOverride?: string) => {
    const text = textOverride || input.trim();
    if (!text || loading) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMessages = [...messages, { role: "user", text, timestamp }];
    
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const gResult = await handleBotQuery(text, newMessages);
      setMessages((prev) => [
        ...prev, 
        { 
          role: "assistant", 
          text: gResult,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (e) {
      // In case of major error, default fallback simulated
      const fallbackMsg = simulateSaleemExpertResponse(text);
      setMessages((prev) => [
        ...prev, 
        { 
          role: "assistant", 
          text: fallbackMsg,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Export consultation log to physical .txt file
  const handleDownloadReport = () => {
    if (messages.length === 0) return;
    
    let reportString = t.exportHeader;
    messages.forEach((m) => {
      const timestampLabel = m.timestamp ? ` [${m.timestamp}]` : '';
      const speaker = m.role === "user" ? "المستخدم / User" : "مساعد سليم / Saleem AI";
      reportString += `${speaker}${timestampLabel}:\n${m.text}\n\n`;
    });
    
    reportString += `----------------------------------------\nتم توليد هذا التقرير الطبي تلقائياً بواسطة تطبيق سليم لسلامة الأغذية بالأردن.\n`;
    
    const element = document.createElement("a");
    const file = new Blob([reportString], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `saleem-medical-consultation-${lang}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    triggerToast(lang === "ar" ? "تم تحميل الملف بنجاح كمسودة طبية!" : "Advisory report downloaded!");
  };

  // Copy whole consultation history
  const handleCopyConsultation = () => {
    if (messages.length === 0) return;
    let textToCopy = "";
    messages.forEach((m) => {
      const speaker = m.role === "user" ? "المريض / Patient" : "مستشار سليم / Saleem AI";
      textToCopy += `${speaker}:\n${m.text}\n\n`;
    });
    navigator.clipboard.writeText(textToCopy);
    triggerToast(t.copiedToast);
  };

  // Clear Chat history safely with storage sync
  const handleClearChatHistory = () => {
    const chatKey = `saleem_chat_history_${profile.email || "guest"}`;
    storage.remove(chatKey);
    
    setMessages([
      {
        role: "assistant",
        text: lang === "ar" 
          ? `تم مسح الذاكرة بنجاح. أهلاً بك مجدداً في نظام سليم لسلامة الأطعمة. تفضل بطرح أي سؤال طبي، أنا جاهز لمساعدتك.` 
          : `Chat history cleared. I've reset our conversation context. How can Saleem guard your food safety now?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setShowClearConfirm(false);
    triggerToast(t.clearedToast);
  };

  return (
    <div 
      style={{ 
        display: "flex", 
        flexDirection: "column", 
        flex: 1, 
        overflow: "hidden", 
        background: "#F8FAFC",
        fontFamily: lang === "ar" ? "Inter, system-ui, sans-serif" : "Inter, sans-serif"
      }}
    >
      {/* Dynamic Toast Popup Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.9 }}
            style={{
              position: "absolute",
              top: 24,
              left: "50%",
              transform: "translateX(-50%)",
              background: T.blueDark,
              color: "white",
              padding: "12px 24px",
              borderRadius: 50,
              boxShadow: "0 10px 25px rgba(36, 96, 160, 0.25)",
              zIndex: 1000,
              fontWeight: 700,
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              gap: 8,
              pointerEvents: "none",
              direction: lang === "ar" ? "rtl" : "ltr"
            }}
          >
            <Check size={18} color={T.mint} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Info */}
      <div 
        style={{ 
          padding: "16px 32px", 
          borderBottom: "1px solid #E2E8F0", 
          background: "white", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between",
          boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
          zIndex: 10,
          flexDirection: lang === "ar" ? "row-reverse" : "row"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexDirection: lang === "ar" ? "row-reverse" : "row" }}>
          <div style={{ width: 44, height: 44, background: T.mintLight, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 10px ${T.mint}15` }}>
            <BrandIcon size={26} />
          </div>
          <div style={{ textAlign: lang === "ar" ? "right" : "left" }}>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 900, color: T.text, display: "flex", alignItems: "center", gap: 6 }}>
              {t.assistantTitle}
              <Sparkles size={16} color={T.mintDark} style={{ animation: "pulse 2s infinite" }} />
            </h3>
            <div style={{ fontSize: 13, color: T.mintDark, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, flexDirection: lang === "ar" ? "row-reverse" : "row" }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              {t.onlineNow}
            </div>
          </div>
        </div>

        {/* Action Controls & Language toggles */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Quick Chat Utilities */}
          <div className="flex gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100">
            <button 
              onClick={handleCopyConsultation}
              title={t.copyChat}
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
            >
              <Copy size={16} />
            </button>
            <button 
              onClick={handleDownloadReport}
              title={t.downloadReport}
              className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-white rounded-lg transition-all"
            >
              <Download size={16} />
            </button>
            <button 
              onClick={() => setShowClearConfirm(true)}
              title={t.clearChat}
              className="p-2 text-slate-500 hover:text-red rounded-lg hover:bg-white transition-all"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* active Patient Profile Monitor HUD */}
      <div 
        style={{ 
          background: "linear-gradient(90deg, #EBF7F1 0%, #F3F5F8 100%)",
          padding: "10px 32px",
          borderBottom: "1px solid #E2E8F0",
          display: "flex",
          alignItems: "center",
          gap: 12,
          justifyContent: "space-between",
          flexWrap: "wrap",
          direction: lang === "ar" ? "rtl" : "ltr"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: T.textMid }}>
            🛡️ {t.activeProfile}:
          </span>
          <span style={{ fontSize: 12, color: T.textMid }}>
            {t.monitoringAlert}
          </span>
          <div className="flex gap-2 flex-wrap max-w-full">
            {profile.allergens && profile.allergens.length > 0 ? (
              profile.allergens.map((a: any, i: number) => {
                const key = typeof a === "string" ? a : (a.allergenKey || a.key);
                const emoji = allergenEmojis[key] || "⚠️";
                const labelAr = mapAllergenToArabic(key);
                return (
                  <button
                    key={i}
                    onClick={() => {
                      const askText = lang === "ar" 
                        ? `هل هذا المنتج آمن لحساسية ${labelAr}؟` 
                        : `Is this product safe for my ${key} allergy?`;
                      sendMessage(askText);
                    }}
                    title={`${t.askAboutAllergen} ${lang === "ar" ? labelAr : key}`}
                    style={{
                      padding: "4px 10px",
                      background: "white",
                      border: `1px solid ${T.mintMid}`,
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 700,
                      color: T.text,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      cursor: "pointer",
                      boxShadow: "0 2px 4px rgba(82, 183, 136, 0.08)"
                    }}
                  >
                    <span>{emoji}</span>
                    <span>{lang === "ar" ? labelAr : key}</span>
                  </button>
                );
              })
            ) : (
              <span className="text-[11px] text-zinc-500 font-medium">({t.noAllergensYet})</span>
            )}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: T.mintDark }}>
          <div style={{ width: 6, height: 6, background: T.mint, borderRadius: "50%" }} />
          <span>{t.demoModeActive}</span>
        </div>
      </div>

      {/* Confirmation of Clear Chat History */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(22, 32, 46, 0.4)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 200,
              padding: 24
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              style={{
                background: "white",
                borderRadius: 24,
                padding: "32px",
                maxWidth: 400,
                width: "100%",
                boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                gap: 20,
                direction: lang === "ar" ? "rtl" : "ltr"
              }}
            >
              <div style={{ width: 56, height: 56, background: "#FEF2F2", borderRadius: "50%", display: "flex", alignItems: "center", justifySelf: "center", alignSelf: "center", color: T.red, justifyContent: "center" }}>
                <Trash2 size={28} />
              </div>
              <div>
                <h4 style={{ margin: "0 0 8px 0", fontSize: 18, fontWeight: 800, color: T.text }}>{t.clearChat}</h4>
                <p style={{ margin: 0, fontSize: 14, color: T.grayDark, lineHeight: 1.5 }}>
                  {t.clearedConfirm}
                </p>
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <button
                  onClick={handleClearChatHistory}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: T.red,
                    color: "white",
                    border: "none",
                    borderRadius: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: 14
                  }}
                >
                  {t.yes}
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: T.gray,
                    color: T.text,
                    border: `1px solid ${T.grayMid}`,
                    borderRadius: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: 14
                  }}
                >
                  {t.no}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>



      {/* Messages Stream Container */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "32px 32px 16px 32px",
          display: "flex",
          flexDirection: "column",
          gap: 28,
        }}
        className="scrollbar-thin"
      >
        <AnimatePresence initial={false}>
          {messages.map((m, i) => {
            const isUser = m.role === "user";
            
            // Check if this answer from bot mentions critical emergency keywords to render a warning alert
            const containsAdvisory = !isUser && (m.text.includes("طوارئ") || m.text.includes("911") || m.text.includes("emergency") || m.text.includes("anaphylaxis"));

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                style={{
                  display: "flex",
                  flexDirection: isUser ? "row" : "row",
                  justifyContent: isUser ? "flex-end" : "flex-start",
                  gap: 16,
                  maxWidth: "85%",
                  alignSelf: isUser ? "flex-end" : "flex-start",
                  direction: isUser ? (lang === "ar" ? "rtl" : "ltr") : (lang === "ar" ? "rtl" : "ltr")
                }}
              >
                {/* Assistant avatar on left/right depending on language */}
                {!isUser && (
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 14,
                      background: T.mintLight,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      boxShadow: "0 4px 10px rgba(82, 183, 136, 0.15)",
                      border: `1.5px solid ${T.mintMid}`
                    }}
                  >
                    <BrandIcon size={24} />
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: isUser ? "flex-end" : "flex-start" }}>
                  {/* Message Bubble */}
                  <div
                    style={{
                      padding: "18px 22px",
                      borderRadius: isUser 
                        ? (lang === "ar" ? "24px 4px 24px 24px" : "24px 24px 4px 24px")
                        : (lang === "ar" ? "4px 24px 24px 24px" : "24px 24px 24px 4px"),
                      background: isUser 
                        ? `linear-gradient(135deg, ${T.blue} 0%, ${T.blueDark} 100%)` 
                        : "white",
                      border: isUser ? "none" : `1.5px solid ${T.grayMid}`,
                      color: isUser ? "white" : T.text,
                      fontSize: 15,
                      lineHeight: 1.7,
                      boxShadow: isUser 
                        ? `0 6px 16px ${T.blue}20`
                        : "0 4px 20px rgba(0,0,0,0.03)",
                      textAlign: lang === "ar" ? "right" : "left",
                    }}
                  >
                    {isUser ? (
                      <div style={{ whiteSpace: "pre-wrap", fontWeight: 500 }}>{m.text}</div>
                    ) : (
                      <div className="markdown-body transition-all">
                        <Markdown>{m.text}</Markdown>
                      </div>
                    )}

                    {/* Integrated clinical advisory card inside medical symptoms answer */}
                    {containsAdvisory && (
                      <div 
                        style={{ 
                          marginTop: 16, 
                          padding: 12, 
                          background: "#FEF2F2", 
                          borderRadius: 12, 
                          border: `1px solid ${T.red}30`,
                          display: "flex",
                          gap: 10,
                          alignItems: "center"
                        }}
                      >
                        <ShieldAlert size={18} color={T.red} />
                        <span style={{ fontSize: 12, color: T.red, fontWeight: 700 }}>
                          {lang === "ar" 
                            ? "تحذير: لقد رصد سليم أعراضاً حادة! يرجى الاتصال بالرقم 911 فوراً لتلقي رعاية طبية عاجلة." 
                            : "WARNING: High-risk terms matched. Seek emergency aid by dialing 911 immediately."}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Rating Actions & Timestamp */}
                  <div 
                    style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: 12, 
                      fontSize: 11, 
                      color: T.grayDark,
                      flexDirection: lang === "ar" ? "row-reverse" : "row"
                    }}
                  >
                    <span style={{ fontWeight: 500 }}>{m.timestamp || "12:00 PM"}</span>
                    {!isUser && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span className="w-[1px] h-3 bg-zinc-200"></span>
                        <button 
                          onClick={() => {
                            setFeedbackRatedIdx(prev => ({ ...prev, [i]: "up" }));
                            triggerToast(t.ratingThanks);
                          }}
                          style={{ 
                            background: "none", 
                            border: "none", 
                            cursor: "pointer", 
                            padding: 2,
                            color: feedbackRatedIdx[i] === "up" ? T.mintDark : T.grayDark,
                            transition: "color 0.2s"
                          }}
                        >
                          <ThumbsUp size={12} style={{ fill: feedbackRatedIdx[i] === "up" ? T.mint : "none" }} />
                        </button>
                        <button 
                          onClick={() => {
                            setFeedbackRatedIdx(prev => ({ ...prev, [i]: "down" }));
                            triggerToast(t.ratingThanks);
                          }}
                          style={{ 
                            background: "none", 
                            border: "none", 
                            cursor: "pointer", 
                            padding: 2,
                            color: feedbackRatedIdx[i] === "down" ? T.red : T.grayDark,
                            transition: "color 0.2s"
                          }}
                        >
                          <ThumbsDown size={12} style={{ fill: feedbackRatedIdx[i] === "down" ? T.red : "none" }} />
                        </button>

                        {feedbackRatedIdx[i] && (
                          <span style={{ fontSize: 10, color: T.mintDark, fontWeight: 700 }}>
                            ✓ {t.safeAllergen}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* User icon on right */}
                {isUser && (
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 14,
                      background: "#E2E8F0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                      border: "1.5px solid #CBD5E1"
                    }}
                  >
                    <User size={22} color="#475569" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {/* Chatbot pulsing dot loader */}
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ 
              display: "flex", 
              gap: 16, 
              alignSelf: "flex-start",
              direction: lang === "ar" ? "rtl" : "ltr"
            }}
          >
            <div style={{ width: 42, height: 42, background: T.mintLight, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", border: `1.5px solid ${T.mintMid}` }}>
              <BrandIcon size={24} />
            </div>
            <div style={{ background: "white", border: `1.5px solid ${T.grayMid}`, borderRadius: "4px 24px 24px 24px", padding: "16px 20px", display: "flex", gap: 6, alignItems: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
              <motion.div animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: 6, height: 6, background: T.blue, borderRadius: "50%" }} />
              <motion.div animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} style={{ width: 6, height: 6, background: T.blue, borderRadius: "50%" }} />
              <motion.div animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} style={{ width: 6, height: 6, background: T.blue, borderRadius: "50%" }} />
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested Quick Consultations Grid */}
      {messages.length < 5 && !loading && (
        <div 
          style={{ 
            padding: "0 32px 16px", 
            display: "flex", 
            flexDirection: "column", 
            gap: 10,
            direction: lang === "ar" ? "rtl" : "ltr"
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 800, color: T.textMid, textAlign: lang === "ar" ? "right" : "left" }}>
            ✨ {t.suggestionsTitle}
          </span>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "flex-start" }}>
            {suggestionQueries.map((s, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.02, translateY: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => sendMessage(s.text)}
                style={{
                  padding: "10px 18px",
                  background: "white",
                  border: `1.5px solid ${T.grayMid}`,
                  borderRadius: 16,
                  fontSize: 13,
                  fontWeight: 700,
                  color: T.textMid,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = T.blue;
                  e.currentTarget.style.color = T.blueDark;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = T.grayMid;
                  e.currentTarget.style.color = T.textMid;
                }}
              >
                <BookOpen size={14} color={T.blue} />
                <span>{s.text}</span>
              </motion.button>
            ))}
          </div>
        </div>
      )}



      {/* Input Message Compose Hub */}
      <div
        style={{
          padding: "24px 32px 32px",
          background: "white",
          borderTop: "1px solid #E2E8F0",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.015)"
        }}
      >
        <div style={{ position: "relative", maxWidth: 960, margin: "0 auto", display: "flex", gap: 12, flexDirection: lang === "ar" ? "row-reverse" : "row" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder={t.placeholder}
              style={{
                width: "100%",
                height: 56,
                padding: "0 24px",
                paddingLeft: lang === "ar" ? 24 : 48,
                paddingRight: lang === "ar" ? 48 : 24,
                background: "#F8FAFC",
                border: "1.5px solid #E2E8F0",
                borderRadius: 16,
                fontSize: 15,
                fontWeight: 600,
                color: T.text,
                outline: "none",
                textAlign: lang === "ar" ? "right" : "left",
                transition: "all 0.2s ease-in-out",
                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.01)",
                direction: lang === "ar" ? "rtl" : "ltr"
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = T.blue;
                e.currentTarget.style.boxShadow = `0 0 0 4px ${T.blue}12, inset 0 2px 4px rgba(0,0,0,0.01)`;
                e.currentTarget.style.background = "white";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#E2E8F0";
                e.currentTarget.style.boxShadow = "inset 0 2px 4px rgba(0,0,0,0.01)";
                e.currentTarget.style.background = "#F8FAFC";
              }}
            />
            <div 
              style={{ 
                position: "absolute", 
                left: lang === "ar" ? "auto" : 16, 
                right: lang === "ar" ? 16 : "auto", 
                top: "50%", 
                transform: "translateY(-50%)", 
                color: T.grayDark 
              }}
            >
              <MessageCircle size={20} />
            </div>
          </div>
          
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            style={{
              width: 56,
              height: 56,
              background: loading || !input.trim() ? "#CBD5E1" : T.blue,
              border: "none",
              borderRadius: 16,
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: loading || !input.trim() ? "default" : "pointer",
              boxShadow: loading || !input.trim() ? "none" : `0 4px 14px ${T.blue}35`,
              transition: "all 0.2s ease",
              transform: lang === "ar" ? "scaleX(-1)" : "none"
            }}
            onMouseEnter={(e) => {
              if (!loading && input.trim()) {
                e.currentTarget.style.background = T.blueDark;
                e.currentTarget.style.transform = lang === "ar" ? "scaleX(-1) translateY(-1px)" : "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && input.trim()) {
                e.currentTarget.style.background = T.blue;
                e.currentTarget.style.transform = lang === "ar" ? "scaleX(-1)" : "none";
              }
            }}
          >
            <Send size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
