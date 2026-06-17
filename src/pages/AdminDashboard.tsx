/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { T, DEFAULT_PRODUCTS} from "../constants";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  LogOut,
  Plus,
  Trash2,
  Shield,
  Search,
  Eye,
  EyeOff,
  Tag,
  Settings,
  X,
  MapPin,
  Globe,
  ExternalLink,
  AlertCircle,
  Phone,
  Info,
  Sparkles,
  Heart,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  getAllAllergens,
  getAllergenEmoji,
  mapAllergenName,
  getCustomAllergens,
  saveCustomAllergens,
  getAllergyDetails,
  toggleAllergenVisibility,
  deleteCustomAllergen,
  deleteAllergen,
  saveOrUpdateCustomAllergen,
} from "../lib/allergyService";
import { adminBrandsApi, adminSpecialistsApi, adminUsersApi, adminDashboardApi, adminProductsApi } from "../lib/api";
import { Toast } from "../components/Toast";

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

const allergenArabic: Record<string, string> = {
  Dairy: "الحليب ومشتقاته",
  Peanuts: "الفول السوداني",
  Gluten: "الغلوتين",
  Eggs: "البيض",
  Fish: "الأسماك",
  Soy: "الصويا",
  "Tree Nuts": "المكسرات الثلاثية",
  Shellfish: "المأكولات البحرية القشرية",
  Sesame: "السمسم",
  Mustard: "الخردل",
};

