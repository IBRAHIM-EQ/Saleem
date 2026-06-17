
export interface AllergyDetail {
  name: string;
  emoji: string;
  description: string;
  prevention: string;
  avoidFoods: string[];
  safeFoods: string[];
  symptoms: string;
}

export const ALLERGY_DATA: Record<string, AllergyDetail> = {
  Dairy: {
    name: "Dairy",
    emoji: "🥛",
    description: "Milk allergy is an abnormal response by the body's immune system to milk and products containing it.",
    prevention: "Avoid all dairy products and carefully check food labels for casein or whey.",
    avoidFoods: ["Milk", "Cheese", "Butter", "Yogurt", "Cream", "Ice Cream"],
    safeFoods: ["Almond Milk", "Coconut Milk", "Oat Milk", "Soy Milk"],
    symptoms: "Skin rash, vomiting, digestive upsets, and shortness of breath in severe cases."
  },
  Peanuts: {
    name: "Peanuts",
    emoji: "🥜",
    description: "Peanut allergy occurs when the immune system mistakenly identifies peanut proteins as a harmful substance.",
    prevention: "Avoid peanuts entirely and be cautious of foods that may contain traces of them (cross-contamination).",
    avoidFoods: ["Peanuts", "Peanut Butter", "Peanut Oil", "Certain sweets and candies"],
    safeFoods: ["Sunflower seeds", "Pumpkin seeds", "Almonds (if no nut allergy)", "Sesame Tahini"],
    symptoms: "Throat swelling, severe difficulty breathing, drop in blood pressure, itchy skin."
  },
  Gluten: {
    name: "Gluten",
    emoji: "🌾",
    description: "An immune reaction to eating gluten, a protein found in wheat, barley, and rye.",
    prevention: "Total reliance on products labeled 'Gluten-Free' and avoiding traditional baked goods.",
    avoidFoods: ["Regular Bread", "Pasta", "Biscuits", "Cakes", "Breakfast cereals containing wheat"],
    safeFoods: ["Rice", "Quinoa", "Potatoes", "Corn", "Millet"],
    symptoms: "Abdominal bloating, chronic diarrhea, fatigue, weight loss, joint pain."
  },
  Eggs: {
    name: "Eggs",
    emoji: "🥚",
    description: "The second most common food allergy in children, caused by a reaction to egg white or yolk proteins.",
    prevention: "Avoid direct eggs and products that use eggs as a binding or glazing agent.",
    avoidFoods: ["Boiled and fried eggs", "Mayonnaise", "Some types of pasta", "Baked goods containing eggs"],
    safeFoods: ["Plant-based egg substitutes", "Ground flaxseed (in baking)", "Applesauce (as a cake substitute)"],
    symptoms: "Dermatitis, nasal allergy, digestive problems, rarely causes anaphylaxis."
  },
  Fish: {
    name: "Fish",
    emoji: "🐟",
    description: "Allergy to proteins in finned fish like tuna or salmon, often lasting a lifetime.",
    prevention: "Stay away from seafood restaurants to avoid breathing in cooking fumes or contact.",
    avoidFoods: ["Tuna", "Salmon", "Cod", "Fish sauce", "Sushi"],
    safeFoods: ["Chicken", "Red meat", "Legumes (as an alternative protein source)"],
    symptoms: "Itching, swelling, headache, difficulty breathing."
  },
  Soy: {
    name: "Soy",
    emoji: "🫘",
    description: "Often starts in childhood and occurs towards soy proteins found in many processed foods.",
    prevention: "Read labels very carefully because soy is used in many oils and preservatives.",
    avoidFoods: ["Soybeans", "Soy sauce", "Tofu", "Soy milk", "Soy lecithin"],
    safeFoods: ["Olive oil", "Coconut aminos (soy sauce substitute)", "Peas"],
    symptoms: "Tingling in the mouth, skin rash, swelling of the lips, abdominal pain."
  },
  "Tree Nuts": {
    name: "Tree Nuts",
    emoji: "🌰",
    description: "Includes walnuts, almonds, cashews, and hazelnuts, which are among the most dangerous allergies causing anaphylaxis.",
    prevention: "Avoid tree nuts, extracted oils, and skincare products containing them.",
    avoidFoods: ["Almonds", "Walnuts", "Cashews", "Pistachios", "Nutella (containing hazelnuts)"],
    safeFoods: ["Seeds (such as sunflower and sesame)", "Coconut", "Legumes"],
    symptoms: "Facial swelling, severe difficulty swallowing, persistent coughing, loss of consciousness."
  },
  Shellfish: {
    name: "Shellfish",
    emoji: "🦐",
    description: "Abnormal response to marine animals that live in water and have a shell such as shrimp and crab.",
    prevention: "Be cautious even about touching tools used for cooking seafood.",
    avoidFoods: ["Shrimp", "Crab", "Lobster", "Oysters"],
    safeFoods: ["Finned fish (if not allergic to them)", "Land-based protein sources"],
    symptoms: "Nasal congestion, stomach pain, itching, dizziness."
  },
  Sesame: {
    name: "Sesame",
    emoji: "🌿",
    description: "An increasingly common allergy worldwide to sesame seeds and their proteins.",
    prevention: "Avoid baked goods where sesame is frequently used, and be cautious of essential oils.",
    avoidFoods: ["Sesame seeds", "Tahini", "Halva", "Sesame oil", "Za'atar (containing sesame)"],
    safeFoods: ["Peanut butter (if not allergic)", "Pumpkin seed butter"],
    symptoms: "Severe itching, swelling, respiratory and digestive problems."
  },
  Mustard: {
    name: "Mustard",
    emoji: "🌼",
    description: "Reaction to mustard seeds, which can be severe even with very tiny amounts.",
    prevention: "Avoid ready-made sauces and dressings that often contain hidden mustard.",
    avoidFoods: ["Mustard paste", "Mustard seeds", "Flavored mayonnaise", "Some types of pickles"],
    safeFoods: ["Ketchup", "Horseradish (as a flavor substitute)", "Fresh herbs"],
    symptoms: "Tinnitus, skin rash, vomiting, shortness of breath."
  }
};

export const ALLERGY_DATA_AR: Record<string, AllergyDetail> = {
  Dairy: {
    name: "حساسية الحليب والألبان",
    emoji: "🥛",
    description: "رد فعل مناعي تجاه البروتينات الموجودة في حليب البقر ومشتقاته في الأطعمة المختلفة.",
    prevention: "تجنب جميع منتجات الألبان وتحقق بعناية من ملصقات الأغذية بحثًا عن الكازين أو مصل اللبن.",
    avoidFoods: ["الحليب بكافة أنواعه", "الأجبان بجميع أنواعها", "اللبن والزبادي والقشطة", "الزبدة والسمنة", "المثلجات والآيس كريم", "بروتين مصل اللبن"],
    safeFoods: ["حليب اللوز", "حليب الشوفان", "حليب الصويا", "لبن وجوز الهند"],
    symptoms: "طفح جلدي، قيء، اضطرابات في الجهاز الهضمي، وضيق في التنفس في الحالات الشديدة."
  },
  Peanuts: {
    name: "حساسية الفول السوداني",
    emoji: "🥜",
    description: "تحدث حساسية الفول السوداني عندما يتعرف جهاز المناعة عن طريق الخطأ على بروتينات الفول السوداني على أنها مادة ضارة.",
    prevention: "تجنب الفول السوداني تمامًا واحذر من الأطعمة التي قد تحتوي على آثار منها ومن التلوث التبادلي.",
    avoidFoods: ["الفول السوداني", "زبدة الفول السوداني", "زيت الفول السوداني", "الحلويات والمكسرات المختلطة"],
    safeFoods: ["بذور دوار الشمس", "بذور اليقطين", "اللوز (إذا لم يكن هناك حساسية مكسرات)", "الطحينة النقية"],
    symptoms: "تورم الحلق، صعوبة شديدة في التنفس، انخفاض ضغط الدم، حكة جلدية."
  },
  Gluten: {
    name: "حساسية الغلوتين ومرض السيلياك",
    emoji: "🌾",
    description: "اضطراب في المناعة الذاتية حيث يؤدي تناول الغلوتين إلى تلف جدار الأمعاء الدقيقة وصعوبة الامتصاص.",
    prevention: "الاعتماد الكامل على المنتجات المكتوب عليها 'خالٍ من الغلوتين' وتجنب المخبوزات التقليدية.",
    avoidFoods: ["القمح والطحين العادي", "الشعير والجاودار", "البرغل والفريكة والسميد", "المعكرونة التقليدية", "المخبوزات والحلويات العادية"],
    safeFoods: ["الأرز", "حبوب الكينوا", "البطاطا والنشا الطبيعي", "البقوليات والأرز البني"],
    symptoms: "انتفاخ البطن، الإسهال المزمن، التعب والإرهاق، فقدان الوزن، آلام المفاصل."
  },
  Eggs: {
    name: "حساسية البيض",
    emoji: "🥚",
    description: "ثاني أكثر أنواع الحساسية الغذائية انتشاراً لدى الأطفال، وتنتج عن رد فعل تجاه بروتينات بياض البيض أو صفاره.",
    prevention: "تجنب البيض المباشر والمنتجات التي تستخدم البيض كعامل تماسك أو تلميع للمخبوزات والصلصات.",
    avoidFoods: ["البيض المسلوق والمقلي", "صلصات المايونيز والترتار", "المعجنات والمخبوزات المدهونة بالبيض"],
    safeFoods: ["بدائل البيض النباتية المصنعة", "بذور الكتان المطحونة والمبللة", "الموز المهروس أو التفاح المطبوخ (في الخبز)"],
    symptoms: "التهاب الجلد والأكزيما، حساسية الأنف، مشاكل الجهاز الهضمي، ونادرًا ما تسبب صدمة حساسية مفرطة."
  },
  Fish: {
    name: "حساسية الأسماك",
    emoji: "🐟",
    description: "رد فعل مناعي مفرط ومستمر تجاه بروتينات الأسماك ذات الزعانف مثل التونة أو السلمون، وغالبًا ما يستمر مدى الحياة.",
    prevention: "الابتعاد عن مطاعم المأكولات البحرية لتجنب استنشاق أبخرة الطهي أو ملامستها.",
    avoidFoods: ["الأسماك الطازجة والمجمدة", "علب التونة والسردين والسلمون", "المرق والصلصات التي يدخل فيها مستخلص السمك"],
    safeFoods: ["الدواجن واللحوم الحمراء", "البقوليات الغنية بالبروتين", "الأميغا 3 المستخرج من الطحالب البحرية"],
    symptoms: "الحكة الشديدة، التورم، الصداع، وضيق في التنفس."
  },
  Soy: {
    name: "حساسية الصويا",
    emoji: "🫘",
    description: "غالبًا ما تبدأ في مرحلة الطفولة وتحدث تجاه بروتينات الصويا الموجودة في العديد من الأطعمة المصنعة.",
    prevention: "اقرأ ملصقات الأغذية بعناية فائقة لأن الصويا تستخدم في العديد من الزيوت والمواد الحافظة.",
    avoidFoods: ["فول الصويا", "صلصة الصويا (صويا صوص)", "التوفو والصلصات الآسيوية", "حليب الصويا ولبن الصويا"],
    safeFoods: ["زيت الزيتون", "أمينو جوز الهند البديل للصلصة", "البقوليات الأخرى آمنة المصدر"],
    symptoms: "وخز في الفم، طفح جلدي، تورم الشفاه والوجه بشكل ملحوظ، ألم البطن."
  },
  "Tree Nuts": {
    name: "حساسية المكسرات الشجرية",
    emoji: "🌰",
    description: "تشمل اللوز والجوز والكاجو والبندق، وهي من أخطر مسببات الحساسية التي قد تسبب صدمة حساسية مفرطة.",
    prevention: "تجنب المكسرات الشجرية والزيوت المستخرجة منها ومستحضرات التجميل التي تحتوي عليها.",
    avoidFoods: ["اللوز والكاجو والفسق", "الجوز واللوز البرازيلي ومكسرات المكاديميا", "البندق وجوز البقان وزبدة هذه المكسرات"],
    safeFoods: ["بذور السمسم وعباد الشمس واليقطين", "جوز الهند", "البقوليات الغذائية آمنة المصدر"],
    symptoms: "تورم الوجه، صعوبة شديدة في البلع، السعال المستمر، فقدان الوعي."
  },
  Shellfish: {
    name: "حساسية القشريات والمأكولات البحرية",
    emoji: "🦐",
    description: "رد فعل غير طبيعي من الجسم تجاه الحيوانات البحرية التي تعيش في الماء ولها قشرة مثل الروبيان (الجمبري) والكابوريا.",
    prevention: "كن حذرًا حتى بشأن لمس الأدوات والسكاكين المستخدمة في طهي المأكولات البحرية لتجنب انتقال المكونات.",
    avoidFoods: ["الروبيان (الجمبري)", "السلطعون (الكابوريا)", "الاستاكوزا (جراد البحر)", "المحار"],
    safeFoods: ["الأسماك ذات الزعانف (إذا لم تكن تعاني من حساسية تجاهها)", "مصادر البروتينات البرية كاللحوم"],
    symptoms: "احتقان الأنف، ألم المعدة والتشنجات المرافقة، الحكة الشديدة، الدوخة."
  },
  Sesame: {
    name: "حساسية السمسم",
    emoji: "🌿",
    description: "حساسية شائعة ومتزايدة بشكل كبير على مستوى العالم تجاه بذور السمسم والبروتينات الموجودة بها.",
    prevention: "تجنب المخبوزات والحلويات ومحامص عمان والمكونات التي تدخل فيها الطحينية.",
    avoidFoods: ["بذور السمسم", "الطحينة", "الحلاوة الطحينية", "زيت السمسم", "الزعتر المحتوي على السمسم"],
    safeFoods: ["زبدة الفول السوداني (إذا لم تكن تعاني من حساسية تجاهها)", "زبدة بذور اليقطين"],
    symptoms: "حكة شديدة، تورم مفرط، مشاكل هضمية وتنفسية حادة."
  },
  Mustard: {
    name: "حساسية الخردل",
    emoji: "🌼",
    description: "رد فعل تحسسي تجاه بذور الخردل، ويمكن أن يكون شديدًا حتى مع تناول كميات ضئيلة جدًا منها.",
    prevention: "تجنب الصلصات والتتبيلات وجرّب بدائل نكهات المستردة والخردل الجاهز.",
    avoidFoods: ["معجون الخردل (المستردة)", "بذور الخردل", "المايونيز المنكه بالخردل", "بعض أنواع المخللات"],
    safeFoods: ["صلصة الطماطم (الكاتشب)", "حبوب الفجل الأبيض (كبديل للنكهة الحارة)", "الأعشاب الطازجة"],
    symptoms: "طنين الأذن، طفح جلدي وحرقة خفيفة، قيء، ضيق وصعوبة في التنفس."
  }
};