const IMAGE_PRESETS = [
  { url: "https://images.unsplash.com/photo-1557089753-b490acdbb441?auto=format&fit=crop&w=400&q=80", name: "بسكويت / كعك", category: "Snacks" },
  { url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80", name: "خبز وطحين", category: "Bakery" },
  { url: "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=400&q=80", name: "عصير برتقال", category: "Juice" },
  { url: "https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&w=400&q=80", name: "حليب الشوفان", category: "Dairy/Alts" },
  { url: "https://images.unsplash.com/photo-1549007994-cb92ca21df67?auto=format&fit=crop&w=400&q=80", name: "شوكولاتة داكنة", category: "Sweets" },
  { url: "https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=400&q=80", name: "زبادي / لبن", category: "Dairy" },
  { url: "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=400&q=80", name: "حبوب / مكسرات", category: "Nuts" },
  { url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80", name: "وجبة غذائية منوعة", category: "Meals" },
];

const severityMap: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  Mild: { label: "خفيفة", color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
  Moderate: {
    label: "متوسطة",
    color: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
  },
  Severe: {
    label: "شديدة",
    color: "#DC2626",
    bg: "#FEF2F2",
    border: "#FCA5A5",
  },
};

const mapActivityAction = (action: string, lang: "ar" | "en") => {
  const isAr = lang === "ar";
  switch (action) {
    case "Add Product":
      return { 
        label: isAr ? "إضافة منتج جديد" : "Add Product", 
        color: "#16A34A", 
        bg: "#DCFCE7",
        icon: "📦"
      };
    case "Update Product":
      return { 
        label: isAr ? "تعديل منتج" : "Update Product", 
        color: "#2563EB", 
        bg: "#DBEAFE",
        icon: "✏️"
      };
    case "Delete Product":
      return { 
        label: isAr ? "حذف منتج نهائياً" : "Delete Product", 
        color: "#DC2626", 
        bg: "#FEE2E2",
        icon: "🗑️"
      };
    case "Hide Product":
      return { 
        label: isAr ? "حجب إظهار منتج" : "Hide Product", 
        color: "#475569", 
        bg: "#F1F5F9",
        icon: "👁️‍🗨️"
      };
    case "Show Product":
      return { 
        label: isAr ? "إلغاء حجب منتج" : "Show Product", 
        color: "#0D9488", 
        bg: "#CCFBF1",
        icon: "👁️"
      };
    case "Add Specialist":
      return { 
        label: isAr ? "إضافة طبيب مختص" : "Add Specialist", 
        color: "#059669", 
        bg: "#D1FAE5",
        icon: "👨‍⚕️"
      };
    case "Update Specialist":
      return { 
        label: isAr ? "تعديل طبيب مختص" : "Update Specialist", 
        color: "#0891B2", 
        bg: "#ECFEFF",
        icon: "🩺"
      };
    case "Delete Specialist":
      return { 
        label: isAr ? "حذف طبيب مختص" : "Delete Specialist", 
        color: "#E11D48", 
        bg: "#FFE4E6",
        icon: "❌"
      };
    case "Hide Specialist":
      return { 
        label: isAr ? "حجب الطبيب" : "Hide Specialist", 
        color: "#D97706", 
        bg: "#FEF3C7",
        icon: "🔒"
      };
    case "Restore Specialist":
      return { 
        label: isAr ? "إلغاء حجب الطبيب" : "Restore Specialist", 
        color: "#7C3AED", 
        bg: "#EDE9FE",
        icon: "🔓"
      };
    case "Add Allergen":
      return { 
        label: isAr ? "إضافة تصنيف حساسية" : "Add Allergen", 
        color: "#059669", 
        bg: "#E6F4EA",
        icon: "⚠️"
      };
    case "Update Allergen":
      return { 
        label: isAr ? "تعديل تصنيف حساسية" : "Update Allergen", 
        color: "#4F46E5", 
        bg: "#EEF2FF",
        icon: "⚙️"
      };
    case "Delete Allergen":
      return { 
        label: isAr ? "حذف تصنيف حساسية" : "Delete Allergen", 
        color: "#B91C1C", 
        bg: "#FEF2F2",
        icon: "🗑️"
      };
    case "Toggle Allergen Visibility":
      return { 
        label: isAr ? "رؤية تصنيف الحساسية" : "Toggle Allergen Visibility", 
        color: "#475569", 
        bg: "#F8FAFC",
        icon: "👁️"
      };
    case "Delete User":
      return { 
        label: isAr ? "حذف حساب مستخدم" : "Delete User", 
        color: "#B91C1C", 
        bg: "#FEE2E2",
        icon: "👤"
      };
    case "Update User":
      return { 
        label: isAr ? "تعديل حساب مستخدم" : "Update User", 
        color: "#2563EB", 
        bg: "#EFF6FF",
        icon: "📝"
      };
    case "Update User Role":
      return { 
        label: isAr ? "تعديل صلاحيات حساب" : "Update User Role", 
        color: "#7C3AED", 
        bg: "#F5F3FF",
        icon: "🛡️"
      };
    case "Login":
      return { 
        label: isAr ? "تسجيل دخول لوحة المسؤول" : "Login", 
        color: "#0D9488", 
        bg: "#F0FDFA",
        icon: "🔑"
      };
    default:
      return { 
        label: action, 
        color: "#475569", 
        bg: "#F1F5F9",
        icon: "📝"
      };
  }
};

interface AdminDashboardProps {
  onLogout: () => void;
  onSwitchToApp?: () => void;
  adminProducts: any[];
  defaultProductsOverrides: any[];
  adminSpecialists: any[];
  hiddenProductIds: string[];
  hiddenSpecialistIds?: string[];
  deletedSpecialistIds?: string[];
  defaultSpecialistsOverrides?: any[];
  allUsers: any[];
  userCount: number;
  activities: any[];
  onAddProduct: (p: any) => void;
  onUpdateProduct: (p: any) => void;
  onDeleteAdminProduct: (id: number) => void;
  onToggleProductHide: (id: any) => void;
  onAddSpecialist: (s: any) => void;
  onDeleteAdminSpecialist: (id: number) => void;
  onHideDefaultSpecialist: (id: string) => void;
  onRestoreSpecialist: (id: string) => void;
  onUpdateSpecialist?: (s: any) => void;
  onDeleteUser: (username: string) => void;
  onUpdateUser?: (oldUsername: string, newUsername: string, data: any) => void;
  onUpdateUserRole: (
    username: string,
    role: string,
    doctorDetails?: any,
  ) => void;
  onLogActivity?: (action: string, target: string) => void;
  lang?: "ar" | "en";
}

export function AdminDashboard({
  onLogout,
  onSwitchToApp,
  adminProducts,
  defaultProductsOverrides,
  adminSpecialists,
  allUsers,
  hiddenProductIds,
  userCount,
  activities,
  onAddProduct,
  onUpdateProduct,
  onDeleteAdminProduct,
  onToggleProductHide,
  onAddSpecialist,
  onDeleteAdminSpecialist,
  onHideDefaultSpecialist,
  onRestoreSpecialist,
  onUpdateSpecialist,
  onDeleteUser,
  onUpdateUser,
  onUpdateUserRole,
  onLogActivity,
  lang = "ar",
  
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [productForm, setProductForm] = useState<any>({
    name: "",
    brand: "",
    category: "Spread",
    description: "",
    AllergenKey: "",
    imageUrl: "", // mandatory product image
    emoji: "📦",
    vendors: [],
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [specialistForm, setSpecialistForm] = useState({
    name: "",
    title: "",
    email: "",
    bio: "",
    phone: "",
    whatsAppNumber: "",
    experienceYears: 8,
    rating: 4.8,
    reviewsCount: 25,
    hours: "",
    price: "",
    imageUrl: "",
  });
  const [searchQuery, setSearchQuery] = useState("");

  // Custom Allergens Management state
  const [customAllergens, setCustomAllergens] = useState<any[]>(() => getCustomAllergens());
  const [isAddingAllergy, setIsAddingAllergy] = useState(false);
  const [editingAllergen, setEditingAllergen] = useState<any | null>(null);

  // Form states for adding/editing allergen
  const [allergyName, setAllergyName] = useState("");
  const [allergyType, setAllergyType] = useState("حساسية غذائية");
  const [allergyEmoji, setAllergyEmoji] = useState("🥛");
  const [allergySymptoms, setAllergySymptoms] = useState("");
  const [allergyAvoidFoods, setAllergyAvoidFoods] = useState("");
  const [allergySafeFoods, setAllergySafeFoods] = useState("");
  const [allergyPrevention, setAllergyPrevention] = useState("");
  const [allergyDescription, setAllergyDescription] = useState("");
  const [allergyError, setAllergyError] = useState<string | null>(null);

  // Clear error after 5 seconds
  useEffect(() => {
    if (formError) {
      const timer = setTimeout(() => setFormError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [formError]);

  // Settings Modal State
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  const normalizeBrands = (brands: any[]) =>
    brands.map((b: any) => ({
      ...b,
      stores: (b.stores || []).map((s: any) => ({
        ...s,
        link: s.googleMapsUrl || s.link || "",
      })),
    }));

  useEffect(() => {
    const fetchBrands = async () => {
      if (!editingProduct?.id) return;
      try {
        const brands = await adminBrandsApi.getByProduct(Number(editingProduct.id));
        setEditingProduct((prev: any) => ({
          ...prev,
          localBrands: Array.isArray(brands) ? normalizeBrands(brands) : [],
        }));
      } catch (error) {
        console.error("Error fetching brands", error);
      }
    };
    fetchBrands();
  }, [editingProduct?.id]);

  useEffect(() => {
    if (activeTab !== "users") return;
    setLoadingUsers(true);
    adminUsersApi.getAll()
      .then(users => { setDbUsers(users); setDbTotalUsers(users.length); })
      .catch(() => {})
      .finally(() => setLoadingUsers(false));
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "dashboard") return;
    adminDashboardApi.getStats()
      .then(stats => setDbTotalUsers(stats.totalUsers))
      .catch(() => {});
  }, [activeTab]);

  // Fetch ALL products (including hidden) for the admin product inventory
  const reloadAdminProducts = () => {
    adminProductsApi.getAll()
      .then(products => setAdminAllProducts(products))
      .catch(() => {});
  };

  useEffect(() => {
    if (activeTab !== "products") return;
    reloadAdminProducts();
  }, [activeTab]);

  // Confirmation state
  const [confirmAdmin, setConfirmAdmin] = useState<number | null>(null);

  // Premium Arabic Custom Action Confirmation Modal State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    type: "delete" | "hide" | "restore";
    targetLabel: string;
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
    type: "delete",
    targetLabel: ""
  });

  // User Settings State
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [userSettingsForm, setUserSettingsForm] = useState<any>(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editingSpecialist, setEditingSpecialist] = useState<any | null>(null);
  const [selectedBrandIndex, setSelectedBrandIndex] = useState<number | null>(
    null,
  );
  const [newBrandName, setNewBrandName] = useState("");
  const [storeError, setStoreError] = useState<string | null>(null);
  const [adminToast, setAdminToast] = useState<{ message: string; type?: "success" | "error" } | null>(null);
  const [dbUsers, setDbUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userRoleFilter, setUserRoleFilter] = useState<"all" | "User" | "Admin">("all");
  const [dbTotalUsers, setDbTotalUsers] = useState<number | null>(null);
  const [adminAllProducts, setAdminAllProducts] = useState<any[] | null>(null);

  // Live Activity Modal state
  const [showAllActivitiesModal, setShowAllActivitiesModal] = useState(false);
  const [activitySearchQuery, setActivitySearchQuery] = useState("");

  const allProducts = [
    ...DEFAULT_PRODUCTS.map((dp) => {
      const override = defaultProductsOverrides.find(
        (o) => String(o.id) === String(dp.id),
      );
      return override ? { ...dp, ...override } : dp;
    }),
    ...adminProducts,
  ];

  // For the admin product inventory: use the full admin list (includes hidden products)
  // Falls back to allProducts (from user API, no hidden) until the admin fetch completes
  const allVisibleProducts = (adminAllProducts ?? allProducts).sort((a, b) =>
    (a.name || "").localeCompare(b.name || "", "ar"),
  );

  const allVisibleSpecialists = adminSpecialists;


  const filteredUsers = (dbUsers.length > 0 ? dbUsers : allUsers || []).filter((user: any) => {
    const searchLower = (searchQuery || "").toLowerCase();
    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase();
    const matchesSearch =
      !searchLower ||
      user.email?.toLowerCase().includes(searchLower) ||
      fullName.includes(searchLower);
    const matchesRole =
      userRoleFilter === "all" ||
      (user.role || "").toLowerCase() === userRoleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });



  const filteredProducts = allVisibleProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const filteredSpecialists = allVisibleSpecialists.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Count all brands across all products (productBrands from API, fallback to brands/localBrands)
  const totalBrandCount = allProducts.reduce((sum: number, p: any) => {
    const list = p.productBrands || p.brands || p.localBrands || [];
    return sum + (Array.isArray(list) ? list.length : 0);
  }, 0);

  // Keep unique brand-name set for other uses (e.g. autocomplete)
  const brands = Array.from(
    new Set(
      allProducts
        .flatMap((p) => {
          const list = p.productBrands || p.brands || p.localBrands || [];
          return Array.isArray(list) ? list.map((b: any) => b.name?.trim?.() || "") : [];
        })
        .filter(Boolean)
        .map((b) => b.toLowerCase()),
    ),
  );

  const SidebarItem = ({
    id,
    label,
    icon: Icon,
  }: {
    id: string;
    label: string;
    icon: any;
  }) => (
    <div
      onClick={() => setActiveTab(id)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        borderRadius: 12,
        cursor: "pointer",
        background: activeTab === id ? `${T.mint}15` : "transparent",
        color: activeTab === id ? T.mint : "#9CA3AF",
        fontWeight: activeTab === id ? 700 : 500,
        transition: "all 0.2s ease",
        fontFamily: "Sora, sans-serif",
      }}
    >
      <Icon size={20} />
      <span>{label}</span>
    </div>
  );

  // Brand Handlers
  const addBrand = async () => {
    if (!newBrandName.trim()) return;
    try {
      await adminBrandsApi.create(Number(editingProduct.id), newBrandName);
      const brands = await adminBrandsApi.getByProduct(Number(editingProduct.id));
      setEditingProduct((prev: any) => ({
        ...prev,
        localBrands: Array.isArray(brands) ? normalizeBrands(brands) : [],
      }));
      setNewBrandName("");
      setAdminToast({ message: `Brand "${newBrandName}" added successfully!`, type: "success" });
    } catch (error) {
      console.error("Error adding brand", error);
      setAdminToast({ message: "Failed to add brand. Check backend connection.", type: "error" });
    }
  };

  const toggleBrandVisibility = async (idx: number) => {
    const updatedBrands = [...(editingProduct.localBrands || [])];
    const brand = updatedBrands[idx];
    try {
      await adminBrandsApi.toggleHide(Number(editingProduct.id), brand.id, brand.isHidden);
      updatedBrands[idx] = { ...brand, isHidden: !brand.isHidden };
      setEditingProduct({ ...editingProduct, localBrands: updatedBrands });
    } catch (error) {
      console.error("Error toggling brand visibility", error);
    }
  };

  const removeBrand = async (idx: number) => {
    const updatedBrands = [...(editingProduct.localBrands || [])];
    const brand = updatedBrands[idx];
    try {
      await adminBrandsApi.delete(Number(editingProduct.id), brand.id);
      updatedBrands.splice(idx, 1);
      setEditingProduct({ ...editingProduct, localBrands: updatedBrands });
    } catch (error) {
      console.error("Error removing brand", error);
    }
  };

  const addStoreToBrand = () => {
    if (selectedBrandIndex === null) return;
    const currentBrands = Array.isArray(editingProduct.localBrands)
      ? editingProduct.localBrands
      : [];
    const newStore = {
      id: null,
      isNew: true,
      name: "",
      location: "",
      googleMapsUrl: "",
      link: "",
      isHidden: false,
    };
    const updatedBrands = currentBrands.map((b: any, i: number) =>
      i === selectedBrandIndex
        ? { ...b, stores: [...(b.stores || []), newStore] }
        : b
    );
    setEditingProduct((prev: any) => ({ ...prev, localBrands: updatedBrands }));
  };

  const removeStoreFromBrand = async (storeIdx: number) => {
    if (selectedBrandIndex === null) return;
    const updatedBrands = [...(editingProduct.localBrands || [])];
    const brand = updatedBrands[selectedBrandIndex];
    const store = (brand.stores || [])[storeIdx];
    if (store?.id) {
      try {
        await adminBrandsApi.deleteStore(brand.id, store.id);
      } catch (error) {
        console.error("Error deleting store", error);
      }
    }
    const updatedStores = [...(brand.stores || [])];
    updatedStores.splice(storeIdx, 1);
    updatedBrands[selectedBrandIndex] = { ...brand, stores: updatedStores };
    setEditingProduct((prev: any) => ({ ...prev, localBrands: updatedBrands }));
  };

  // Extract lat/lng from any standard Google Maps URL
  const extractCoordsFromUrl = (url: string): { lat: number; lng: number } | null => {
    if (!url) return null;
    const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (atMatch) return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
    const qMatch = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (qMatch) return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };
    const llMatch = url.match(/[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (llMatch) return { lat: parseFloat(llMatch[1]), lng: parseFloat(llMatch[2]) };
    return null;
  };

  const updateStoreInBrand = (storeIdx: number, field: string, value: string) => {
  if (selectedBrandIndex === null) return;

  const updatedBrands = [...(editingProduct.localBrands || [])];
  const brand = updatedBrands[selectedBrandIndex];

  const updatedStores = [...(brand.stores || [])];
  updatedStores[storeIdx] = {
    ...updatedStores[storeIdx],
    [field]: value,
  };

  updatedBrands[selectedBrandIndex] = {
    ...brand,
    stores: updatedStores,
  };

  setEditingProduct({
    ...editingProduct,
    localBrands: updatedBrands,
  });
};

  const StatsCard = ({
    title,
    value,
    icon,
    color,
  }: {
    title: string;
    value: any;
    icon: any;
    color: string;
  }) => (
    <div
      style={{
        background: "white",
        padding: "24px 28px",
        borderRadius: 24,
        border: "1px solid #F3F4F6",
        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.03)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        transition: "transform 0.2s ease",
      }}
    >
      <div>
        <div
          style={{
            fontSize: 13,
            color: T.grayDark,
            fontWeight: 700,
            marginBottom: 8,
            letterSpacing: 0.5,
            opacity: 0.8,
          }}
        >
          {title.toUpperCase()}
        </div>
        <div
          style={{
            fontSize: 32,
            fontWeight: 800,
            color: T.text,
            lineHeight: 1,
          }}
        >
          {value}
        </div>
      </div>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 18,
          background: `${color}12`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: color,
        }}
      >
        {icon}
      </div>
    </div>
  );

  return (
    <>
    {adminToast && (
      <Toast
        message={adminToast.message}
        type={adminToast.type}
        onDone={() => setAdminToast(null)}
      />
    )}
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#F8FAFC",
        direction: "ltr",
        position: "relative",
        color: T.text,
      }}
    >
      {/* Settings Modal Overlay */}
      <AnimatePresence>
        {editingProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 23, 42, 0.4)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(8px)",
              padding: 24,
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              style={{
                background: "white",
                width: "100%",
                maxWidth: 800,
                borderRadius: 32,
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
                maxHeight: "90vh",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Modal Header */}
              <div
                style={{
                  padding: "32px 40px",
                  borderBottom: "1px solid #F1F5F9",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <h3
                    style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}
                  >
                    Product Customization
                  </h3>
                  <p
                    style={{ fontSize: 14, color: T.grayDark, fontWeight: 500 }}
                  >
                    Manage Brands and Store Availability
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setSelectedBrandIndex(null);
                    setStoreError(null);
                  }}
                  style={{
                    background: "#F1F5F9",
                    border: "none",
                    padding: 12,
                    borderRadius: 16,
                    cursor: "pointer",
                    color: T.text,
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Content Split */}
              <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
                {/* Left Side: Brands List */}
                <div
                  style={{
                    width: 300,
                    borderRight: "1px solid #F1F5F9",
                    padding: 32,
                    overflowY: "auto",
                    background: "#F8FAFC",
                  }}
                >
                  <h4
                    style={{ fontSize: 15, fontWeight: 800, marginBottom: 20 }}
                  >
                    Brands
                  </h4>

                  <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
                    <input
                      placeholder="Add brand..."
                      value={newBrandName}
                      onChange={(e) => setNewBrandName(e.target.value)}
                      style={{
                        flex: 1,
                        padding: "0 16px",
                        height: 44,
                        borderRadius: 12,
                        border: "1px solid #E2E8F0",
                        fontSize: 13,
                      }}
                    />
                    <button
                      onClick={() => addBrand()}
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: T.blue,
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Plus size={20} />
                    </button>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {(editingProduct?.localBrands ?? [])?.map(
                      (b: any, idx: number) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setSelectedBrandIndex(idx);
                            setStoreError(null);
                          }}
                          style={{
                            padding: "12px 16px",
                            borderRadius: 14,
                            background:
                              selectedBrandIndex === idx
                                ? "white"
                                : "transparent",
                            border: "1px solid",
                            borderColor:
                              selectedBrandIndex === idx
                                ? "#E2E8F0"
                                : "transparent",
                            boxShadow:
                              selectedBrandIndex === idx
                                ? "0 4px 6px -1px rgba(0,0,0,0.05)"
                                : "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            transition: "all 0.2s ease",
                            opacity: b.isHidden ? 0.6 : 1,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            <Tag
                              size={16}
                              style={{
                                color:
                                  selectedBrandIndex === idx
                                    ? T.blue
                                    : T.grayDark,
                              }}
                            />
                            <span style={{ fontWeight: 700, fontSize: 14 }}>
                              {b.name}
                            </span>
                          </div>
                          <div style={{ display: "flex", gap: 4 }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleBrandVisibility(idx);
                              }}
                              style={{
                                padding: 4,
                                background: "none",
                                border: "none",
                                color: b.isHidden ? T.red : T.mintDark,
                                cursor: "pointer",
                              }}
                            >
                              {b.isHidden ? (
                                <EyeOff size={14} />
                              ) : (
                                <Eye size={14} />
                              )}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeBrand(idx);
                              }}
                              style={{
                                padding: 4,
                                background: "none",
                                border: "none",
                                color: "#94A3B8",
                                cursor: "pointer",
                              }}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      ),
                    )}
                    {(editingProduct.localBrands || []).length === 0 && (
                      <div
                        style={{
                          textAlign: "center",
                          padding: "40px 0",
                          color: T.grayDark,
                          fontSize: 12,
                        }}
                      >
                        No brands added
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side: Store Details */}
                <div style={{ flex: 1, padding: 40, overflowY: "auto" }}>
                  {selectedBrandIndex !== null ? (
                    <div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 32,
                        }}
                      >
                        <h4 style={{ fontSize: 18, fontWeight: 900 }}>
                          Availability for{" "}
                          <span style={{ color: T.blue }}>
                            {
                              editingProduct.localBrands[selectedBrandIndex]
                                .name
                            }
                          </span>
                        </h4>
                        <button
                          onClick={addStoreToBrand}
                          style={{
                            padding: "8px 16px",
                            borderRadius: 10,
                            background: `${T.blue}10`,
                            color: T.blue,
                            border: "none",
                            fontWeight: 700,
                            fontSize: 13,
                            cursor: "pointer",
                          }}
                        >
                          + Add Store
                        </button>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 20,
                        }}
                      >
                        {storeError && (
                          <div
                            style={{
                              padding: "16px 20px",
                              backgroundColor: "#FEF2F2",
                              border: "1px solid #FCA5A5",
                              borderRadius: 16,
                              color: "#DC2626",
                              fontSize: 13,
                              fontWeight: 700,
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                              direction: "rtl",
                            }}
                          >
                            <AlertCircle size={18} />
                            <span>{storeError}</span>
                          </div>
                        )}

                        {editingProduct.localBrands[
                          selectedBrandIndex
                        ].stores.map((store: any, sIdx: number) => (
                          <div
                            key={sIdx}
                            style={{
                              padding: 24,
                              borderRadius: 20,
                              border: "1px solid #F1F5F9",
                              background: "#F8FAFC",
                            }}
                          >
                            {/* Store Header with index and delete button */}
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 16,
                                borderBottom: "1px dashed #E2E8F0",
                                paddingBottom: 12,
                              }}
                            >
                              <span style={{ fontWeight: 800, fontSize: 13, color: T.blue }}>
                                Store #{sIdx + 1} / منفذ بيع
                              </span>
                              <button
                                onClick={() => removeStoreFromBrand(sIdx)}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6,
                                  padding: "6px 12px",
                                  borderRadius: 8,
                                  background: "#FEF2F2",
                                  color: "#EF4444",
                                  border: "none",
                                  fontWeight: 750,
                                  fontSize: 12,
                                  cursor: "pointer",
                                }}
                              >
                                <Trash2 size={13} />
                                حذف المنفذ
                              </button>
                            </div>

                            {/* Inputs Grid */}
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: 16,
                              }}
                            >
                              {/* Field 1: Store Name */}
                              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                <label style={{ fontSize: 12, fontWeight: 800, color: T.grayDark }}>
                                  Store Name (Required) / اسم المتجر
                                </label>
                                <div style={{ position: "relative" }}>
                                  <ShoppingBag
                                    size={14}
                                    style={{
                                      position: "absolute",
                                      left: 12,
                                      top: "50%",
                                      transform: "translateY(-50%)",
                                      color: "#94A3B8",
                                    }}
                                  />
                                  <input
                                    placeholder="e.g., Safeway, Panda..."
                                    value={store.name}
                                    onChange={(e) =>
                                      updateStoreInBrand(sIdx, "name", e.target.value)
                                    }
                                    style={{
                                      width: "100%",
                                      height: 42,
                                      padding: "0 12px 0 34px",
                                      borderRadius: 10,
                                      border: "1px solid #E2E8F0",
                                      fontSize: 13,
                                    }}
                                  />
                                </div>
                              </div>

                              {/* Field 2: Region / Branch */}
                              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                <label style={{ fontSize: 12, fontWeight: 800, color: T.grayDark }}>
                                  Region / Branch (Required) / الفرع أو المنطقة
                                </label>
                                <div style={{ position: "relative" }}>
                                  <MapPin
                                    size={14}
                                    style={{
                                      position: "absolute",
                                      left: 12,
                                      top: "50%",
                                      transform: "translateY(-50%)",
                                      color: "#94A3B8",
                                    }}
                                  />
                                  <input
                                    placeholder="e.g., Amman, Mecca St..."
                                    value={store.location}
                                    onChange={(e) =>
                                      updateStoreInBrand(sIdx, "location", e.target.value)
                                    }
                                    style={{
                                      width: "100%",
                                      height: 42,
                                      padding: "0 12px 0 34px",
                                      borderRadius: 10,
                                      border: "1px solid #E2E8F0",
                                      fontSize: 13,
                                    }}
                                  />
                                </div>
                              </div>

                              {/* Field 3: Google Maps Full URL */}
                              {(() => {
                                const mapsUrl = store.googleMapsUrl || (store as any).link || "";
                                const hasCoords = /@-?\d+\.\d+,-?\d+\.\d+/.test(mapsUrl);
                                const isShort = mapsUrl.includes("goo.gl");
                                const hasUrl = mapsUrl.trim().length > 0;
                                const borderColor = !hasUrl ? "#E2E8F0"
                                  : hasCoords ? "#22C55E"
                                  : isShort   ? "#F59E0B"
                                  : "#EF4444";
                                const statusBg = !hasUrl ? "transparent"
                                  : hasCoords ? "#ECFDF5"
                                  : isShort   ? "#FFFBEB"
                                  : "#FEF2F2";
                                const statusColor = hasCoords ? "#15803D"
                                  : isShort   ? "#B45309"
                                  : "#DC2626";
                                const statusText = !hasUrl ? null
                                  : hasCoords ? "✅ Coordinates detected — distance will calculate automatically"
                                  : isShort   ? "⚠️ Short link detected — works, but use full URL for instant distance (no server call needed)"
                                  : "❌ No coordinates found — copy the full URL from the browser address bar";
                                return (
                                  <div style={{ display: "flex", flexDirection: "column", gap: 6, gridColumn: "1 / -1" }}>
                                    <label style={{ fontSize: 12, fontWeight: 800, color: T.grayDark }}>
                                      Google Maps URL (Required) / رابط خريطة المتجر
                                    </label>
                                    <div style={{ position: "relative" }}>
                                      <Globe size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                                      <input
                                        placeholder="https://www.google.com/maps/place/StoreName/@31.9546,35.8515,17z/..."
                                        value={mapsUrl}
                                        onChange={(e) => {
                                          updateStoreInBrand(sIdx, "googleMapsUrl", e.target.value);
                                          updateStoreInBrand(sIdx, "link", e.target.value);
                                        }}
                                        style={{
                                          width: "100%", height: 42,
                                          padding: "0 12px 0 34px",
                                          borderRadius: 10,
                                          border: `1.5px solid ${borderColor}`,
                                          fontSize: 13,
                                          outline: "none",
                                          transition: "border-color 0.2s",
                                        }}
                                      />
                                    </div>

                                    {/* Status badge */}
                                    {statusText && (
                                      <div style={{ fontSize: 11, fontWeight: 700, color: statusColor, background: statusBg, padding: "5px 10px", borderRadius: 8, lineHeight: 1.4 }}>
                                        {statusText}
                                      </div>
                                    )}

                                    {/* Instructions */}
                                    <div style={{ fontSize: 11, color: "#94A3B8", lineHeight: 1.6, padding: "6px 0" }}>
                                      <span style={{ fontWeight: 700, color: "#64748B" }}>How to get full URL / كيف تحصل على الرابط الكامل:</span>
                                      <br />
                                      1. Open Google Maps → navigate to the store
                                      <br />
                                      2. Copy the URL directly from the <span style={{ fontWeight: 700 }}>browser address bar</span> (not the Share button)
                                      <br />
                                      3. The URL should contain <span style={{ fontWeight: 700, color: "#15803D" }}>@lat,lng</span> — e.g. <span style={{ fontFamily: "monospace", fontSize: 10 }}>/@31.9546,35.8515,17z</span>
                                    </div>
                                  </div>
                                );
                              })()}

                            </div>
                          </div>
                        ))}
                        {editingProduct.localBrands[selectedBrandIndex].stores
                          .length === 0 && (
                          <div
                            style={{
                              textAlign: "center",
                              padding: 60,
                              border: "2px dashed #F1F5F9",
                              borderRadius: 24,
                              color: T.grayDark,
                            }}
                          >
                            <MapPin
                              size={32}
                              style={{ opacity: 0.1, marginBottom: 12 }}
                            />
                            <p>No stores linked to this brand yet</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        gap: 20,
                        color: T.text,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                        <Tag size={24} style={{ color: T.blue }} />
                        <h4 style={{ fontSize: 18, fontWeight: 900, margin: 0 }}>
                          General Product Info / معلومات المنتج العامة
                        </h4>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <label style={{ fontSize: 12, fontWeight: 800, color: T.text }}>
                          Product Name / اسم المنتج
                        </label>
                        <input
                          type="text"
                          value={editingProduct.name || ""}
                          onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                          style={{
                            height: 44,
                            padding: "0 16px",
                            borderRadius: 12,
                            border: "1px solid #E2E8F0",
                            background: "#F8FAFC",
                            fontSize: 14,
                            fontWeight: 500,
                          }}
                        />
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <label style={{ fontSize: 12, fontWeight: 800, color: T.text }}>
                          Category / تصنيف المنتج
                        </label>
                        <select
                          value={editingProduct.category || "Spread"}
                          onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                          style={{
                            height: 44,
                            padding: "0 16px",
                            borderRadius: 12,
                            border: "1px solid #E2E8F0",
                            background: "#F8FAFC",
                            fontSize: 14,
                            fontWeight: 600,
                            color: T.text,
                            outline: "none",
                          }}
                        >
                          <option value="Spread">Spread</option>
                          <option value="Snacks">Snacks</option>
                          <option value="Bakery">Bakery</option>
                          <option value="Juice">Juice</option>
                          <option value="Dairy">Dairy</option>
                          <option value="Dairy/Alts">Dairy/Alts</option>
                          <option value="Sweets">Sweets</option>
                          <option value="Nuts">Nuts</option>
                          <option value="Meals">Meals</option>
                        </select>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <label style={{ fontSize: 12, fontWeight: 800, color: T.text }}>
                          Description / الوصف العلمي والتحذيرات
                        </label>
                        <textarea
                          value={editingProduct.description || ""}
                          onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                          style={{
                            height: 80,
                            padding: "12px 16px",
                            borderRadius: 12,
                            border: "1px solid #E2E8F0",
                            background: "#F8FAFC",
                            fontSize: 13,
                            fontWeight: 500,
                            fontFamily: "inherit",
                            resize: "none",
                          }}
                        />
                      </div>

                    {/* Product Image Section (URL ONLY) */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>

                      <label style={{ fontSize: 12, fontWeight: 800, color: T.text }}>
                        📸 صورة المنتج / Product Image
                      </label>

                      <p style={{ fontSize: 11, color: T.grayDark }}>
                        أدخل رابط صورة المنتج وسيتم عرضها مباشرة
                      </p>

                      {/* ✅ Box العرض */}
                      <div
                        style={{
                          background: "#F8FAFC",
                          border: "2px dashed #CBD5E1",
                          borderRadius: "20px",
                          minHeight: "150px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {editingProduct.imageUrl ? (
                          <div
                            style={{
                              width: "100px",
                              height: "100px",
                              borderRadius: "16px",
                              overflow: "hidden",
                              border: `2px solid ${T.mint}`,
                              boxShadow: "0 6px 12px rgba(0,0,0,0.1)"
                            }}
                          >
                            <img
                              src={editingProduct.imageUrl}
                              alt="Product"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                              onError={(e) => {
                                e.currentTarget.src =
                                  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c";
                              }}
                            />
                          </div>
                        ) : (
                          <span style={{ color: "#94A3B8", fontSize: "13px" }}>
                            ضع رابط الصورة في الحقل بالأسفل 👇
                          </span>
                        )}
                      </div>

                      {/* ✅ input URL */}
                      <input
                        placeholder="https://example.com/product-image.jpg"
                        value={editingProduct.imageUrl || ""}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            imageUrl: e.target.value,
                          })
                        }
                        style={{
                          height: 38,
                          padding: "0 12px",
                          borderRadius: 10,
                          border: "1px solid #E2E8F0",
                          background: "#F8FAFC",
                          fontSize: 13,
                          fontWeight: 500,
                        }}
                      />

                      {/* ✅ زر حذف (اختياري) */}
                      {editingProduct.imageUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            setEditingProduct({
                              ...editingProduct,
                              imageUrl: "",
                            })
                          }
                          style={{
                            background: "rgba(239, 68, 68, 0.08)",
                            border: "1px solid rgba(239, 68, 68, 0.2)",
                            color: "#EF4444",
                            padding: "6px 12px",
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          حذف الصورة
                        </button>
                      )}

                    </div>

                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div
                style={{
                  padding: "24px 40px",
                  borderTop: "1px solid #F1F5F9",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={async () => {
                    const brands = editingProduct.localBrands || [];
                    for (let bIdx = 0; bIdx < brands.length; bIdx++) {
                      const brand = brands[bIdx];
                      const stores = brand.stores || [];
                      for (let sIdx = 0; sIdx < stores.length; sIdx++) {
                        const store = stores[sIdx];
                        if (
                          !store.name?.trim() ||
                          !store.location?.trim() ||
                          !(store.googleMapsUrl || store.link)?.trim()
                        ) {
                          setSelectedBrandIndex(bIdx);
                          setStoreError(
                            `الرجاء إدخال الاسم والفرع ورابط الخريطة للمتجر رقم ${sIdx + 1} التابع للعلامة "${brand.name}"`
                          );
                          return;
                        }
                      }
                    }
                    setStoreError(null);
                    try {
                      for (const brand of brands) {
                        for (const store of brand.stores || []) {
                          const url = store.googleMapsUrl || store.link || "";
                          if (store.isNew) {
                            await adminBrandsApi.addStore(brand.id, {
                              name: store.name,
                              location: store.location,
                              googleMapsUrl: url,
                            });
                          } else if (store.id) {
                            await adminBrandsApi.updateStore(brand.id, store.id, {
                              name: store.name,
                              location: store.location,
                              googleMapsUrl: url,
                              isHidden: store.isHidden || false,
                            });
                          }
                        }
                      }
                    } catch (err) {
                      console.error("Error saving stores", err);
                    }
                    onUpdateProduct(editingProduct);
                    setTimeout(reloadAdminProducts, 400);
                    setEditingProduct(null);
                    setSelectedBrandIndex(null);
                  }}
                  style={{
                    padding: "0 32px",
                    height: 50,
                    borderRadius: 14,
                    background: T.blue,
                    color: "white",
                    border: "none",
                    fontWeight: 800,
                    fontSize: 15,
                    cursor: "pointer",
                    boxShadow: `0 8px 16px ${T.blue}25`,
                  }}
                >
                  Save All Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Specialist Settings Modal Overlay */}
      <AnimatePresence>
        {editingSpecialist && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 23, 42, 0.4)",
              zIndex: 1001,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(8px)",
              padding: 24,
              direction: "rtl",
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              style={{
                background: "white",
                width: "100%",
                maxWidth: 700,
                borderRadius: 32,
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
                maxHeight: "90vh",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                color: T.text,
              }}
            >
              {/* Modal Header */}
              <div
                style={{
                  padding: "24px 32px",
                  borderBottom: "1px solid #F1F5F9",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      background: "#F0F9FF",
                      color: "#0369A1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Settings size={22} />
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <h3 style={{ fontSize: 18, fontWeight: 900, margin: 0, color: T.text }}>
                      تعديل بيانات الطبيب المختص
                    </h3>
                    <p style={{ margin: "2px 0 0 0", fontSize: 12, color: T.grayDark, fontWeight: 500 }}>
                      إدارة كافة المعلومات الشخصية، التخصص وصورة الطبيب
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingSpecialist(null)}
                  style={{
                    background: "#F1F5F9",
                    border: "none",
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: T.textMid,
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Form Content */}
              <div style={{ overflowY: "auto", padding: "32px", flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
               {/* Image Section */}
<div style={{ background: "#F8FAFC", borderRadius: 24, padding: 20, border: "1px solid #E2E8F0" }}>

  <h4 style={{ fontSize: 14, fontWeight: 900, margin: "0 0 12px 0", color: T.text, textAlign: "right" }}>
    📸 صورة الطبيب الشخصية / Doctor Photo
  </h4>

  <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", flexDirection: "row-reverse" }}>

    {/* ✅ صورة دائرية */}
    <div
      style={{
        width: 110,
        height: 110,
        borderRadius: "50%",
        overflow: "hidden",
        border: `3px solid ${T.mint}`,
        boxShadow: "0 6px 12px rgba(0,0,0,0.1)",
        background: `${T.mint}15`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 28,
      }}
    >
      {editingSpecialist.imageUrl ? (
        <img
          src={editingSpecialist.imageUrl}
          alt="Doctor"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => {
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1559839734-2b71ea197ec2";
          }}
        />
      ) : (
        "🩺"
      )}
    </div>

    {/* ✅ input URL فقط */}
    <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>

      <label style={{ fontSize: 11, fontWeight: 700, color: T.textMid, textAlign: "right" }}>
        أدخل رابط صورة الطبيب:
      </label>

      <input
        placeholder="https://example.com/doctor-avatar.jpg"
        value={editingSpecialist.imageUrl || ""}
        onChange={(e) =>
          setEditingSpecialist({
            ...editingSpecialist,
            imageUrl: e.target.value,
          })
        }
        style={{
          height: 38,
          padding: "0 12px",
          borderRadius: 10,
          border: "1px solid #E2E8F0",
          background: "white",
          fontSize: 13,
          fontWeight: 500,
          textAlign: "left",
          direction: "ltr",
        }}
      />

      {/* ✅ زر حذف (اختياري) */}
      {editingSpecialist.imageUrl && (
        <button
          type="button"
          onClick={() =>
            setEditingSpecialist({
              ...editingSpecialist,
              imageUrl: "",
            })
          }
          style={{
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            color: "#EF4444",
            padding: "6px 12px",
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          حذف الصورة
        </button>
      )}

    </div>
  </div>

  </div>

                {/* Form Fields Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, direction: "rtl" }}>
                  {/* Name field */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, textAlign: "right" }}>
                    <label style={{ fontSize: 12, fontWeight: 800, color: T.text }}>
                      اسم الطبيب الكامل *
                    </label>
                    <input
                      type="text"
                      value={editingSpecialist.name || ""}
                      onChange={(e) => setEditingSpecialist({ ...editingSpecialist, name: e.target.value })}
                      style={{
                        height: 44,
                        padding: "0 14px",
                        borderRadius: 12,
                        border: "1px solid #E2E8F0",
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    />
                  </div>

                  {/* Title field */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, textAlign: "right" }}>
                    <label style={{ fontSize: 12, fontWeight: 800, color: T.text }}>
                      التخصص الطبي / المسمى الوظيفي *
                    </label>
                    <input
                      type="text"
                      value={editingSpecialist.title || ""}
                      onChange={(e) => setEditingSpecialist({ ...editingSpecialist, title: e.target.value })}
                      style={{
                        height: 44,
                        padding: "0 14px",
                        borderRadius: 12,
                        border: "1px solid #E2E8F0",
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    />
                  </div>

                  {/* Phone field */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, textAlign: "right" }}>
                    <label style={{ fontSize: 12, fontWeight: 800, color: T.text }}>
                      رقم الهاتف والتواصل
                    </label>
                    <input
                      type="text"
                      value={editingSpecialist.phone || ""}
                      onChange={(e) => setEditingSpecialist({ ...editingSpecialist, phone: e.target.value, phoneNumber: e.target.value })}
                      style={{
                        height: 44,
                        padding: "0 14px",
                        borderRadius: 12,
                        border: "1px solid #E2E8F0",
                        fontSize: 13,
                        fontWeight: 500,
                        textAlign: "left",
                        direction: "ltr",
                      }}
                    />
                  </div>

                  {/* WhatsApp field */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, textAlign: "right" }}>
                    <label style={{ fontSize: 12, fontWeight: 800, color: T.text }}>
                      رقم الواتساب (WhatsApp)
                    </label>
                    <input
                      type="text"
                      value={editingSpecialist.whatsAppNumber || ""}
                      onChange={(e) => setEditingSpecialist({ ...editingSpecialist, whatsAppNumber: e.target.value })}
                      style={{
                        height: 44,
                        padding: "0 14px",
                        borderRadius: 12,
                        border: "1px solid #E2E8F0",
                        fontSize: 13,
                        fontWeight: 500,
                        textAlign: "left",
                        direction: "ltr",
                      }}
                    />
                  </div>

                  {/* Email field */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, textAlign: "right" }}>
                    <label style={{ fontSize: 12, fontWeight: 800, color: T.text }}>
                      عنوان البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      value={editingSpecialist.email || ""}
                      onChange={(e) => setEditingSpecialist({ ...editingSpecialist, email: e.target.value })}
                      style={{
                        height: 44,
                        padding: "0 14px",
                        borderRadius: 12,
                        border: "1px solid #E2E8F0",
                        fontSize: 13,
                        fontWeight: 500,
                        textAlign: "left",
                        direction: "ltr",
                      }}
                    />
                  </div>

                  {/* Experience field */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, textAlign: "right" }}>
                    <label style={{ fontSize: 12, fontWeight: 800, color: T.text }}>
                      سنوات الخبرة العملية
                    </label>
                    <input
                      type="number"
                      value={editingSpecialist.experienceYears || 0}
                      onChange={(e) => setEditingSpecialist({ ...editingSpecialist, experienceYears: parseInt(e.target.value) || 0 })}
                      style={{
                        height: 44,
                        padding: "0 14px",
                        borderRadius: 12,
                        border: "1px solid #E2E8F0",
                        fontSize: 13,
                        fontWeight: 500,
                      }}
                    />
                  </div>

                  

                </div>

                {/* Bio area */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6, textAlign: "right" }}>
                  <label style={{ fontSize: 12, fontWeight: 800, color: T.text }}>
                    نبذة تعريفية وسيرة ذاتية مختصرة (bio)
                  </label>
                  <textarea
                    value={editingSpecialist.bio || ""}
                    onChange={(e) => setEditingSpecialist({ ...editingSpecialist, bio: e.target.value })}
                    style={{
                      height: 80,
                      padding: "12px 16px",
                      borderRadius: 12,
                      border: "1px solid #E2E8F0",
                      fontSize: 13,
                      fontWeight: 500,
                      fontFamily: "inherit",
                      resize: "none",
                    }}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div
                style={{
                  padding: "24px 32px",
                  borderTop: "1px solid #F1F5F9",
                  background: "#F8FAFC",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 12,
                }}
              >
                <button
                  type="button"
                  onClick={() => setEditingSpecialist(null)}
                  style={{
                    padding: "0 24px",
                    height: 46,
                    borderRadius: 12,
                    background: "white",
                    color: T.textMid,
                    border: "1.5px solid #E2E8F0",
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  إلغاء الأمر
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!editingSpecialist.name?.trim() || !editingSpecialist.title?.trim()) {
                      alert("اسم الطبيب والتخصص مطلوبان بشكل إلزامي!");
                      return;
                    }
                    if (onUpdateSpecialist) {
                      onUpdateSpecialist(editingSpecialist);
                    }
                    setEditingSpecialist(null);
                  }}
                  style={{
                    padding: "0 32px",
                    height: 46,
                    borderRadius: 12,
                    background: T.blue,
                    color: "white",
                    border: "none",
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: "pointer",
                    boxShadow: `0 6px 14px ${T.blue}20`,
                  }}
                >
                  حفظ البيانات المحدثة
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Sidebar */}
      <div
        style={{
          width: 280,
          background: "white",
          borderRight: "1px solid #F1F5F9",
          padding: "40px 24px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "4px 0 24px rgba(0,0,0,0.02)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 56,
            padding: "0 8px",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: `linear-gradient(135deg, ${T.blue}, #1E40AF)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              boxShadow: `0 8px 16px ${T.blue}30`,
            }}
          >
            <Shield size={24} />
          </div>
          <div>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 900,
                color: T.text,
                letterSpacing: -0.5,
              }}
            >
              Saleem
            </h2>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: T.blue,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Admin Portal
            </div>
          </div>
        </div>

        <nav
          style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}
        >
          <SidebarItem id="dashboard" label="Overview" icon={LayoutDashboard} />
          <SidebarItem
            id="products"
            label="Product Management"
            icon={ShoppingBag}
          />
          <SidebarItem
            id="allergens"
            label="Allergy Setup"
            icon={Tag}
          />
          <SidebarItem
            id="specialists"
            label="Specialist Directory"
            icon={Users}
          />
          <SidebarItem id="users" label="User Management" icon={Shield} />
          {onSwitchToApp && (
            <button
              onClick={onSwitchToApp}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                background: "rgba(59, 130, 246, 0.08)",
                color: T.blue,
                border: "1px solid rgba(59, 130, 246, 0.15)",
                borderRadius: 14,
                cursor: "pointer",
                fontWeight: 800,
                fontSize: 13,
                marginTop: 12,
                transition: "all 0.2s ease",
              }}
              title="Browse Patient Portal / تصفح بوابة المرضى"
            >
              <ExternalLink size={18} />
              <span>Patient Portal / بوابة المرضى</span>
            </button>
          )}
        </nav>

        <button
          onClick={onLogout}
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "16px",
            background: "#FEF2F2",
            color: "#EF4444",
            border: "none",
            borderRadius: 14,
            cursor: "pointer",
            fontWeight: 800,
            fontSize: 14,
            transition: "all 0.2s ease",
          }}
        >
          <LogOut size={20} />
          <span>End Session</span>
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "48px 64px", overflowY: "auto" }}>
        <header
          style={{
            marginBottom: 56,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <div>
              <h1
                style={{
                  fontSize: 36,
                  fontWeight: 900,
                  color: T.text,
                  marginBottom: 8,
                }}
              >
                {activeTab === "dashboard"
                  ? "Main Dashboard"
                  : activeTab === "products"
                    ? "Product Inventory"
                    : activeTab === "specialists"
                      ? "Expert Management"
                      : activeTab === "allergens"
                        ? "إدارة الحساسيات / Allergens Setup"
                        : "User Management"}
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <p style={{ color: T.grayDark, fontSize: 15, fontWeight: 500 }}>
                  {activeTab === "dashboard"
                    ? "Monitor performance and platform statistics"
                    : activeTab === "products"
                      ? "Edit, add, or hide food products"
                      : activeTab === "specialists"
                        ? "Manage expert directory profiles"
                        : activeTab === "allergens"
                          ? "إضافة وتعديل أنواع الحساسية والبدائل والتوصيات الطبية"
                          : "Manage user accounts and permissions"}
                </p>
                <div
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    background: "#CBD5E1",
                  }}
                />
                <span style={{ fontSize: 12, color: T.blue, fontWeight: 700 }}>
                  Last updated: 2 minutes ago
                </span>
              </div>
            </div>
          </div>

          {activeTab !== "dashboard" && (
            <div style={{ position: "relative", width: 340 }}>
              <Search
                style={{
                  position: "absolute",
                  left: 20,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94A3B8",
                }}
                size={18}
              />
              <input
                placeholder="Search by name or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  height: 56,
                  padding: "0 20px 0 52px",
                  borderRadius: 18,
                  border: "1px solid #E2E8F0",
                  background: "white",
                  fontSize: 15,
                  fontWeight: 500,
                  outline: "none",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)",
                  transition: "all 0.3s ease",
                }}
              />
            </div>
          )}
        </header>

        <AnimatePresence mode="wait">
          {activeTab === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: 24,
                  marginBottom: 48,
                }}
              >
                <StatsCard
                  title="Total Products"
                  value={allProducts.length}
                  icon={<ShoppingBag size={28} />}
                  color={T.blue}
                />
                <StatsCard
                  title="Registered Brands"
                  value={totalBrandCount}
                  icon={<Tag size={28} />}
                  color={T.mint}
                />
                <StatsCard
                  title="Allergens Configured"
                  value={getAllAllergens(true).length}
                  icon={<Shield size={28} />}
                  color="#EF4444"
                />
                <StatsCard
                  title="Specialist Team"
                  value={allVisibleSpecialists.length}
                  icon={<Users size={28} />}
                  color="#8B5CF6"
                />
                <StatsCard
                  title="Registered Users"
                  value={dbTotalUsers ?? userCount}
                  icon={<LayoutDashboard size={28} />}
                  color="#F59E0B"
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.5fr 1fr",
                  gap: 32,
                }}
              >
                <div
                  style={{
                    background: "white",
                    padding: 40,
                    borderRadius: 32,
                    border: "1px solid #F1F5F9",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.03)",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 28,
                      flexDirection: lang === "ar" ? "row-reverse" : "row",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexDirection: lang === "ar" ? "row-reverse" : "row" }}>
                      <h3 style={{ fontSize: 20, fontWeight: 900, color: T.text, margin: 0 }}>
                        {lang === "ar" ? "سجل العمليات والنشاط المباشر" : "Live Activity Logs"}
                      </h3>
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 12,
                          fontWeight: 800,
                          color: T.mintDark,
                          background: `${T.mint}15`,
                          padding: "4px 10px",
                          borderRadius: 100,
                        }}
                      >
                        <span style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: T.mint,
                          display: "inline-block",
                          boxShadow: `0 0 8px ${T.mint}`,
                        }} />
                        {lang === "ar" ? "نشط الآن" : "Live Now"}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setShowAllActivitiesModal(true)}
                      style={{
                        padding: "8px 16px",
                        borderRadius: 12,
                        background: `${T.blue}10`,
                        color: T.blue,
                        border: "none",
                        fontSize: 13,
                        fontWeight: 800,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        display: "flex",
                        alignItems: "center",
                        gap: 6
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = `${T.blue}18`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = `${T.blue}10`;
                      }}
                    >
                      {lang === "ar" ? "عرض آخر 100 عملية" : "View Last 100 Ops"}
                    </button>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                      flex: 1
                    }}
                  >
                    {(activities || []).length > 0 ? (
                      activities.slice(0, 6).map((activity, i) => {
                        const mapped = mapActivityAction(activity.action, lang);
                        return (
                          <div
                            key={activity.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 16,
                              padding: "16px 20px",
                              borderRadius: 20,
                              background: i === 0 ? "#F8FAFC" : "#FFFFFF",
                              border: i === 0 ? `1.5px solid ${T.blue}20` : "1.5px solid #F1F5F9",
                              boxShadow: i === 0 ? `0 4px 12px ${T.blue}05` : "none",
                              flexDirection: lang === "ar" ? "row-reverse" : "row",
                              transition: "all 0.2s ease",
                            }}
                          >
                            {/* Action Icon representation */}
                            <div
                              style={{
                                width: 44,
                                height: 44,
                                borderRadius: 14,
                                background: mapped.bg,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 18,
                                flexShrink: 0
                              }}
                            >
                              {mapped.icon}
                            </div>

                            {/* Content */}
                            <div style={{ flex: 1, minWidth: 0, textAlign: lang === "ar" ? "right" : "left" }}>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  marginBottom: 4,
                                  flexDirection: lang === "ar" ? "row-reverse" : "row",
                                }}
                              >
                                <div style={{ display: "inline-flex", flexWrap: "wrap", alignItems: "center", gap: 8, flexDirection: lang === "ar" ? "row-reverse" : "row" }}>
                                  <span
                                    style={{
                                      fontSize: 12,
                                      color: mapped.color,
                                      background: `${mapped.color}15`,
                                      padding: "2px 8px",
                                      borderRadius: 6,
                                      fontWeight: 800,
                                      lineHeight: "1.4"
                                    }}
                                  >
                                    {mapped.label}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: 14,
                                      color: T.text,
                                      fontWeight: 700,
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      maxWidth: 180
                                    }}
                                  >
                                    {activity.target}
                                  </span>
                                </div>
                                
                                <span
                                  style={{
                                    fontSize: 11,
                                    color: T.grayDark,
                                    fontWeight: 600,
                                  }}
                                >
                                  {new Date(activity.timestamp).toLocaleTimeString(lang === "ar" ? "ar-EG" : "en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                              
                              <div style={{ display: "flex", alignItems: "center", gap: 4, color: T.grayDark, fontSize: 12, fontWeight: 500, justifyContent: lang === "ar" ? "flex-end" : "flex-start" }}>
                                <span style={{ opacity: 0.8 }}>
                                  {lang === "ar" ? "بواسطة المسؤول:" : "By Admin:"}
                                </span>
                                <span style={{ fontWeight: 600, color: T.text }}>
                                  {activity.userEmail}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div
                        style={{
                          textAlign: "center",
                          padding: "60px 0",
                          color: T.grayDark,
                          border: "2px dashed #E2E8F0",
                          borderRadius: 24,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 12
                        }}
                      >
                        <span style={{ fontSize: 32 }}>📋</span>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>
                          {lang === "ar" ? "لا توجد عمليات مسجلة حالياً" : "No activity registered currently"}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 32,
                  }}
                >
                  {/* Quick Allergens Overview Card */}
                  <div
                    style={{
                      background: "white",
                      padding: "36px",
                      borderRadius: 32,
                      border: "1px solid #F1F5F9",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 20,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <h3 style={{ fontSize: 18, fontWeight: 900, margin: 0, color: T.text, direction: "rtl", textAlign: "right" }}>
                        موجز الحساسيات المعتمدة
                      </h3>
                      <button
                        onClick={() => setActiveTab("allergens")}
                        style={{
                          fontSize: 12,
                          fontWeight: 800,
                          color: T.blue,
                          background: `${T.blue}08`,
                          border: "none",
                          padding: "8px 14px",
                          borderRadius: 12,
                          cursor: "pointer",
                          transition: "all 0.2s"
                        }}
                      >
                        إدارة الكل
                      </button>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 12, direction: "rtl", textAlign: "right" }}>
                      {getAllAllergens(true).slice(0, 5).map((algObj) => {
                        const isHidden = !!algObj.isHidden;
                        return (
                          <div
                            key={algObj.key}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "12px 14px",
                              background: "#F8FAFC",
                              borderRadius: 16,
                              border: "1px solid #F1F5F9",
                              opacity: isHidden ? 0.6 : 1,
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <span style={{ fontSize: 20 }}>{getAllergenEmoji(algObj.key)}</span>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>
                                  {mapAllergenName(algObj.key, lang)}
                                </div>
                                <div style={{ fontSize: 11, color: T.grayDark, fontWeight: 600 }}>
                                  {algObj.isCustom ? "حساسية مخصصة مضافة" : "حساسية قياسية معتمدة"}
                                </div>
                              </div>
                            </div>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 800,
                                padding: "4px 8px",
                                borderRadius: 8,
                                background: isHidden ? "#F1F5F9" : `${T.mint}12`,
                                color: isHidden ? "#64748B" : T.mintDark,
                              }}
                            >
                              {isHidden ? "مخفية" : "نشطة"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Polished Security Card Info */}
                  <div
                    style={{
                      background: `linear-gradient(135deg, ${T.blue}05 0%, ${T.blue}12 100%)`,
                      padding: 32,
                      borderRadius: 32,
                      border: `1.5px solid ${T.blue}15`,
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 18,
                        background: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: T.blue,
                        marginBottom: 16,
                        boxShadow: `0 10px 20px ${T.blue}15`,
                      }}
                    >
                      <Shield size={26} />
                    </div>
                    <h4 style={{ fontSize: 16, fontWeight: 900, marginBottom: 6, color: T.text }}>
                      نظام سليم الذكي الآمن
                    </h4>
                    <p style={{ color: T.grayDark, fontSize: 13, lineHeight: 1.5, margin: 0, maxWidth: 260 }}>
                      تتم كافة العمليات وفق معايير تشفير وخصوصية دقيقة لحماية بيانات صحة المستخدمين ومجتمع سليم الطبي.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "products" && (
            <motion.div
              key="products"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div
                style={{
                  background: "white",
                  padding: 40,
                  borderRadius: 32,
                  border: "1px solid #F1F5F9",
                  marginBottom: 40,
                  boxShadow: "0 20px 25px -5px rgba(0,0,0,0.02)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    marginBottom: 32,
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      background: `${T.blue}10`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: T.blue,
                    }}
                  >
                    <Plus size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 20, fontWeight: 900 }}>
                      Add New Product
                    </h3>
                    <p
                      style={{
                        fontSize: 13,
                        color: T.grayDark,
                        fontWeight: 500,
                      }}
                    >
                      Enter details for the new item to include it in the inventory
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    marginBottom: 24,
                  }}
                >
                  <label
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: T.text,
                      paddingLeft: 4,
                    }}
                  >
                    اسم المنتج / Product Name (إلزامي)
                  </label>
                  <input
                    placeholder="مثال: الشوكولاتة الداكنة العضوية"
                    value={productForm.name}
                    onChange={(e) =>
                      setProductForm({ ...productForm, name: e.target.value })
                    }
                    style={{
                      height: 56,
                      padding: "0 20px",
                      borderRadius: 16,
                      border: "1px solid #E2E8F0",
                      background: "#F8FAFC",
                      fontSize: 15,
                      fontWeight: 500,
                      width: "100%",
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    marginBottom: 24,
                  }}
                >
                  <label
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: T.text,
                      paddingLeft: 4,
                    }}
                  >
                    تصنيف المنتج / Product Category
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) =>
                      setProductForm({ ...productForm, category: e.target.value })
                    }
                    style={{
                      height: 56,
                      padding: "0 20px",
                      borderRadius: 16,
                      border: "1px solid #E2E8F0",
                      background: "#F8FAFC",
                      fontSize: 15,
                      fontWeight: 600,
                      color: T.text,
                      width: "100%",
                      outline: "none",
                    }}
                  >
                    <option value="Spread">دهون وقوابل للدهن / Spread</option>
                    <option value="Snacks">وجبات خفيفة / Snacks</option>
                    <option value="Bakery">المخبوزات والطحين / Bakery</option>
                    <option value="Juice">العصائر والمشروبات / Juice</option>
                    <option value="Dairy">منتجات الألبان والأجبان / Dairy</option>
                    <option value="Dairy/Alts">بدائل الألبان / Dairy/Alts</option>
                    <option value="Sweets">الحلويات والشوكولاتة / Sweets</option>
                    <option value="Nuts">المكسرات والحبوب / Nuts</option>
                    <option value="Meals">الوجبات الجاهزة والبدائل / Meals</option>
                  </select>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    marginBottom: 24,
                  }}
                >
                  <label
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: T.text,
                      paddingLeft: 4,
                    }}
                  >
                    الوصف التفصيلي والتحذيرات / Product Description
                  </label>
                  <textarea
                    placeholder="مثال: شوكولاتة طبيعية لا تحتوي على الحليب ولكن قد تحتوي على آثار متبقية من الفول السوداني."
                    value={productForm.description}
                    onChange={(e) =>
                      setProductForm({ ...productForm, description: e.target.value })
                    }
                    style={{
                      minHeight: 100,
                      padding: "16px 20px",
                      borderRadius: 16,
                      border: "1px solid #E2E8F0",
                      background: "#F8FAFC",
                      fontSize: 15,
                      fontWeight: 500,
                      width: "100%",
                      resize: "vertical",
                      fontFamily: "inherit",
                    }}
                  />
                </div>

                {/* Product Image (URL ONLY) */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>

                  <label style={{ fontSize: 13, fontWeight: 800, color: T.text }}>
                    📸 صورة المنتج / Product Image (إلزامي)
                  </label>

                  <p style={{ fontSize: 13, color: T.grayDark }}>
                    أدخل رابط صورة المنتج وسيتم عرضها مباشرة
                  </p>

                  {/* ✅ Box العرض */}
                  <div
                    style={{
                      background: "#F8FAFC",
                      border: "2px dashed #CBD5E1",
                      borderRadius: "20px",
                      minHeight: "180px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "20px"
                    }}
                  >
                    {productForm.imageUrl ? (
                      <div
                        style={{
                          width: "140px",
                          height: "120px",
                          borderRadius: "16px",
                          overflow: "hidden",
                          border: `2px solid ${T.mint}`,
                          boxShadow: "0 6px 12px rgba(0,0,0,0.1)"
                        }}
                      >
                        <img
                          src={productForm.imageUrl}
                          alt="Product"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover"
                          }}
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://images.unsplash.com/photo-1546069901-ba9599a7e63c";
                          }}
                        />
                      </div>
                    ) : (
                      <span style={{ color: "#94A3B8", fontSize: "14px" }}>
                        ضع رابط الصورة في الحقل بالأسفل 👇
                      </span>
                    )}
                  </div>

                  {/* ✅ input URL */}
                  <input
                    type="text"
                    placeholder="https://example.com/product-image.jpg"
                    value={productForm.imageUrl || ""}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        imageUrl: e.target.value,
                      })
                    }
                    style={{
                      height: 44,
                      padding: "0 16px",
                      borderRadius: 12,
                      border: "1px solid #E2E8F0",
                      background: "#F8FAFC",
                      fontSize: 14,
                    }}
                  />

                  {/* ✅ زر حذف */}
                  {productForm.imageUrl && (
                    <button
                      type="button"
                      onClick={() =>
                        setProductForm({
                          ...productForm,
                          imageUrl: "",
                        })
                      }
                      style={{
                        background: "rgba(239, 68, 68, 0.08)",
                        border: "1px solid rgba(239, 68, 68, 0.2)",
                        color: "#EF4444",
                        padding: "8px 12px",
                        borderRadius: 10,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        alignSelf: "flex-end"
                      }}
                    >
                      حذف الصورة
                    </button>
                  )}

                </div>

                {/* UNSUITABLE ALLERGENS FIELD */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
                  <label style={{ fontSize: 13, fontWeight: 800, color: T.text, paddingLeft: 4 }}>
                    ⚠️ مسببات الحساسية الممنوعة / Unsuitable Allergies (تحديد إلزامي)
                  </label>
                  <p style={{ fontSize: 13, color: T.grayDark, marginTop: -6 }}>
                    انقر لتحديد مسببات الحساسية التي لا يصلح لها هذا المنتج (يمنع تناولها لمن يعاني منها).
                  </p>

                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
                    gap: "12px",
                    background: "#F8FAFC",
                    padding: "20px",
                    borderRadius: "20px",
                    border: "1px solid #E2E8F0"
                  }}>
                    {getAllAllergens(true).map((item) => {
                      const key = item.key;
                      const isSelected = productForm.AllergenKey?.includes(key);
                      return (
                        <div
                          key={key}
                          onClick={() => {
                            const alreadySelected = productForm.AllergenKey?.includes(key);
                            const updated = alreadySelected
                              ? productForm.AllergenKey.filter((a: string) => a !== key)
                              : [...(productForm.AllergenKey || []), key];
                            setProductForm({ ...productForm, AllergenKey: updated });
                          }}
                          style={{
                            padding: "16px",
                            borderRadius: "14px",
                            background: isSelected ? "rgba(220, 38, 38, 0.05)" : "white",
                            border: isSelected ? `2.5px solid ${T.red}` : "1.5px solid #E2E8F0",
                            color: isSelected ? T.red : T.text,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            fontWeight: isSelected ? 800 : 600,
                            fontSize: "14px",
                            transition: "all 0.2s"
                          }}
                        >
                          <span style={{ fontSize: "18px" }}>{getAllergenEmoji(key)}</span>
                          <span>{mapAllergenName(key, lang)}</span>
                          {isSelected && (
                            <span style={{
                              marginLeft: "auto",
                              background: T.red,
                              color: "white",
                              borderRadius: "4px",
                              padding: "2px 6px",
                              fontSize: "10px"
                            }}>مُستبعد</span>
                          )}
                        </div>
                      );
                    })}

                    {/* Special allergen free choice */}
                    <div
                      onClick={() => {
                        setProductForm({ ...productForm, AllergenKey: "" });
                      }}
                      style={{
                        padding: "16px",
                        borderRadius: "14px",
                        background: (productForm.AllergenKey === "") ? "rgba(16, 185, 129, 0.05)" : "white",
                        border: (productForm.AllergenKey === "") ? `2.5px solid #10B981` : "1.5px solid #E2E8F0",
                        color: (productForm.AllergenKey === "") ? "#10B981" : T.text,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        fontWeight: (productForm.AllergenKey === "") ? 800 : 600,
                        fontSize: "14px",
                        transition: "all 0.2s",
                        gridColumn: "1 / -1",
                        textAlign: "center",
                        justifyContent: "center"
                      }}
                    >
                      <span>🍏</span>
                      <span>طبيعي بالكامل ومطابق لجميع الملفات الصحية (خالٍ من كافة مسببات الحساسية)</span>
                    </div>
                  </div>
                </div>

                <div style={{ position: "relative" }}>
                  <AnimatePresence>
                    {formError && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        style={{
                          position: "absolute",
                          top: -70,
                          left: 0,
                          right: 0,
                          background: "#FEF2F2",
                          color: "#EF4444",
                          padding: "12px 20px",
                          borderRadius: 16,
                          border: "1px solid #FEE2E2",
                          fontSize: 14,
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          boxShadow: "0 10px 25px -5px rgba(239, 68, 68, 0.15)",
                          zIndex: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            background: "#FEE2E2",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <AlertCircle size={14} />
                        </div>
                        {formError}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    onClick={() => {
                      if (!productForm.name || !productForm.name.trim()) {
                        setFormError("الرجاء تحديد اسماً للمنتج (إلزامي)");
                        return;
                      }
                      if (!productForm.imageUrl || !productForm.imageUrl.trim()) {
                        setFormError("إرفاق صورة للمنتج إلزامي - يرجى النقر على صورة من المعرض أو توفير رابط صورة مخصص");
                        return;
                      }
                    
                      onAddProduct({
                        name: productForm.name,
                        brand: productForm.brand || "Saleem Select",
                        category: productForm.category || "Spread",
                        description:
                          productForm.description ||
                          `Contains ${productForm.AllergenKey || "no common allergens."}`,

                        allergenKey:
                          productForm.AllergenKey && productForm.AllergenKey.length > 0
                            ? productForm.AllergenKey[0]
                            : "",

                        isSafe: !productForm.AllergenKey,

                        imageUrl: productForm.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
                      });
                      setTimeout(reloadAdminProducts, 400);

                      setProductForm({
                        name: "",
                        brand: "",
                        category: "Spread",
                        description: "",
                        AllergenKey: "",
                        imageUrl: "",
                        emoji: "📦",
                        vendors: [],
                      });
                    }}
                    style={{
                      width: "100%",
                      height: 60,
                      background: `linear-gradient(to right, ${T.blue}, #1E40AF)`,
                      color: "white",
                      border: "none",
                      borderRadius: 18,
                      fontWeight: 900,
                      fontSize: 16,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 12,
                      boxShadow: `0 12px 24px ${T.blue}25`,
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Plus size={22} />
                    <span>تأكيد الإضافة ومطابقة الأمان في سليم</span>
                  </button>
                </div>
              </div>

              <div
                style={{
                  background: "white",
                  borderRadius: 32,
                  overflow: "hidden",
                  border: "1px solid #F1F5F9",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)",
                }}
              >
                <div
                  style={{
                    padding: "24px 32px",
                    background: "#F8FAFC",
                    borderBottom: "1px solid #F1F5F9",
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr 1fr",
                    gap: 32,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 900,
                      color: "#64748B",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Product & Category
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 900,
                      color: "#64748B",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Allergen Type
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 900,
                      color: "#64748B",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Operational Status
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 900,
                      color: "#64748B",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      textAlign: "right",
                    }}
                  >
                    Management Actions
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  {filteredProducts.length === 0 ? (
                    <div
                      style={{
                        padding: 80,
                        textAlign: "center",
                        color: T.grayDark,
                      }}
                    >
                      <ShoppingBag
                        size={48}
                        style={{ opacity: 0.1, marginBottom: 16 }}
                      />
                      <div
                        style={{ fontWeight: 700, fontSize: 18, color: T.text }}
                      >
                        No products match your search
                      </div>
                      <p style={{ marginTop: 8 }}>
                        Try searching with other words or add a new product
                      </p>
                    </div>
                  ) : (
                    filteredProducts.map((p, idx) => {
                      const isHidden =
                        hiddenProductIds.includes(String(p.id)) || p.isHidden;
                      const isDefault = DEFAULT_PRODUCTS.some(
                        (dp) => dp.id === Number(p.id),
                      );

                      return (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          key={p.id}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "2fr 1fr 1fr 1fr",
                            alignItems: "center",
                            gap: 32,
                            padding: "24px 32px",
                            borderBottom:
                              idx === filteredProducts.length - 1
                                ? "none"
                                : "1px solid #F1F5F9",
                            background: isHidden ? "#F9FAFB" : "white",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 20,
                            }}
                          >
                            <div
                              style={{
                                width: 60,
                                height: 60,
                                borderRadius: 18,
                                background: "#F1F5F9",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 32,
                                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)",
                                overflow: "hidden",
                              }}
                            >
                              {p.imageUrl ? (
                                <img src={p.imageUrl} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} referrerPolicy="no-referrer" />
                              ) : (
                                p.emoji
                              )}
                            </div>
                            <div>
                              <div
                                style={{
                                  fontWeight: 900,
                                  fontSize: 17,
                                  color: T.text,
                                  marginBottom: 4,
                                }}
                              >
                                {p.name}
                              </div>
                              <div style={{ display: "flex", gap: 6 }}>
                                <div
                                  style={{
                                    fontSize: 12,
                                    color: T.grayDark,
                                    fontWeight: 600,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                  }}
                                >
                                  <Tag size={12} />
                                  <span>
                                    {p.brand ||
                                      (p.localBrands && p.localBrands.length > 0
                                        ? `${p.localBrands.length} Brands available`
                                        : "No brands listed")}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <span
                              style={{
                                background: `${T.red}10`,
                                color: T.red,
                                padding: "8px 16px",
                                borderRadius: 12,
                                fontSize: 12,
                                fontWeight: 800,
                                border: `1px solid ${T.red}20`,
                              }}
                            >
                              {p.AllergenKey && p.AllergenKey !== ""
                                ? mapAllergenName(p.AllergenKey, lang)
                                : ((p.allergen && mapAllergenName(p.allergen, lang)) || p.allergen || (lang === "ar" ? "آمن / لا مسببات" : "Safe / No Allergens"))}
                            </span>
                          </div>

                          <div>
                            {isHidden ? (
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 6,
                                  color: "#94A3B8",
                                  fontSize: 13,
                                  fontWeight: 800,
                                  background: "#F1F5F9",
                                  padding: "6px 14px",
                                  borderRadius: 100,
                                }}
                              >
                                <EyeOff size={14} /> Hidden
                              </span>
                            ) : (
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 6,
                                  color: T.mintDark,
                                  fontSize: 13,
                                  fontWeight: 800,
                                  background: `${T.mint}15`,
                                  padding: "6px 14px",
                                  borderRadius: 100,
                                }}
                              >
                                <Eye size={14} /> Active on Site
                              </span>
                            )}
                          </div>

                          <div
                            style={{
                              display: "flex",
                              gap: 10,
                              justifyContent: "flex-end",
                            }}
                          >
                            <button
                              onClick={() => setEditingProduct({ ...p })}
                              style={{
                                width: 44,
                                height: 44,
                                borderRadius: 14,
                                border: "1px solid #E2E8F0",
                                background: "white",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#64748B",
                                transition: "all 0.2s ease",
                              }}
                            >
                              <Settings size={18} />
                            </button>

                             <button
                              onClick={() => {
                                const prodName = p.nameAr || p.name;
                                const title = isHidden ? "تنشيط وإعادة إظهار المنتج" : "إخفاء وحجب المنتج مؤقتاً";
                                const description = isHidden
                                  ? `هل أنت متأكد من رغبتك في تنشيط وإعادة إظهار المنتج "${prodName}" لجميع مستخدمي منصة سليم وإتاحته للجميع بشكل طبيعي؟`
                                  : `هل أنت متأكد من رغبتك في إخفاء وحجب منتج "${prodName}"؟ لن يتمكن عامة المستخدمين من رؤيته أو البحث عنه حتى تقوم بتنشيطه مجدداً.`;
                                setConfirmDialog({
                                  isOpen: true,
                                  title,
                                  description,
                                  type: isHidden ? "restore" : "hide",
                                  targetLabel: prodName,
                                  onConfirm: () => { onToggleProductHide(String(p.id)); setTimeout(reloadAdminProducts, 400); }
                                });
                              }}
                              title={isHidden ? "Show" : "Hide"}
                              style={{
                                width: 44,
                                height: 44,
                                borderRadius: 14,
                                border: "1px solid #E2E8F0",
                                background: isHidden ? `${T.mint}10` : "white",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: isHidden ? T.mintDark : "#64748B",
                                transition: "all 0.2s ease",
                              }}
                            >
                              {isHidden ? (
                                <Eye size={18} />
                              ) : (
                                <EyeOff size={18} />
                              )}
                            </button>

                            <button
                              onClick={() => {
                                const prodName = p.nameAr || p.name;
                                if (!isDefault) {
                                  setConfirmDialog({
                                    isOpen: true,
                                    title: "تأكيد حذف المنتج نهائياً",
                                    description: `هل أنت متأكد من رغبتك في حذف المنتج المخصص "${prodName}" نهائياً من قاعدة البيانات الطبية لمنصة سليم؟ لا يمكن استرجاع هذا المنتج بعد الحذف.`,
                                    type: "delete",
                                    targetLabel: prodName,
                                    onConfirm: () => { onDeleteAdminProduct(p.id); setTimeout(reloadAdminProducts, 400); }
                                  });
                                } else {
                                  const title = isHidden ? "استعادة المنتج القياسي" : "إخفاء وحجب المنتج القياسي";
                                  const description = isHidden
                                    ? `هل أنت متأكد من رغبتك في إعادة تفعيل وعرض المنتج القياسي المدمج "${prodName}" في التطبيق مجدداً؟`
                                    : `هل أنت متأكد من رغبتك في إخفاء وحجب المنتج القياسي المدمج "${prodName}" وتجنب عرضه للمستخدمين بالكامل؟`;
                                  setConfirmDialog({
                                    isOpen: true,
                                    title,
                                    description,
                                    type: isHidden ? "restore" : "hide",
                                    targetLabel: prodName,
                                    onConfirm: () => { onToggleProductHide(String(p.id)); setTimeout(reloadAdminProducts, 400); }
                                  });
                                }
                              }}
                              title={
                                !isDefault
                                  ? "Permanent Delete"
                                  : isHidden
                                    ? "Restore"
                                    : "Hide"
                              }
                              style={{
                                width: 44,
                                height: 44,
                                borderRadius: 14,
                                border: "1px solid #FEE2E2",
                                background: "#FEF2F2",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#EF4444",
                                transition: "all 0.2s ease",
                              }}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "users" && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* Role filter bar */}
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                {(["all", "User", "Admin"] as const).map(role => (
                  <button
                    key={role}
                    onClick={() => setUserRoleFilter(role)}
                    style={{
                      padding: "8px 18px",
                      borderRadius: 10,
                      border: "1px solid",
                      borderColor: userRoleFilter === role ? T.blue : "#E2E8F0",
                      background: userRoleFilter === role ? `${T.blue}10` : "white",
                      color: userRoleFilter === role ? T.blue : T.grayDark,
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    {role === "all" ? "All Users" : role === "User" ? "Regular Users" : "Admins"}
                    {" "}
                    <span style={{ opacity: 0.6 }}>
                      ({(dbUsers.length > 0 ? dbUsers : allUsers || []).filter(u =>
                        role === "all" || (u.role || "").toLowerCase() === role.toLowerCase()
                      ).length})
                    </span>
                  </button>
                ))}
                {loadingUsers && (
                  <span style={{ fontSize: 12, color: T.grayDark, alignSelf: "center", marginLeft: 8 }}>
                    Loading...
                  </span>
                )}
              </div>

              <div
                style={{
                  background: "white",
                  borderRadius: 32,
                  border: "1px solid #F1F5F9",
                  overflow: "hidden",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)",
                }}
              >
                <div
                  style={{
                    padding: "24px 32px",
                    background: "#F8FAFC",
                    borderBottom: "1px solid #F1F5F9",
                    display: "grid",
                    gridTemplateColumns: "1.5fr 1fr 1fr 0.8fr",
                    gap: 32,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 900,
                      color: "#64748B",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    User
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 900,
                      color: "#64748B",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Email Address
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 900,
                      color: "#64748B",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Current Role
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 900,
                      color: "#64748B",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      textAlign: "right",
                    }}
                  >
                    Control Options
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {filteredUsers.length === 0 ? (
                    <div
                      style={{
                        padding: 80,
                        textAlign: "center",
                        color: T.grayDark,
                      }}
                    >
                      <Users
                        size={48}
                        style={{ opacity: 0.1, marginBottom: 16 }}
                      />
                      <div
                        style={{ fontWeight: 700, fontSize: 18, color: T.text }}
                      >
                        No users match your search
                      </div>
                    </div>
                  ) : (
                    filteredUsers.map((user: any, idx: number) => {
                      const currentUserEmail = localStorage.getItem("saleem_current_user") || "";
                      const isTargetMasterAdmin = (user.email || "").toLowerCase() === "admin@gmail.com";
                      const isTargetAdmin = (user.role || "").toLowerCase() === "admin";
                      const isRequesterMasterAdmin = currentUserEmail.toLowerCase() === "admin@gmail.com";

                      let canManageUser = true;
                      if (isTargetMasterAdmin) {
                        canManageUser = false;
                      } else if (!isRequesterMasterAdmin && isTargetAdmin) {
                        canManageUser = false;
                      }

                      return (
                      <div
                        key={`user-${user.id}`}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1.5fr 1fr 1fr 0.8fr",
                          alignItems: "center",
                          gap: 32,
                          padding: "24px 32px",
                          borderBottom:
                            idx === filteredUsers.length - 1
                              ? "none"
                              : "1px solid #F1F5F9",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 16,
                          }}
                        >
                          <div
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: 12,
                              background: `${T.blue}10`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: T.blue,
                              fontWeight: 800,
                              fontSize: 18,
                            }}
                          >
                            {
                            user.firstName.charAt(0).toUpperCase()
                            }
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: 15 }}>
                              {user.firstName} {user.lastName}
                            </div>
                            <div style={{ fontSize: 12, color: T.grayDark }}>
                              {user.role}
                            </div>
                          </div>
                        </div>
                        <div
                          style={{
                            fontSize: 14,
                            color: T.grayDark,
                            fontWeight: 600,
                          }}
                        >
                          {user.email}
                        </div>
                        <div>
                          <select
                            disabled={!canManageUser}
                            value={user.role || "User"}
                            onChange={(e: any) => {
                              const newRole = e.target.value;

                              if (newRole === "Admin") {
                                setConfirmAdmin(user.id);
                              } else {
                                adminUsersApi.updateRole(Number(user.id), newRole)
                                  .then(() => adminUsersApi.getAll().then(setDbUsers))
                                  .catch(console.error);
                              }
                            }}
                            style={{
                              padding: "8px 12px",
                              borderRadius: 10,
                              border: "1px solid #E2E8F0",
                              background: "white",
                              fontSize: 13,
                              fontWeight: 700,
                              cursor: "pointer",
                              outline: "none",
                            }}
                          >
                            <option value="User">Regular User</option>
                            <option value="Admin">System Admin</option>
                          </select>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 12,
                          }}
                        >
                          {canManageUser ? (
                            <>
                              <button
                                onClick={() => {
                                  setEditingUser(user.email);

                                  setUserSettingsForm({
                                    username: user.email,
                                    password: "",
                                    firstName: user.firstName || "",
                                    lastName: user.lastName || "",
                                    allergens: user.allergies || [],
                                  });

                                  setIsAuthed(false);
                                  setShowAuthPrompt(false);
                                  setShowPassword(false);
                                }}
                                style={{
                                  padding: 10,
                                  borderRadius: 10,
                                  background: "#F1F5F9",
                                  color: T.grayDark,
                                  border: "none",
                                  cursor: "pointer",
                                }}
                                title="User Settings"
                              >
                                <Settings size={16} />
                              </button>

                              <button
                                onClick={() => {
                                  const userName =
                                    user.firstName && user.lastName
                                      ? `${user.firstName} ${user.lastName}`
                                      : user.email;

                                  setConfirmDialog({
                                    isOpen: true,
                                    title: "إجراء أمني: حذف حساب المستخدم نهائياً",
                                    description: `هل أنت متأكد من حذف المستخدم "${userName}"؟`,
                                    type: "delete",
                                    targetLabel: userName,
                                    onConfirm: () => {
                                      adminUsersApi.delete(Number(user.id))
                                        .then(() => {
                                          adminUsersApi.getAll().then(setDbUsers);
                                          setAdminToast({ message: "تم حذف المستخدم بنجاح! (User deleted successfully)", type: "success" });
                                        })
                                        .catch((error) => {
                                          console.error(error);
                                          setAdminToast({ message: "حدث خطأ أثناء الحذف (Error deleting user)", type: "error" });
                                        });
                                    },
                                  });
                                }}
                                style={{
                                  padding: 10,
                                  borderRadius: 10,
                                  background: "#FEF2F2",
                                  color: "#EF4444",
                                  border: "none",
                                  cursor: "pointer",
                                }}
                                title="Delete User"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          ) : (
                            <span style={{ color: "gray", fontSize: "0.85em", padding: "4px 8px", backgroundColor: "#f0f0f0", borderRadius: "4px" }}>
                              {isTargetMasterAdmin ? "Immutable" : "Restricted"}
                            </span>
                          )}
                        </div>

                      </div>
                    );
                  })
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "specialists" && (
            <motion.div
              key="specialists"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div
                style={{
                  background: "white",
                  padding: 40,
                  borderRadius: 32,
                  border: "1px solid #F1F5F9",
                  marginBottom: 40,
                }}
              >
                <h3
                  style={{
                    fontSize: 20,
                    fontWeight: 900,
                    marginBottom: 24,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <Users size={24} style={{ color: T.blue }} />
                  Add Medical Staff or Specialist
                </h3>
                {/* Row 1: Basic Bio details */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr 1fr",
                    gap: 20,
                    marginBottom: 20,
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <label style={{ fontSize: 13, fontWeight: 800, color: T.text }}>
                      Full Name / الاسم الكامل <span style={{ color: "red" }}>*</span>
                    </label>
                    <input
                      placeholder="Dr. Sarah Ahmed"
                      value={specialistForm.name}
                      onChange={(e) =>
                        setSpecialistForm({
                          ...specialistForm,
                          name: e.target.value,
                        })
                      }
                      style={{
                        height: 50,
                        padding: "0 16px",
                        borderRadius: 12,
                        border: "1px solid #E2E8F0",
                        background: "#F8FAFC",
                        fontSize: 14,
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <label style={{ fontSize: 13, fontWeight: 800, color: T.text }}>
                      Specialty / التخصص الطبي <span style={{ color: "red" }}>*</span>
                    </label>
                    <input
                      placeholder="Consultant in Allergy"
                      value={specialistForm.title}
                      onChange={(e) =>
                        setSpecialistForm({
                          ...specialistForm,
                          title: e.target.value,
                        })
                      }
                      style={{
                        height: 50,
                        padding: "0 16px",
                        borderRadius: 12,
                        border: "1px solid #E2E8F0",
                        background: "#F8FAFC",
                        fontSize: 14,
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <label style={{ fontSize: 13, fontWeight: 800, color: T.text }}>
                      Phone / رقم الهاتف <span style={{ color: "red" }}>*</span>
                    </label>
                    <input
                      placeholder="079XXXXXXX"
                      value={specialistForm.phone}
                      onChange={(e) =>
                        setSpecialistForm({
                          ...specialistForm,
                          phone: e.target.value,
                        })
                      }
                      style={{
                        height: 50,
                        padding: "0 16px",
                        borderRadius: 12,
                        border: "1px solid #E2E8F0",
                        background: "#F8FAFC",
                        fontSize: 14,
                        textAlign: "left",
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <label style={{ fontSize: 13, fontWeight: 800, color: T.text }}>
                      Email / البريد الإلكتروني <span style={{ color: "red" }}>*</span>
                    </label>
                    <input
                      placeholder="doctor@example.com"
                      value={specialistForm.email}
                      onChange={(e) =>
                        setSpecialistForm({
                          ...specialistForm,
                          email: e.target.value,
                        })
                      }
                      style={{
                        height: 50,
                        padding: "0 16px",
                        borderRadius: 12,
                        border: "1px solid #E2E8F0",
                        background: "#F8FAFC",
                        fontSize: 14,
                      }}
                    />
                  </div>
                </div>

                {/* Row 2: Secondary specifications */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr 1fr",
                    gap: 20,
                    marginBottom: 20,
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <label style={{ fontSize: 13, fontWeight: 800, color: T.text }}>
                      WhatsApp Number / رقم الواتساب
                    </label>
                    <input
                      placeholder="9627XXXXXXXX"
                      value={specialistForm.whatsAppNumber}
                      onChange={(e) =>
                        setSpecialistForm({
                          ...specialistForm,
                          whatsAppNumber: e.target.value,
                        })
                      }
                      style={{
                        height: 50,
                        padding: "0 16px",
                        borderRadius: 12,
                        border: "1px solid #E2E8F0",
                        background: "#F8FAFC",
                        fontSize: 14,
                        textAlign: "left",
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <label style={{ fontSize: 13, fontWeight: 800, color: T.text }}>
                      Experience (Years) / سنوات الخبرة
                    </label>
                    <input
                      type="number"
                      placeholder="8"
                      value={specialistForm.experienceYears}
                      onChange={(e) =>
                        setSpecialistForm({
                          ...specialistForm,
                          experienceYears: parseInt(e.target.value) || 0,
                        })
                      }
                      style={{
                        height: 50,
                        padding: "0 16px",
                        borderRadius: 12,
                        border: "1px solid #E2E8F0",
                        background: "#F8FAFC",
                        fontSize: 14,
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <label style={{ fontSize: 13, fontWeight: 800, color: T.text }}>
                      Rating / التقييم (من 5.0)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="4.8"
                      value={specialistForm.rating}
                      onChange={(e) =>
                        setSpecialistForm({
                          ...specialistForm,
                          rating: parseFloat(e.target.value) || 0,
                        })
                      }
                      style={{
                        height: 50,
                        padding: "0 16px",
                        borderRadius: 12,
                        border: "1px solid #E2E8F0",
                        background: "#F8FAFC",
                        fontSize: 14,
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <label style={{ fontSize: 13, fontWeight: 800, color: T.text }}>
                      Reviews Count / عدد التقييمات
                    </label>
                    <input
                      type="number"
                      placeholder="25"
                      value={specialistForm.reviewsCount}
                      onChange={(e) =>
                        setSpecialistForm({
                          ...specialistForm,
                          reviewsCount: parseInt(e.target.value) || 0,
                        })
                      }
                      style={{
                        height: 50,
                        padding: "0 16px",
                        borderRadius: 12,
                        border: "1px solid #E2E8F0",
                        background: "#F8FAFC",
                        fontSize: 14,
                      }}
                    />
                  </div>
                </div>

                {/* IMAGE FROM URL ONLY */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>

                  <label style={{ fontSize: 13, fontWeight: 800, color: T.text, paddingLeft: 4 }}>
                    📸 صورة الطبيب / Doctor Photo (إلزامي)
                  </label>

                  <p style={{ fontSize: 13, color: T.grayDark, marginTop: -6 }}>
                    أدخل رابط صورة الطبيب وسيتم عرضها مباشرة في الأسفل
                  </p>

                  {/* ✅ مربع عرض الصورة */}
                  <div
                    style={{
                      background: "#F8FAFC",
                      border: "2px dashed #CBD5E1",
                      borderRadius: "20px",
                      minHeight: "180px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      padding: "10px"
                    }}
                  >
                    {specialistForm.imageUrl ? (
                      <img
                        src={specialistForm.imageUrl}
                        alt="Doctor"
                        style={{
                          width: "120px",
                          height: "120px",
                          objectFit: "cover",
                          borderRadius: "16px"
                        }}
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://images.unsplash.com/photo-1559839734-2b71ea197ec2";
                        }}
                      />
                    ) : (
                      <span style={{ color: "#94A3B8", fontSize: "14px" }}>
                        ضع رابط الصورة في الحقل بالأسفل 👇
                      </span>
                    )}
                  </div>

                  {/* ✅ input URL */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: T.textMid }}>
                      رابط الصورة (Image URL)
                    </label>

                    <input
                      placeholder="https://example.com/doctor-photo.jpg"
                      value={specialistForm.imageUrl || ""}
                      onChange={(e) =>
                        setSpecialistForm({
                          ...specialistForm,
                          imageUrl: e.target.value,
                        })
                      }
                      style={{
                        height: 44,
                        padding: "0 16px",
                        borderRadius: 12,
                        border: "1px solid #E2E8F0",
                        background: "#F8FAFC",
                        fontSize: 13,
                      }}
                    />
                  </div>

                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    marginBottom: 32,
                  }}
                >
                  <label
                    style={{ fontSize: 13, fontWeight: 800, color: T.text }}
                  >
                    Short Bio
                  </label>
                  <textarea
                    placeholder="Write here qualifications and years of experience..."
                    value={specialistForm.bio}
                    onChange={(e) =>
                      setSpecialistForm({
                        ...specialistForm,
                        bio: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "20px",
                      borderRadius: 16,
                      border: "1px solid #E2E8F0",
                      height: 120,
                      background: "#F8FAFC",
                      fontFamily: "inherit",
                      resize: "none",
                      fontSize: 15,
                      lineHeight: 1.6,
                    }}
                  />
                </div>
                <div style={{ position: "relative" }}>
                  <AnimatePresence>
                    {formError && activeTab === "specialists" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        style={{
                          position: "absolute",
                          top: -70,
                          left: 0,
                          right: 0,
                          background: "#FEF2F2",
                          color: "#EF4444",
                          padding: "12px 20px",
                          borderRadius: 16,
                          border: "1px solid #FEE2E2",
                          fontSize: 14,
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          boxShadow: "0 10px 25px -5px rgba(239, 68, 68, 0.15)",
                          zIndex: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            background: "#FEE2E2",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <AlertCircle size={14} />
                        </div>
                        {formError}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    onClick={() => {
                      const nameVal = (specialistForm.name || "").trim();
                      const titleVal = (specialistForm.title || "").trim();
                      const phoneVal = (specialistForm.phone || "").trim();
                      const emailVal = (specialistForm.email || "").trim();
                      const bioVal = (specialistForm.bio || "").trim();

                      const allEmpty = !nameVal && !titleVal && !phoneVal && !emailVal && !bioVal;

                      if (allEmpty) {
                        setFormError("يرجى إدخال البيانات كاملة؛ كافة حقول ملف الطبيب مطلوبة قبل الإضافة!");
                        return;
                      }

                      const missingFields: string[] = [];
                      if (!nameVal) missingFields.push("الاسم الكامل");
                      if (!titleVal) missingFields.push("التخصص الطبي");
                      if (!phoneVal) missingFields.push("رقم الهاتف");
                      if (!emailVal) missingFields.push("البريد الإلكتروني");
                      if (!bioVal) missingFields.push("النبذة التعريفية (السيرة الذاتية)");

                      if (missingFields.length > 0) {
                        setFormError(
                          `يرجى إضافة المعلومات التي لم تضفها بعد لإكمال بيانات الطبيب: ${missingFields.join("، ")}`
                        );
                        return;
                      }

                      setFormError(null);
                      onAddSpecialist({ 
                        id: Date.now(), 
                        ...specialistForm,
                        phoneNumber: specialistForm.phone,
                      });
                      setSpecialistForm({
                        name: "",
                        title: "",
                        email: "",
                        bio: "",
                        phone: "",
                        whatsAppNumber: "",
                        experienceYears: 8,
                        rating: 4.8,
                        reviewsCount: 25,
                        hours: "9:00 AM - 5:00 PM",
                        price: "JD 20",
                        imageUrl: "",
                      });
                    }}
                    style={{
                      width: "100%",
                      height: 60,
                      background: T.blue,
                      color: "white",
                      border: "none",
                      borderRadius: 18,
                      fontWeight: 900,
                      cursor: "pointer",
                      fontSize: 16,
                      boxShadow: `0 12px 24px ${T.blue}25`,
                      transition: "all 0.2s ease",
                    }}
                  >
                    Save to Specialist Files
                  </button>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: 28,
                }}
              >
                {filteredSpecialists.map((s) => {
                  const isHidden = false;
                  return (
                    <motion.div
                      whileHover={{ y: -5 }}
                      key={s.id}
                      style={{
                        background: "white",
                        padding: 32,
                        borderRadius: 28,
                        border: "1px solid #F1F5F9",
                        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)",
                        opacity: 1,
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 20,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 16,
                          }}
                        >
                          <div
                            style={{
                              width: 52,
                              height: 52,
                              borderRadius: 100,
                              background: `${T.blue}10`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: T.blue,
                              fontSize: 22,
                              fontWeight: 900,
                              overflow: "hidden",
                            }}
                          >
                            {s.imageUrl ? (
                              <img src={s.imageUrl} alt={s.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} referrerPolicy="no-referrer" />
                            ) : (
                              s.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <div
                              style={{
                                fontWeight: 900,
                                fontSize: 18,
                                color: T.text,
                                marginBottom: 2,
                              }}
                            >
                              {s.name}
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                flexWrap: "wrap",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: 13,
                                  color: T.blue,
                                  fontWeight: 700,
                                }}
                              >
                                {s.title}
                              </div>
                              {s.phone && (
                                <>
                                  <div
                                    style={{
                                      width: 4,
                                      height: 4,
                                      borderRadius: "50%",
                                      background: "#CBD5E1",
                                    }}
                                  />
                                  <div
                                    style={{
                                      fontSize: 12,
                                      color: T.mintDark,
                                      fontWeight: 700,
                                      direction: "ltr",
                                    }}
                                  >
                                    {s.phone}
                                  </div>
                                </>
                              )}
                              {s.email && (
                                <>
                                  <div
                                    style={{
                                      width: 4,
                                      height: 4,
                                      borderRadius: "50%",
                                      background: "#CBD5E1",
                                    }}
                                  />
                                  <div
                                    style={{
                                      fontSize: 12,
                                      color: T.grayDark,
                                      fontWeight: 600,
                                    }}
                                  >
                                    {s.email}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            onClick={() => {
                              setEditingSpecialist({
                                ...s,
                                phone: s.phone || s.phoneNumber || "",
                                phoneNumber: s.phone || s.phoneNumber || "",
                                email: s.email || "",
                                whatsAppNumber: s.whatsAppNumber || s.phone || "",
                                hours: s.hours || "9:00 AM - 5:00 PM",
                                price: s.price || "JD 20",
                                experienceYears: s.experienceYears || s.experience || 8,
                                rating: s.rating || 4.8,
                                reviewsCount: s.reviewsCount || s.reviews || 25,
                              });
                            }}
                            title="تعديل بيانات الطبيب"
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 12,
                              border: "none",
                              background: "#F0F9FF",
                              color: "#0369A1",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "all 0.2s ease",
                            }}
                          >
                            <Settings size={16} />
                          </button>
                          <button
                            onClick={() => {
                              const doctorName = s.name;
                              setConfirmDialog({
                                isOpen: true,
                                title: "⚠️ حذف ملف الطبيب نهائياً",
                                description: `هل أنت متأكد تماماً من رغبتك في حذف بيانات الطبيب "${doctorName}" نهائياً وبشكل لا يمكن التراجع عنه من قاعدة بيانات الفريق الطبي لسليم؟`,
                                type: "delete",
                                targetLabel: doctorName,
                                onConfirm: () => onDeleteAdminSpecialist(s.id)
                              });
                            }}
                            style={{
                              color: "#EF4444",
                              background: "#FEF2F2",
                              border: "none",
                              width: 40,
                              height: 40,
                              borderRadius: 12,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "all 0.2s ease",
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <p
                        style={{
                          fontSize: 14,
                          color: T.grayDark,
                          lineHeight: 1.7,
                          fontWeight: 500,
                        }}
                      >
                        {s.bio}
                      </p>
                      {isHidden && (
                        <div
                          style={{
                            marginTop: 16,
                            fontSize: 11,
                            fontWeight: 800,
                            color: "#94A3B8",
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                          }}
                        >
                          Currently hidden from the site
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeTab === "allergens" && (
            <motion.div
              key="allergens"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{ direction: "rtl", textAlign: "right" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 32,
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 900, color: T.text, marginBottom: 4 }}>
                    لوحة التحكم بمسببات الحساسية
                  </h2>
                  <p style={{ fontSize: 13, color: T.grayDark, fontWeight: 500 }}>
                    إضافة أنواع حساسية مخصصة، تعديل المظاهر والبدائل، أو إخفاء مسببات الحساسية من التطبيق.
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (isAddingAllergy) {
                      // Reset and close
                      setIsAddingAllergy(false);
                      setEditingAllergen(null);
                      setAllergyName("");
                      setAllergyType("حساسية غذائية");
                      setAllergyEmoji("🥛");
                      setAllergySymptoms("");
                      setAllergyAvoidFoods("");
                      setAllergySafeFoods("");
                      setAllergyPrevention("");
                      setAllergyDescription("");
                      setAllergyError(null);
                    } else {
                      setIsAddingAllergy(true);
                      setEditingAllergen(null);
                    }
                  }}
                  style={{
                    background: isAddingAllergy ? "#F1F5F9" : T.blue,
                    color: isAddingAllergy ? T.text : "white",
                    border: "none",
                    borderRadius: 16,
                    padding: "16px 28px",
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontSize: 14,
                    boxShadow: isAddingAllergy ? "none" : `0 8px 16px ${T.blue}20`,
                    transition: "all 0.2s ease",
                  }}
                >
                  {isAddingAllergy ? (
                    <>
                      <X size={18} />
                      <span>إلغاء الإجراء</span>
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      <span>إضافة حساسية جديدة</span>
                    </>
                  )}
                </button>
              </div>

              {/* Form to Add / Edit Allergen */}
              {isAddingAllergy && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  style={{
                    background: "white",
                    borderRadius: 24,
                    border: `1.5px solid ${T.blue}15`,
                    padding: 32,
                    marginBottom: 36,
                    boxShadow: "0 10px 30px -10px rgba(0,0,0,0.04)",
                    overflow: "hidden"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: `${T.blue}10`,
                      color: T.blue,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22
                    }}>
                      {allergyEmoji}
                    </div>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 900, color: T.text, margin: 0 }}>
                        {editingAllergen ? "تعديل معلومات الحساسية" : "إنشاء مسبب حساسية مخصص جديد"}
                      </h3>
                      <p style={{ fontSize: 12, color: T.grayDark, margin: 0 }}>
                        يرجى تعبئة كافة التفاصيل لضمان توافق الحساسية مع فلاتر السلامة الطبية.
                      </p>
                    </div>
                  </div>

                  {allergyError && (
                    <div style={{
                      background: "#FEF2F2",
                      border: "1px solid #FEE2E2",
                      color: "#EF4444",
                      padding: "16px",
                      borderRadius: 16,
                      fontSize: 14,
                      fontWeight: 700,
                      marginBottom: 24,
                      display: "flex",
                      alignItems: "center",
                      gap: 10
                    }}>
                      <AlertCircle size={18} />
                      <span>{allergyError}</span>
                    </div>
                  )}

                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
                    {/* Name */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <label style={{ fontSize: 13, fontWeight: 800, color: T.text }}>
                        اسم الحساسية (باللغة العربية والاسم العادي) *
                      </label>
                      <input
                        type="text"
                        placeholder="مثال: حساسية الفراولة أو Strawberry Allergy"
                        value={allergyName}
                        onChange={(e) => setAllergyName(e.target.value)}
                        disabled={!!editingAllergen} // Keep key stable if editing
                        style={{
                          height: 52,
                          borderRadius: 14,
                          border: "1.5px solid #E2E8F0",
                          padding: "0 16px",
                          fontSize: 14,
                          background: editingAllergen ? "#F1F5F9" : "white",
                          fontWeight: 600,
                          color: T.text
                        }}
                      />
                    </div>
                  </div>

                  {/* Icon Selection Grid */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
                    <label style={{ fontSize: 13, fontWeight: 800, color: T.text }}>
                      اختر الأيقونة / الإيموجي المناسب للحساسية *
                    </label>
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(48px, 1fr))",
                      gap: 8,
                      background: "#F8FAFC",
                      padding: 16,
                      borderRadius: 16,
                      border: "1px solid #E2E8F0"
                    }}>
                      {[
                        "🥛", "🥜", "🌾", "🥚", "🐟", "🫘", "🌰", "🦐", "🌿", "🌼",
                        "🍎", "🍓", "🍉", "🍒", "🍑", "🍊", "🍋", "🍌", "🥕", "🧅",
                        "🧄", "🥩", "🍗", "🥑", "🧀", "🍞", "🍦", "🍫", "🍯", "🍔",
                        "🍕", "🍪", "🥥", "🍿", "🧪", "💨", "🐈", "🐕", "🪴", "🩹"
                      ].map((icon) => (
                        <button
                          key={icon}
                          onClick={() => setAllergyEmoji(icon)}
                          style={{
                            height: 44,
                            width: 44,
                            borderRadius: 10,
                            border: allergyEmoji === icon ? `2px solid ${T.blue}` : "1px solid #E2E8F0",
                            background: allergyEmoji === icon ? "white" : "transparent",
                            fontSize: 20,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: allergyEmoji === icon ? "0 4px 6px -1px rgba(0,0,0,0.05)" : "none",
                            transition: "all 0.15s"
                          }}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
                    <label style={{ fontSize: 13, fontWeight: 800, color: T.text }}>
                      وصف عام عن الحساسية ومسبباتها *
                    </label>
                    <textarea
                      placeholder="صف هنا بشكل مختصر طبيعة هذه الحساسية لمساعدة سليم..."
                      value={allergyDescription}
                      onChange={(e) => setAllergyDescription(e.target.value)}
                      style={{
                        height: 90,
                        borderRadius: 14,
                        border: "1.5px solid #E2E8F0",
                        padding: 16,
                        fontSize: 14,
                        background: "white",
                        fontFamily: "inherit",
                        resize: "none"
                      }}
                    />
                  </div>

                  {/* Symptoms & Physical manifestations */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
                    <label style={{ fontSize: 13, fontWeight: 800, color: T.text }}>
                      أبرز الأعراض والمظاهر الجسدية المرافقة *
                    </label>
                    <textarea
                      placeholder="مثال: طفح جلدي، حكة، صعوبة بالتنفس، انتفاخ الشفاه والجفون..."
                      value={allergySymptoms}
                      onChange={(e) => setAllergySymptoms(e.target.value)}
                      style={{
                        height: 90,
                        borderRadius: 14,
                        border: "1.5px solid #E2E8F0",
                        padding: 16,
                        fontSize: 14,
                        background: "white",
                        fontFamily: "inherit",
                        resize: "none"
                      }}
                    />
                  </div>

                  {/* Avoid Foods & Safe Foods */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <label style={{ fontSize: 13, fontWeight: 800, color: T.text }}>
                        مصادر وأطعمة ممنوعة (افصل بينهم بفاصلة) *
                      </label>
                      <input
                        type="text"
                        placeholder="مثال: مربى الفراولة، عصير الفراولة، الحلويات بنكهة الفراولة"
                        value={allergyAvoidFoods}
                        onChange={(e) => setAllergyAvoidFoods(e.target.value)}
                        style={{
                          height: 52,
                          borderRadius: 14,
                          border: "1.5px solid #E2E8F0",
                          padding: "0 16px",
                          fontSize: 14,
                          background: "white",
                          fontWeight: 600,
                          color: T.text
                        }}
                      />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <label style={{ fontSize: 13, fontWeight: 800, color: T.text }}>
                        بدائل غذائية وطبيعية آمنة (افصل بينهم بفاصلة) *
                      </label>
                      <input
                        type="text"
                        placeholder="مثال: التوت الأزرق، الكرز، العنب الأحمر الآمن"
                        value={allergySafeFoods}
                        onChange={(e) => setAllergySafeFoods(e.target.value)}
                        style={{
                          height: 52,
                          borderRadius: 14,
                          border: "1.5px solid #E2E8F0",
                          padding: "0 16px",
                          fontSize: 14,
                          background: "white",
                          fontWeight: 600,
                          color: T.text
                        }}
                      />
                    </div>
                  </div>

                  {/* Saleem medical team recommendation */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 32 }}>
                    <label style={{ fontSize: 13, fontWeight: 800, color: T.text }}>
                      توصية فريق سليم الطبي للمريض للتعامل معها *
                    </label>
                    <textarea
                      placeholder="مثال: ينصح دائماً بقراءة بطاقة المكونات في المشروبات الطازجة، وتجنب منتجات الفواكه المصنعة غير الموثوقة..."
                      value={allergyPrevention}
                      onChange={(e) => setAllergyPrevention(e.target.value)}
                      style={{
                        height: 90,
                        borderRadius: 14,
                        border: "1.5px solid #E2E8F0",
                        padding: 16,
                        fontSize: 14,
                        background: "white",
                        fontFamily: "inherit",
                        resize: "none"
                      }}
                    />
                  </div>

                  {/* Save buttons */}
                  <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                    <button
                      onClick={() => {
                        setIsAddingAllergy(false);
                        setEditingAllergen(null);
                        setAllergyError(null);
                      }}
                      style={{
                        height: 52,
                        borderRadius: 14,
                        background: "#F1F5F9",
                        color: T.text,
                        border: "none",
                        padding: "0 24px",
                        fontSize: 14,
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                    >
                      إلغاء التعديل
                    </button>
                    <button
                      onClick={() => {
                        const nameTrimmed = allergyName.trim();
                        const descTrimmed = allergyDescription.trim();
                        const symTrimmed = allergySymptoms.trim();
                        const prevTrimmed = allergyPrevention.trim();

                        if (!nameTrimmed || !descTrimmed || !symTrimmed || !prevTrimmed || !allergyAvoidFoods.trim() || !allergySafeFoods.trim()) {
                          setAllergyError("الرجاء إدخال كافة المعلومات المطلوبة وتعبئتها بشكل صحيح، لا يسمح بترك حقل فارغ.");
                          return;
                        }

                        const avoidList = allergyAvoidFoods
                          .split(/[،,]/)
                          .map((x) => x.trim())
                          .filter(Boolean);

                        const safeList = allergySafeFoods
                          .split(/[،,]/)
                          .map((x) => x.trim())
                          .filter(Boolean);

                        const allergenData: any = {
                          key: nameTrimmed,
                          name: nameTrimmed,
                          type: allergyType,
                          emoji: allergyEmoji,
                          description: descTrimmed,
                          symptoms: symTrimmed,
                          avoidFoods: avoidList,
                          safeFoods: safeList,
                          prevention: prevTrimmed,
                          isHidden: editingAllergen ? editingAllergen.isHidden : false,
                          isCustom: true
                        };

                        saveOrUpdateCustomAllergen(allergenData);

                        if (onLogActivity) {
                          onLogActivity(
                            editingAllergen ? "Update Allergen" : "Add Allergen",
                            nameTrimmed
                          );
                        }

                        // Reload list
                        setCustomAllergens(getCustomAllergens());
                        setIsAddingAllergy(false);
                        setEditingAllergen(null);
                        setAllergyName("");
                        setAllergyType("حساسية غذائية");
                        setAllergyEmoji("🥛");
                        setAllergySymptoms("");
                        setAllergyAvoidFoods("");
                        setAllergySafeFoods("");
                        setAllergyPrevention("");
                        setAllergyDescription("");
                        setAllergyError(null);
                      }}
                      style={{
                        height: 52,
                        borderRadius: 14,
                        background: T.blue,
                        color: "white",
                        border: "none",
                        padding: "0 32px",
                        fontSize: 14,
                        fontWeight: 800,
                        cursor: "pointer",
                        boxShadow: `0 8px 16px ${T.blue}25`,
                      }}
                    >
                      حفظ التغييرات وتأكيد الحساسية
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Directory display */}
              <div
                style={{
                  background: "white",
                  borderRadius: 32,
                  border: "1px solid #F1F5F9",
                  padding: 32,
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.01)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, gap: 12, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 4.5, height: 16, background: T.blue, borderRadius: 2 }} />
                    <h3 style={{ fontSize: 17, fontWeight: 900, color: T.text, margin: 0 }}>
                      دليل مسببات الحساسية المدمجة والمضافة ({getAllAllergens(true).length})
                    </h3>
                  </div>
                </div>

                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))",
                  gap: 16
                }}>
                  {getAllAllergens(true).map((item) => {
                    const details = getAllergyDetails(item.key, lang);
                    if (!details) return null;

                    const isHidden = !!details.isHidden;
                    const isCustom = !!details.isCustom;

                    return (
                      <motion.div
                        key={item.key}
                        layout
                        style={{
                          background: "#F8FAFC",
                          border: isHidden ? "1px dashed #CBD5E1" : "1.5px solid #F1F5F9",
                          borderRadius: 20,
                          padding: 24,
                          display: "flex",
                          flexDirection: "column",
                          gap: 12,
                          opacity: isHidden ? 0.6 : 1,
                          transition: "all 0.2s"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: 26 }}>{details.emoji}</span>
                            <div>
                              <h4 style={{ fontSize: 15, fontWeight: 900, color: T.text, margin: 0 }}>
                                {mapAllergenName(item.key, lang)}
                              </h4>
                              <p style={{ fontSize: 11, color: isCustom ? T.blue : "#64748B", margin: 0, fontWeight: 700 }}>
                                {isCustom ? "حساسية مضافة مخصصة" : "حساسية قياسية مدمجة"}
                              </p>
                            </div>
                          </div>

                          <div style={{ display: "flex", gap: 6 }}>
                            {/* Hide/Show Toggle */}
                            <button
                              onClick={() => {
                                const allergenNameAr = mapAllergenName(item.key, lang) || item.key;
                                const question = isHidden 
                                  ? `🔔 تأكيد تنشيط: هل أنت متأكد من رغبتك في إظهار حساسية "${allergenNameAr}" مجدداً وتفعيلها لجميع المستخدمين في المنصة وموسوعة سليم؟`
                                  : `🔒 تأكيد تعطيل/إخفاء: هل أنت متأكد من رغبتك في إخفاء حساسية "${allergenNameAr}"؟ لن يتمكن المستخدمون من اختيارها في ملفاتهم الشخصية مؤقتاً.`;
                                setConfirmDialog({
                                  isOpen: true,
                                  title: isHidden ? "إظهار حساسية في التطبيق" : "إخفاء حساسية من التطبيق",
                                  description: question,
                                  type: "hide",
                                  targetLabel: allergenNameAr,
                                  onConfirm: () => {
                                    toggleAllergenVisibility(item.key);
                                    setCustomAllergens(getCustomAllergens());
                                    if (onLogActivity) {
                                      onLogActivity("Toggle Allergen Visibility", `${allergenNameAr} (${isHidden ? "Show" : "Hide"})`);
                                    }
                                  }
                                });
                              }}
                              style={{
                                width: 38,
                                height: 38,
                                borderRadius: 10,
                                border: "none",
                                background: isHidden ? `${T.red}10` : "#E2E8F0",
                                color: isHidden ? T.red : T.text,
                                display: "flex",
                                cursor: "pointer"
                              }}
                              title={isHidden ? "إظهار في التطبيق" : "إخفاء من التطبيق"}
                            >
                              <span style={{ margin: "auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
                              </span>
                            </button>

                            {/* Cog settings icon */}
                            <button
                              onClick={() => {
                                setEditingAllergen(details);
                                setAllergyName(details.name || item.key);
                                setAllergyType(details.type || "حساسية غذائية");
                                setAllergyEmoji(details.emoji);
                                setAllergySymptoms(details.symptoms || "");
                                setAllergyAvoidFoods((details.avoidFoods || []).join("، "));
                                setAllergySafeFoods((details.safeFoods || []).join("، "));
                                setAllergyPrevention(details.prevention || "");
                                setAllergyDescription(details.description || "");
                                setIsAddingAllergy(true);
                                window.scrollTo({ top: 120, behavior: "smooth" });
                              }}
                              style={{
                                width: 38,
                                height: 38,
                                borderRadius: 10,
                                border: "none",
                                background: "#E2E8F0",
                                color: T.text,
                                display: "flex",
                                cursor: "pointer"
                              }}
                              title="تعديل كافة المعلومات"
                            >
                              <span style={{ margin: "auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Settings size={16} />
                              </span>
                            </button>

                            {/* Trash button for all allergens */}
                            <button
                              onClick={() => {
                                const allergenNameAr = mapAllergenName(item.key, lang) || item.key;
                                setConfirmDialog({
                                  isOpen: true,
                                  title: "⚠️ حذف حساسية نهائياً",
                                  description: `هل أنت متأكد تماماً من رغبتك في حذف حساسية "${allergenNameAr}" نهائياً وبشكل قطعي من النظام الأساسي لمنصة سليم؟ سيتم إزالة هذا التصنيف وتعطيل جميع الفحوصات والقيود المرتبطة بها.`,
                                  type: "delete",
                                  targetLabel: allergenNameAr,
                                  onConfirm: () => {
                                    deleteAllergen(item.key);
                                    setCustomAllergens(getCustomAllergens());
                                    if (onLogActivity) {
                                      onLogActivity("Delete Allergen", allergenNameAr);
                                    }
                                  }
                                });
                              }}
                              style={{
                                width: 38,
                                height: 38,
                                borderRadius: 10,
                                border: "none",
                                background: "#FEF2F2",
                                color: T.red,
                                display: "flex",
                                cursor: "pointer"
                              }}
                              title="حذف بالكامل"
                            >
                              <span style={{ margin: "auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Trash2 size={16} />
                              </span>
                            </button>
                          </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "8px 0", borderTop: "1px solid #F1F5F9" }}>
                          <p style={{ fontSize: 13, color: T.text, margin: 0, lineHeight: 1.6 }}>
                            <strong>الأعراض: </strong>{details.symptoms || "غير محددة"}
                          </p>
                          <p style={{ fontSize: 13, color: T.text, margin: 0, lineHeight: 1.6 }}>
                            <strong>الممنوعات: </strong>{(details.avoidFoods || []).join("، ") || "غير محددة"}
                          </p>
                          <p style={{ fontSize: 13, color: T.text, margin: 0, lineHeight: 1.6 }}>
                            <strong>البدائل الآمنة: </strong>{(details.safeFoods || []).join("، ") || "غير محددة"}
                          </p>
                          {details.prevention && (
                            <p style={{ fontSize: 12, color: T.mintDark, margin: 0, lineHeight: 1.5, background: `${T.mint}08`, padding: "8px 12px", borderRadius: 10, border: `1px solid ${T.mint}15`, marginTop: 6 }}>
                              <strong>توصية فريق سليم الطبي: </strong>{details.prevention}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* User Settings Modal */}
        <AnimatePresence>
          {editingUser && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(15, 23, 42, 0.4)",
                zIndex: 3000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(8px)",
                padding: 24,
              }}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                style={{
                  background: "white",
                  width: "100%",
                  maxWidth: 600,
                  borderRadius: 32,
                  boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "32px 40px",
                    borderBottom: "1px solid #F1F5F9",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <h3
                      style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}
                    >
                      إعدادات المستخدم
                    </h3>
                    <p
                      style={{
                        fontSize: 14,
                        color: T.grayDark,
                        fontWeight: 500,
                      }}
                    >
                      تعديل بيانات الحساب والحساسيات
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingUser(null);
                      setIsAuthed(false);
                      setShowAuthPrompt(false);
                    }}
                    style={{
                      background: "#F1F5F9",
                      border: "none",
                      padding: 12,
                      borderRadius: 16,
                      cursor: "pointer",
                      color: T.text,
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div
                  style={{ padding: 40, direction: "rtl", textAlign: "right" }}
                >
                  {showAuthPrompt && !isAuthed ? (
                    <div style={{ textAlign: "center", padding: "20px 0" }}>
                      <div
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: "50%",
                          background: `${T.blue}10`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: T.blue,
                          margin: "0 auto 20px",
                        }}
                      >
                        <Shield size={32} />
                      </div>
                      <h4
                        style={{
                          fontSize: 18,
                          fontWeight: 800,
                          marginBottom: 12,
                        }}
                      >
                        التحقق من الهوية
                      </h4>
                      <p
                        style={{
                          color: T.grayDark,
                          fontSize: 14,
                          marginBottom: 24,
                        }}
                      >
                        يرجى إدخال رمز الأمان لإجراء التعديلات
                      </p>

                      <div style={{ maxWidth: 200, margin: "0 auto" }}>
                        <input
                          type="password"
                          autoFocus
                          placeholder="الرمز"
                          value={authPassword}
                          onChange={(e) => {
                            setAuthPassword(e.target.value);
                            setAuthError(false);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              if (authPassword === "0000") {
                                setIsAuthed(true);
                                setAuthPassword("");
                                setAuthError(false);
                              } else {
                                setAuthError(true);
                              }
                            }
                          }}
                          style={{
                            width: "100%",
                            height: 50,
                            borderRadius: 12,
                            border: `2px solid ${authError ? "#EF4444" : "#E2E8F0"}`,
                            textAlign: "center",
                            fontSize: 20,
                            letterSpacing: 4,
                            outline: "none",
                          }}
                        />
                        {authError && (
                          <p
                            style={{
                              color: "#EF4444",
                              fontSize: 12,
                              fontWeight: 700,
                              marginTop: 8,
                            }}
                          >
                            الرمز غير صحيح
                          </p>
                        )}

                        <button
                          onClick={() => {
                            if (authPassword === "0000") {
                              setIsAuthed(true);
                              setAuthPassword("");
                              setAuthError(false);
                            } else {
                              setAuthError(true);
                            }
                          }}
                          style={{
                            width: "100%",
                            height: 50,
                            background: T.blue,
                            color: "white",
                            border: "none",
                            borderRadius: 12,
                            fontWeight: 800,
                            marginTop: 16,
                            cursor: "pointer",
                          }}
                        >
                          تأكيد
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 24,
                      }}
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 20,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                          }}
                        >
                          <label style={{ fontSize: 13, fontWeight: 800, color: T.text }}>
                            الاسم الأول
                          </label>
                          <input
                            readOnly={!isAuthed}
                            onClick={() => !isAuthed && setShowAuthPrompt(true)}
                            value={userSettingsForm.firstName}
                            onChange={(e) =>
                              setUserSettingsForm({
                                ...userSettingsForm,
                                firstName: e.target.value,
                              })
                            }
                            style={{
                              height: 52,
                              padding: "0 18px",
                              borderRadius: 14,
                              border: `1.5px solid ${isAuthed ? T.blue : "#E2E8F0"}`,
                              background: isAuthed ? "white" : "#F8FAFC",
                              fontSize: 14,
                              outline: "none",
                              transition: "all 0.2s ease-in-out",
                              boxShadow: isAuthed ? "0 4px 12px rgba(99, 102, 241, 0.05)" : "none",
                            }}
                          />
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                          }}
                        >
                          <label style={{ fontSize: 13, fontWeight: 800, color: T.text }}>
                            اسم العائلة
                          </label>
                          <input
                            readOnly={!isAuthed}
                            onClick={() => !isAuthed && setShowAuthPrompt(true)}
                            value={userSettingsForm.lastName}
                            onChange={(e) =>
                              setUserSettingsForm({
                                ...userSettingsForm,
                                lastName: e.target.value,
                              })
                            }
                            style={{
                              height: 52,
                              padding: "0 18px",
                              borderRadius: 14,
                              border: `1.5px solid ${isAuthed ? T.blue : "#E2E8F0"}`,
                              background: isAuthed ? "white" : "#F8FAFC",
                              fontSize: 14,
                              outline: "none",
                              transition: "all 0.2s ease-in-out",
                              boxShadow: isAuthed ? "0 4px 12px rgba(99, 102, 241, 0.05)" : "none",
                            }}
                          />
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        <label style={{ fontSize: 13, fontWeight: 800, color: T.text }}>
                          البريد الإلكتروني / اسم المستخدم
                        </label>
                        <input
                          readOnly={!isAuthed}
                          onClick={() => !isAuthed && setShowAuthPrompt(true)}
                          value={userSettingsForm.username}
                          onChange={(e) =>
                            setUserSettingsForm({
                              ...userSettingsForm,
                              username: e.target.value,
                            })
                          }
                          style={{
                            height: 52,
                            padding: "0 18px",
                            borderRadius: 14,
                            border: `1.5px solid ${isAuthed ? T.blue : "#E2E8F0"}`,
                            background: isAuthed ? "white" : "#F8FAFC",
                            fontSize: 14,
                            textAlign: "left",
                            outline: "none",
                            transition: "all 0.2s ease-in-out",
                            boxShadow: isAuthed ? "0 4px 12px rgba(99, 102, 241, 0.05)" : "none",
                          }}
                        />
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        <label style={{ fontSize: 13, fontWeight: 800, color: T.text }}>
                          كلمة المرور
                        </label>
                        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                          <input
                            type={isAuthed && showPassword ? "text" : "password"}
                            readOnly={!isAuthed}
                            onClick={() => !isAuthed && setShowAuthPrompt(true)}
                            value={userSettingsForm.password}
                            onChange={(e) =>
                              setUserSettingsForm({
                                ...userSettingsForm,
                                password: e.target.value,
                              })
                            }
                            placeholder={isAuthed ? "" : "••••••••"}
                            style={{
                              width: "100%",
                              height: 52,
                              paddingRight: 16,
                              paddingLeft: 48,
                              borderRadius: 14,
                              border: `1.5px solid ${isAuthed ? T.blue : "#E2E8F0"}`,
                              background: isAuthed ? "white" : "#F8FAFC",
                              fontSize: isAuthed && showPassword ? "14px" : "18px",
                              letterSpacing: isAuthed && showPassword ? "normal" : "4px",
                              textAlign: "left",
                              fontFamily: isAuthed && showPassword ? "inherit" : "monospace",
                              outline: "none",
                              transition: "all 0.2s ease-in-out",
                              boxShadow: isAuthed ? "0 4px 12px rgba(99, 102, 241, 0.05)" : "none",
                            }}
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              if (!isAuthed) {
                                setShowAuthPrompt(true);
                              } else {
                                setShowPassword(!showPassword);
                              }
                            }}
                            style={{
                              position: "absolute",
                              left: 12,
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: isAuthed ? T.blue : T.grayDark,
                              padding: 8,
                              borderRadius: 10,
                              transition: "background-color 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              if (isAuthed) e.currentTarget.style.backgroundColor = "rgba(99, 102, 241, 0.06)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "transparent";
                            }}
                            title={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                          >
                            {isAuthed && showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 10,
                        }}
                      >
                        <label style={{ fontSize: 14, fontWeight: 800, color: T.text }}>
                          الحساسيات المسجلة ودرجتها
                        </label>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 12,
                            padding: "16px",
                            borderRadius: 16,
                            border: "1px solid #E2E8F0",
                            minHeight: 80,
                            background: "#F8FAFC",
                          }}
                        >
                          {userSettingsForm.allergens.length > 0 ? (
                            userSettingsForm.allergens.map(
                              (a: any, i: number) => {
                                const allergenKey = typeof a === "string" ? a : (a.allergenKey || a.key);
                                const allergenSev = a.severity || "Moderate";
                                const emoji = getAllergenEmoji(allergenKey);
                                const nameAr = mapAllergenName(allergenKey, lang);
                                const sev = severityMap[allergenSev] || severityMap.Moderate;

                                return (
                                  <div
                                    key={i}
                                    style={{
                                      background: "white",
                                      border: "1px solid #E2E8F0",
                                      borderRadius: 14,
                                      padding: "10px 14px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                      boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                                    }}
                                  >
                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                      <span style={{ fontSize: 20 }}>{emoji}</span>
                                      <div>
                                        <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{nameAr}</div>
                                        <div style={{ fontSize: 11, color: T.grayDark, fontWeight: 600 }}>{allergenKey}</div>
                                      </div>
                                    </div>
                                    <span
                                      style={{
                                        padding: "4px 10px",
                                        borderRadius: 8,
                                        fontSize: 11,
                                        fontWeight: 800,
                                        color: sev.color,
                                        background: sev.bg,
                                        border: `1px solid ${sev.border}`,
                                      }}
                                    >
                                      {sev.label}
                                    </span>
                                  </div>
                                );
                              }
                            )
                          ) : (
                            <div style={{ gridColumn: "span 2", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 0" }}>
                              <span style={{ fontSize: 13, color: T.grayDark, fontWeight: 600 }}>لا يوجد حساسيات مسجلة لهذا الحساب.</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div
                  style={{
                    padding: "24px 40px",
                    borderTop: "1px solid #F1F5F9",
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 12,
                  }}
                >
                  <button
                    onClick={() => {
                      setEditingUser(null);
                      setIsAuthed(false);
                      setShowAuthPrompt(false);
                    }}
                    style={{
                      padding: "0 24px",
                      height: 50,
                      borderRadius: 14,
                      background: "#F1F5F9",
                      color: T.text,
                      border: "none",
                      fontWeight: 700,
                      fontSize: 15,
                      cursor: "pointer",
                    }}
                  >
                    إغلاق
                  </button>
                  {isAuthed && (
                    <button
                      onClick={() => {
                        const dbUser = dbUsers.find(
                          (u) => u.email === editingUser,
                        );
                        const updatedData = {
                          userId: dbUser?.id,
                          password: userSettingsForm.password,
                          profile: {
                            firstName: userSettingsForm.firstName,
                            lastName: userSettingsForm.lastName,
                          },
                        };
                        onUpdateUser &&
                          onUpdateUser(
                            editingUser!,
                            userSettingsForm.username,
                            updatedData,
                          );
                        setEditingUser(null);
                        setIsAuthed(false);
                      }}
                      style={{
                        padding: "0 32px",
                        height: 50,
                        borderRadius: 14,
                        background: T.blue,
                        color: "white",
                        border: "none",
                        fontWeight: 800,
                        fontSize: 15,
                        cursor: "pointer",
                        boxShadow: `0 8px 16px ${T.blue}25`,
                      }}
                    >
                      حفظ التعديلات
                    </button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Admin Confirmation Modal */}
        <AnimatePresence>
          {confirmAdmin && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.5)",
                zIndex: 2000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(4px)",
              }}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                style={{
                  background: "white",
                  width: "100%",
                  maxWidth: 450,
                  borderRadius: 24,
                  padding: 32,
                  boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: `${T.blue}10`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: T.blue,
                    margin: "0 auto 24px",
                  }}
                >
                  <Shield size={32} />
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>
                  هل أنت متأكد؟
                </h3>
                <p
                  style={{
                    color: T.grayDark,
                    fontSize: 16,
                    lineHeight: 1.6,
                    marginBottom: 32,
                  }}
                >
                  أنت على وشك إعطاء صلاحية "مسؤول" للمستخدم <br />
                  <strong style={{ color: T.text }}>
                    {confirmAdmin}
                  </strong>. <br />
                  سيمتلك المسؤول صلاحيات كاملة لإدارة المنتجات والمستخدمين.
                </p>

                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    onClick={() => setConfirmAdmin(null)}
                    style={{
                      flex: 1,
                      height: 52,
                      background: "#F1F5F9",
                      color: T.text,
                      border: "none",
                      borderRadius: 14,
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={() => {
                      adminUsersApi.updateRole(Number(confirmAdmin), "Admin")
                        .then(() => adminUsersApi.getAll().then(setDbUsers))
                        .catch(console.error);
                      setConfirmAdmin(null);
                    }}
                    style={{
                      flex: 1.5,
                      height: 52,
                      background: T.blue,
                      color: "white",
                      border: "none",
                      borderRadius: 14,
                      fontWeight: 800,
                      cursor: "pointer",
                      boxShadow: `0 8px 16px ${T.blue}25`,
                    }}
                  >
                    تأكيد الترقية
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Custom State-Driven Confirmation Dialog */}
        <AnimatePresence>
          {confirmDialog.isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(15, 23, 42, 0.45)",
                zIndex: 9999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(8px)",
                padding: 16,
              }}
            >
              <motion.div
                initial={{ scale: 0.92, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.92, y: 15 }}
                transition={{ type: "spring", duration: 0.4 }}
                style={{
                  background: "white",
                  width: "100%",
                  maxWidth: 480,
                  borderRadius: 28,
                  padding: "36px 32px",
                  boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
                  textAlign: "center",
                  direction: "rtl",
                }}
              >
                <div
                  style={{
                    width: 68,
                    height: 68,
                    borderRadius: 22,
                    background: confirmDialog.type === "delete" ? "#FEF2F2" : "#F0FDF4",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: confirmDialog.type === "delete" ? "#EF4444" : "#10B981",
                    margin: "0 auto 24px",
                    boxShadow: confirmDialog.type === "delete" ? "0 10px 15px -3px rgba(239, 68, 68, 0.1)" : "0 10px 15px -3px rgba(16, 185, 129, 0.1)",
                  }}
                >
                  {confirmDialog.type === "delete" ? (
                    <Trash2 size={32} />
                  ) : (
                    <EyeOff size={32} />
                  )}
                </div>

                <h3 
                  style={{ 
                    fontSize: 22, 
                    fontWeight: 900, 
                    color: "#0F172A",
                    marginBottom: 14,
                    lineHeight: 1.3
                  }}
                >
                  {confirmDialog.title}
                </h3>
                
                <p
                  style={{
                    color: "#475569",
                    fontSize: 15,
                    lineHeight: 1.6,
                    marginBottom: 32,
                    fontWeight: 500,
                  }}
                >
                  {confirmDialog.description}
                </p>

                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                    style={{
                      flex: 1,
                      height: 52,
                      background: "#F1F5F9",
                      color: "#475569",
                      border: "none",
                      borderRadius: 16,
                      fontWeight: 800,
                      fontSize: 15,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    تراجع وإلغاء
                  </button>
                  <button
                    onClick={() => {
                      confirmDialog.onConfirm();
                      setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                    }}
                    style={{
                      flex: 1.4,
                      height: 52,
                      background: confirmDialog.type === "delete" ? "#EF4444" : T.blue,
                      color: "white",
                      border: "none",
                      borderRadius: 16,
                      fontWeight: 800,
                      fontSize: 15,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      boxShadow: confirmDialog.type === "delete" ? "0 8px 16px rgba(239, 68, 68, 0.2)" : `0 8px 16px ${T.blue}20`,
                    }}
                  >
                    تأكيد الإجراء
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showAllActivitiesModal && (
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
                background: "rgba(15, 23, 42, 0.4)",
                backdropFilter: "blur(6px)",
                zIndex: 9999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={() => setShowAllActivitiesModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: "spring", duration: 0.5 }}
                style={{
                  background: "white",
                  borderRadius: 32,
                  width: "90%",
                  maxWidth: 800,
                  maxHeight: "85vh",
                  boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)",
                  padding: 40,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 24,
                    flexDirection: lang === "ar" ? "row-reverse" : "row",
                  }}
                >
                  <div style={{ textRendering: "optimizeLegibility" }}>
                    <h3 style={{ fontSize: 22, fontWeight: 900, color: T.text, margin: 0, textAlign: lang === "ar" ? "right" : "left" }}>
                      {lang === "ar" ? "سجل آخر 100 عملية مسجلة" : "Last 100 Operations Log"}
                    </h3>
                    <p style={{ fontSize: 13, color: T.grayDark, fontWeight: 600, margin: "6px 0 0 0", textAlign: lang === "ar" ? "right" : "left" }}>
                      {lang === "ar"
                        ? "سجل كامل بالأنشطة والعمليات التي تمت من قبل مسؤولي منصة سليم مؤخراً"
                        : "All recent administrative actions logged on Saleem panel"}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAllActivitiesModal(false)}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      border: "none",
                      background: "#F1F5F9",
                      color: "#64748B",
                      display: "flex",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    <X size={20} style={{ margin: "auto" }} />
                  </button>
                </div>

                {/* Search bar */}
                <div
                  style={{
                    position: "relative",
                    marginBottom: 20,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: lang === "ar" ? "auto" : 20,
                      right: lang === "ar" ? 20 : "auto",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                      color: T.grayDark,
                    }}
                  >
                    <Search size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder={lang === "ar" ? "ابحث بالعملية، المسؤول، أو الهدف..." : "Search by operation, operator, target..."}
                    value={activitySearchQuery}
                    onChange={(e) => setActivitySearchQuery(e.target.value)}
                    style={{
                      width: "100%",
                      height: 52,
                      borderRadius: 16,
                      border: "1.5px solid #E2E8F0",
                      background: "#F8FAFC",
                      color: T.text,
                      fontSize: 14,
                      fontWeight: 700,
                      paddingLeft: lang === "ar" ? 20 : 52,
                      paddingRight: lang === "ar" ? 52 : 20,
                      textAlign: lang === "ar" ? "right" : "left",
                      outline: "none",
                      transition: "all 0.2s",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = T.blue;
                      e.target.style.background = "white";
                      e.target.style.boxShadow = `0 0 0 4px ${T.blue}10`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#E2E8F0";
                      e.target.style.background = "#F8FAFC";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>

                {/* Activities List */}
                <div
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    paddingRight: 4,
                    paddingLeft: 4,
                  }}
                >
                  {(() => {
                    const query = activitySearchQuery.trim().toLowerCase();
                    const filtered = (activities || []).slice(0, 100).filter((act) => {
                      if (!query) return true;
                      const mapped = mapActivityAction(act.action, lang);
                      return (
                        act.userEmail.toLowerCase().includes(query) ||
                        act.action.toLowerCase().includes(query) ||
                        (mapped.label && mapped.label.toLowerCase().includes(query)) ||
                        act.target.toLowerCase().includes(query)
                      );
                    });

                    if (filtered.length === 0) {
                      return (
                        <div
                          style={{
                            textAlign: "center",
                            padding: "80px 0",
                            color: T.grayDark,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 16,
                          }}
                        >
                          <span style={{ fontSize: 44 }}>🔍</span>
                          <h4 style={{ fontSize: 16, fontWeight: 800, color: T.text, margin: 0 }}>
                            {lang === "ar" ? "لم يتم العثور على أي نتائج" : "No results found"}
                          </h4>
                          <p style={{ fontSize: 13, color: T.grayDark, margin: 0 }}>
                            {lang === "ar"
                              ? "جرب البحث بكلمات أخرى أو تأكد من خلوها من الأخطاء الإملائية"
                              : "Try typing different keywords or check spelling"}
                          </p>
                        </div>
                      );
                    }

                    return filtered.map((activity) => {
                      const mapped = mapActivityAction(activity.action, lang);
                      return (
                        <div
                          key={activity.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 16,
                            padding: "14px 20px",
                            borderRadius: 20,
                            background: "#F8FAFC",
                            border: "1px solid #F1F5F9",
                            flexDirection: lang === "ar" ? "row-reverse" : "row",
                          }}
                        >
                          {/* Action Icon representation */}
                          <div
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: 12,
                              background: mapped.bg,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 16,
                              flexShrink: 0,
                            }}
                          >
                            {mapped.icon}
                          </div>

                          {/* Content */}
                          <div style={{ flex: 1, minWidth: 0, textAlign: lang === "ar" ? "right" : "left" }}>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 4,
                                flexDirection: lang === "ar" ? "row-reverse" : "row",
                              }}
                            >
                              <div style={{ display: "inline-flex", flexWrap: "wrap", alignItems: "center", gap: 8, flexDirection: lang === "ar" ? "row-reverse" : "row" }}>
                                <span
                                  style={{
                                    fontSize: 11,
                                    color: mapped.color,
                                    background: `${mapped.color}15`,
                                    padding: "2px 6px",
                                    borderRadius: 6,
                                    fontWeight: 800,
                                  }}
                                >
                                  {mapped.label}
                                </span>
                                <span
                                  style={{
                                    fontSize: 13,
                                    color: T.text,
                                    fontWeight: 700,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    maxWidth: 320,
                                  }}
                                >
                                  {activity.target}
                                </span>
                              </div>
                              
                              <span
                                style={{
                                  fontSize: 11,
                                  color: T.grayDark,
                                  fontWeight: 600,
                                }}
                              >
                                {new Date(activity.timestamp).toLocaleString(lang === "ar" ? "ar-EG" : "en-US", {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            
                            <div style={{ display: "flex", alignItems: "center", gap: 4, color: T.grayDark, fontSize: 11, fontWeight: 500, justifyContent: lang === "ar" ? "flex-end" : "flex-start" }}>
                              <span style={{ opacity: 0.8 }}>
                                {lang === "ar" ? "بواسطة المسؤول:" : "By Admin:"}
                              </span>
                              <span style={{ fontWeight: 600, color: T.text }} dir="ltr">
                                {activity.userEmail}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>

                {/* Footer stats */}
                <div
                  style={{
                    marginTop: 20,
                    paddingTop: 16,
                    borderTop: "1.5px solid #F1F5F9",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexDirection: lang === "ar" ? "row-reverse" : "row",
                  }}
                >
                  <span style={{ fontSize: 12, color: T.grayDark, fontWeight: 700 }}>
                    {lang === "ar"
                      ? `إجمالي العمليات المسترجعة: ${(activities || []).length} (بحد أقصى آخر 100 عملية)`
                      : `Total events retrieved: ${(activities || []).length} (max 100)`}
                  </span>
                  <button
                    onClick={() => setShowAllActivitiesModal(false)}
                    style={{
                      padding: "8px 24px",
                      borderRadius: 12,
                      background: T.blue,
                      color: "white",
                      border: "none",
                      fontSize: 13,
                      fontWeight: 800,
                      cursor: "pointer",
                      boxShadow: `0 4px 12px ${T.blue}20`,
                    }}
                  >
                    {lang === "ar" ? "إغلاق" : "Close"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
    </>
  );
}
