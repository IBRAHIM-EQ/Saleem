/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from "react";
import { T, DEFAULT_PRODUCTS, DEFAULT_SPECIALISTS } from "./constants";
import { storage, logoutCurrentUser, getUserStorage, USERS_STORAGE_KEY, getActivities, logActivity, validateUser, setCurrentUser as setStorageUser } from "./lib/storage";
import { productsApi, specialistsApi, tokenStore, profileApi, setupTokenRefresh, adminUsersApi } from "./lib/api";

// Components
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { LogoutModal } from "./components/LogoutModal";
import { Toast } from "./components/Toast";

// Pages
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { AssessmentPage } from "./pages/AssessmentPage";
import { LandingPage } from "./pages/LandingPage";
import { HomePage } from "./pages/HomePage";
import { FeedPage } from "./pages/FeedPage";
import { ChatPage } from "./pages/ChatPage";
import { WikiPage } from "./pages/WikiPage";
import { DirectoryPage } from "./pages/DirectoryPage";
import { AdminDashboard } from "./pages/AdminDashboard";
import { TourPage } from "./pages/TourPage";
import { GuestIntroPage } from "./pages/GuestIntroPage";

export default function App() {
  // --- Auth state ---
  const [currentUsername, setCurrentUsername] = useState<string | null>(() => localStorage.getItem("saleem_current_user"));
  const [view, setView] = useState<string>(() => {
    const savedView = storage.get("saleem_active_view", null);
    const activeUsername = localStorage.getItem("saleem_current_user");
    if (activeUsername) {
      if (activeUsername.startsWith("guest_")) return savedView || "app";
      const users = getUserStorage();
      const user = users[activeUsername];
      if (user && user.profile) {
        if (user.profile.role === "Admin") return "admin";
        if (user.profile.onboardingComplete) return "app";
        return "onboarding";
      }
    }
    return savedView || "landing";
  });
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // --- User profile ---
  const [profile, setProfile] = useState(() => {
    const activeUsername = localStorage.getItem("saleem_current_user");
    if (activeUsername) {
      if (activeUsername.startsWith("guest_")) {
        const saved = storage.get("saleem_profile", null);
        if (saved) return saved;
      } else {
        const users = getUserStorage();
        if (users[activeUsername] && users[activeUsername].profile) {
          return users[activeUsername].profile;
        }
      }
    }
    const saved = storage.get("saleem_profile", null);
    if (saved) return saved;
    return { firstName: "", lastName: "", allergens: [], onboardingComplete: false };
  });

  const [activePage, setActivePage] = useState(() => storage.get("saleem_active_page", "home"));
  const [lang, setLang] = useState<"ar" | "en">(() => storage.get("saleem_preferred_lang", "en"));
  const effectiveLang = lang;

  useEffect(() => { storage.set("saleem_active_view", view); }, [view]);
  useEffect(() => { storage.set("saleem_active_page", activePage); }, [activePage]);
  useEffect(() => { storage.set("saleem_preferred_lang", lang); }, [lang]);
  useEffect(() => { if (profile) storage.set("saleem_profile", profile); }, [profile]);

  // ─────────────────────────────────────────────
  // API DATA — Products & Specialists from DB only
  // No localStorage fallback for products/brands/stores
  // ─────────────────────────────────────────────
  const [apiProducts, setApiProducts] = useState<any[]>([]);
  const [apiSpecialists, setApiSpecialists] = useState<any[]>([]);
  const [apiLoaded, setApiLoaded] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  // Products loaded anonymously for the guest feed (no JWT required)
  const [guestProducts, setGuestProducts] = useState<any[]>([]);
  // True while the anonymous guest fetch is in-flight — prevents the
  // "no products" empty-state from flashing before the data arrives.
  const [guestLoading, setGuestLoading] = useState(false);

  // Stable references — these are pure transforms with no component-state
  // dependencies, so useCallback with [] is correct and avoids stale closures.
  const normalizeProduct = useCallback((p: any) => {
    console.log("[DEBUG] normalizeProduct raw input:", p);
    const normalized = {
      ...p,
      id: String(p.id),
      allergenKey: p.allergenKey || "",
      brands: p.productBrands || [],
    };
    console.log("[DEBUG] normalizeProduct output:", normalized);
    return normalized;
  }, []);

  const normalizeSpecialist = useCallback((s: any) => ({
    ...s,
    id: String(s.id),
    contact: s.phoneNumber || s.whatsAppNumber || "",
    rating: String(s.rating ?? ""),
    reviews: s.reviewsCount ?? 0,
    experience: `${s.experienceYears ?? ""} yrs`,
  }), []);

  const loadFromApi = useCallback(async () => {
    const token = tokenStore.getAccess();
    if (!token || !currentUsername || currentUsername.startsWith("guest_")) return;
    try {
      const [prods, specs] = await Promise.all([
        productsApi.getAll(),
        specialistsApi.getAll(),
      ]);
      setApiProducts(prods.map(normalizeProduct));
      setApiSpecialists(specs.map(normalizeSpecialist));
      setApiLoaded(true);
      setDataError(null);
    } catch (err: any) {
      setApiLoaded(false);
      setDataError("تعذّر الاتصال بالداتابيس. تأكد من تشغيل الـ Backend على المنفذ 3000.");
    }
  }, [currentUsername, normalizeProduct, normalizeSpecialist]);

  // Separate fetch for guest sessions — uses the anonymous (no-JWT) path so
  // a backend 401 is treated as a plain network error and NEVER fires the
  // saleem:session-expired event that would redirect to /login.
  const loadGuestProducts = useCallback(async () => {
    console.log("[DEBUG] loadGuestProducts triggered. currentUsername:", currentUsername);
    if (!currentUsername || !currentUsername.startsWith("guest_")) return;
    setGuestLoading(true);
    try {
      const prods = await productsApi.getAllPublic();
      console.log("[DEBUG] productsApi.getAllPublic() returned:", prods);
      
      // If the backend returns wrapped data (e.g. { data: [...] } or { items: [...] }), 
      // we need to log and map the correct array.
      let arrayToMap = prods;
      if (prods && typeof prods === 'object' && !Array.isArray(prods)) {
        console.warn("[DEBUG] The API returned an object, not an array. Looking for a nested array...");
        if (Array.isArray((prods as any).data)) arrayToMap = (prods as any).data;
        else if (Array.isArray((prods as any).items)) arrayToMap = (prods as any).items;
        else if (Array.isArray((prods as any).value)) arrayToMap = (prods as any).value;
      }
      
      if (!Array.isArray(arrayToMap)) {
        console.error("[DEBUG] FATAL: arrayToMap is STILL not an array. Value:", arrayToMap);
        setGuestProducts([]);
        return;
      }

      const mappedProds = arrayToMap.map(normalizeProduct);
      console.log("[DEBUG] Final mapped guest products:", mappedProds);
      setGuestProducts(mappedProds);
    } catch (err) {
      console.error("[DEBUG] Error in loadGuestProducts:", err);
      // Silently fall back to empty — no redirect side-effects
      setGuestProducts([]);
    } finally {
      setGuestLoading(false);
    }
  }, [currentUsername, normalizeProduct]);

  useEffect(() => { loadGuestProducts(); }, [loadGuestProducts]);

  useEffect(() => { loadFromApi(); }, [loadFromApi]);

  // Proactive token refresh — starts when a real session exists, cleans up on logout
  useEffect(() => {
    if (!currentUsername || currentUsername.startsWith("guest_") || !tokenStore.getAccess()) return;
    const cleanup = setupTokenRefresh(() => {
      window.dispatchEvent(new CustomEvent("saleem:session-expired"));
    });
    return cleanup;
  }, [currentUsername]);

  // Force logout on any 401 that exhausted the refresh token.
  // Guard: ignore this event completely for guest sessions — guests have
  // no JWT to expire, so any 401 they encounter is a config/network issue,
  // not a session expiry. Acting on it would wrongly boot them to /login.
  useEffect(() => {
    const handleSessionExpired = () => {
      // Safety guard: never redirect a guest session on this event
      const activeUser = localStorage.getItem("saleem_current_user");
      if (activeUser && activeUser.startsWith("guest_")) return;

      logoutCurrentUser();
      storage.remove("saleem_profile");
      storage.remove("saleem_active_view");
      storage.remove("saleem_active_page");
      setApiProducts([]);
      setApiSpecialists([]);
      setApiLoaded(false);
      setProfile({ firstName: "", lastName: "", allergens: [], onboardingComplete: false });
      setCurrentUsername(null);
      setView("login");
    };
    window.addEventListener("saleem:session-expired", handleSessionExpired);
    return () => window.removeEventListener("saleem:session-expired", handleSessionExpired);
  }, []);

  // Users & activities (kept in localStorage — auth/session only)
  const [allUsers, setAllUsers] = useState<any[]>(() => {
    const users = getUserStorage();
    return Object.keys(users).map(k => ({ ...users[k].profile, email: k, password: users[k].password }));
  });
  const [activities, setActivities] = useState<any[]>(() => getActivities());

  const fetchAdminData = useCallback(() => {
    const users = getUserStorage();
    setAllUsers(Object.keys(users).map(k => ({ ...users[k].profile, email: k, password: users[k].password })));
    setActivities(getActivities());
  }, []);

  // ─────────────────────────────────────────────
  // PRODUCT HANDLERS — DB only, no localStorage fallback
  // ─────────────────────────────────────────────
  const handleToggleProductHide = async (id: string) => {
    try {
      const { adminProductsApi } = await import("./lib/api");
      await adminProductsApi.toggleHide(Number(id));
      await loadFromApi();
      const product = apiProducts.find(p => String(p.id) === String(id));
      const prodName = product ? product.name : id;
      if (currentUsername) logActivity(currentUsername, apiProducts.find(p => String(p.id) === String(id))?.isHidden ? "Show Product" : "Hide Product", prodName);
    } catch (err: any) {
      setToast("فشل تغيير حالة المنتج: " + (err?.message || "تحقق من الاتصال بالـ Backend"));
    }
    fetchAdminData();
  };

  const handleAddProduct = async (p: any) => {
    try {
      const { adminProductsApi } = await import("./lib/api");
      await adminProductsApi.create({
        name: p.name,
        brand: p.brand || "",
        category: p.category || "",
        allergenKey: p.allergenKey || "",
        isSafe: p.isSafe ?? true,
        description: p.description || "",
        imageUrl: p.imageUrl || "",
      });
      await loadFromApi();
      setToast(effectiveLang === "ar" ? "تمت إضافة المنتج في الداتابيس بنجاح!" : "Product saved to database successfully!");
      if (currentUsername) logActivity(currentUsername, "Add Product", p.name);
    } catch (err: any) {
      setToast("فشل حفظ المنتج في الداتابيس: " + (err?.message || "تحقق من الاتصال بالـ Backend على المنفذ 3000"));
    }
    fetchAdminData();
  };

  const handleDeleteProduct = async (id: number) => {
    const product = apiProducts.find(p => String(p.id) === String(id));
    const prodName = product ? product.name : String(id);
    try {
      const { adminProductsApi } = await import("./lib/api");
      await adminProductsApi.delete(Number(id));
      await loadFromApi();
      setToast(effectiveLang === "ar" ? "تم حذف المنتج من الداتابيس!" : "Product deleted from database!");
      if (currentUsername) logActivity(currentUsername, "Delete Product", prodName);
    } catch (err: any) {
      setToast("فشل حذف المنتج: " + (err?.message || "تحقق من الاتصال بالـ Backend"));
    }
    fetchAdminData();
  };

  const handleUpdateProduct = async (updatedProduct: any) => {
    try {
      const { adminProductsApi } = await import("./lib/api");
      await adminProductsApi.update(Number(updatedProduct.id), {
        name: updatedProduct.name,
        brand: updatedProduct.brand || "",
        category: updatedProduct.category || "",
        allergenKey: updatedProduct.allergenKey || "",
        isSafe: updatedProduct.isSafe ?? true,
        description: updatedProduct.description || "",
        imageUrl: updatedProduct.imageUrl || "",
      });
      await loadFromApi();
      setToast(effectiveLang === "ar" ? "تم تعديل المنتج في الداتابيس!" : "Product updated in database!");
      if (currentUsername) logActivity(currentUsername, "Update Product", updatedProduct.name);
    } catch (err: any) {
      setToast("فشل تعديل المنتج: " + (err?.message || "تحقق من الاتصال بالـ Backend"));
    }
    fetchAdminData();
  };

  // ─────────────────────────────────────────────
  // SPECIALIST HANDLERS — DB only, no localStorage fallback
  // ─────────────────────────────────────────────
  const handleAddSpecialist = async (s: any) => {
    try {
      const { adminSpecialistsApi } = await import("./lib/api");
      await adminSpecialistsApi.create({
        name: s.name,
        title: s.title || "",
        bio: s.bio || "",
        email: s.email || "",
        phoneNumber: s.phoneNumber || s.contact || "",
        whatsAppNumber: s.whatsAppNumber || "",
        imageUrl: s.imageUrl || "",
        experienceYears: Number(String(s.experienceYears || s.experience || "0").replace(/[^0-9]/g, "")) || 0,
        rating: Number(s.rating) || 0,
        reviewsCount: Number(s.reviewsCount || s.reviews) || 0,
      });
      await loadFromApi();
      setToast(effectiveLang === "ar" ? "تمت إضافة الطبيب في الداتابيس بنجاح!" : "Specialist saved to database!");
      if (currentUsername) logActivity(currentUsername, "Add Specialist", s.name);
    } catch (err: any) {
      setToast("فشل حفظ الطبيب في الداتابيس: " + (err?.message || "تحقق من الاتصال بالـ Backend على المنفذ 3000"));
    }
    fetchAdminData();
  };

  const handleDeleteAdminSpecialist = async (id: number) => {
    const spec = apiSpecialists.find(s => String(s.id) === String(id));
    const specName = spec ? spec.name : String(id);
    try {
      const { adminSpecialistsApi } = await import("./lib/api");
      await adminSpecialistsApi.delete(Number(id));
      await loadFromApi();
      setToast(effectiveLang === "ar" ? "تم حذف الطبيب من الداتابيس!" : "Specialist deleted from database!");
      if (currentUsername) logActivity(currentUsername, "Delete Specialist", specName);
    } catch (err: any) {
      setToast("فشل حذف الطبيب: " + (err?.message || "تحقق من الاتصال بالـ Backend"));
    }
    fetchAdminData();
  };

  const handleUpdateSpecialist = async (updatedSpecialist: any) => {
    try {
      const { adminSpecialistsApi } = await import("./lib/api");
      await adminSpecialistsApi.update(Number(updatedSpecialist.id), {
        name: updatedSpecialist.name,
        title: updatedSpecialist.title || "",
        bio: updatedSpecialist.bio || "",
        email: updatedSpecialist.email || "",
        phoneNumber: updatedSpecialist.phoneNumber || updatedSpecialist.contact || "",
        whatsAppNumber: updatedSpecialist.whatsAppNumber || "",
        imageUrl: updatedSpecialist.imageUrl || "",
        experienceYears: Number(String(updatedSpecialist.experienceYears || "0").replace(/[^0-9]/g, "")) || 0,
        rating: Number(updatedSpecialist.rating) || 0,
        reviewsCount: Number(updatedSpecialist.reviewsCount || updatedSpecialist.reviews) || 0,
      });
      await loadFromApi();
      setToast(effectiveLang === "ar" ? "تم تعديل الطبيب في الداتابيس!" : "Specialist updated in database!");
      if (currentUsername) logActivity(currentUsername, "Update Specialist", updatedSpecialist.name);
    } catch (err: any) {
      setToast("فشل تعديل الطبيب: " + (err?.message || "تحقق من الاتصال بالـ Backend"));
    }
    fetchAdminData();
  };

  const handleHideDefaultSpecialist = async (id: string) => {
    try {
      const { adminSpecialistsApi } = await import("./lib/api");
      await adminSpecialistsApi.toggleHide(Number(id));
      await loadFromApi();
      const spec = apiSpecialists.find(s => String(s.id) === String(id));
      if (currentUsername) logActivity(currentUsername, "Hide Specialist", spec?.name || id);
    } catch (err: any) {
      setToast("فشل إخفاء الطبيب: " + (err?.message || ""));
    }
    fetchAdminData();
  };

  const handleRestoreSpecialist = async (id: string) => {
    try {
      const { adminSpecialistsApi } = await import("./lib/api");
      await adminSpecialistsApi.toggleHide(Number(id));
      await loadFromApi();
      const spec = apiSpecialists.find(s => String(s.id) === String(id));
      if (currentUsername) logActivity(currentUsername, "Restore Specialist", spec?.name || id);
    } catch (err: any) {
      setToast("فشل استعادة الطبيب: " + (err?.message || ""));
    }
    fetchAdminData();
  };

  // ─────────────────────────────────────────────
  // USER HANDLERS — localStorage (auth only)
  // ─────────────────────────────────────────────
  const handleDeleteUser = async (email: string) => {
    if (email === "admin@saleem.com") {
      setToast("لا يمكن حذف حساب Saleem Admin الأساسي");
      return;
    }
    const users = getUserStorage();
    delete users[email];
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    setToast("User deleted");
    if (currentUsername) logActivity(currentUsername, "Delete User", email);
    fetchAdminData();
  };

  const handleUpdateUser = async (oldEmail: string, newEmail: string, data: any) => {
    const userId: number | undefined = data.userId;
    if (!userId) {
      setToast("خطأ: معرّف المستخدم غير موجود");
      return;
    }
    try {
      await adminUsersApi.updateUser(userId, {
        firstName: data.profile.firstName,
        lastName:  data.profile.lastName,
        email:     newEmail,
        ...(data.password ? { password: data.password } : {}),
      });
      if (currentUsername === oldEmail && newEmail !== oldEmail) {
        setCurrentUsername(newEmail);
        localStorage.setItem("saleem_current_user", newEmail);
      }
      setToast("تم تعديل بيانات المستخدم بنجاح!");
      if (currentUsername) logActivity(currentUsername, "Update User", `${newEmail} (${data.profile.firstName} ${data.profile.lastName})`);
      fetchAdminData();
    } catch (err: any) {
      setToast("فشل تعديل المستخدم: " + (err?.message || "تحقق من الاتصال بالـ Backend"));
    }
  };

  const handleUpdateUserRole = async (email: string, role: string, doctorDetails?: any) => {
    if (email === "admin@saleem.com") {
      setToast("لا يمكن تعديل صلاحيات حساب Saleem Admin الأساسي");
      return;
    }
    const users = getUserStorage();
    if (users[email]) {
      const normalizedRole = role === "admin" ? "Admin" : (role === "user" ? "User" : role);
      users[email].profile.role = normalizedRole;
      if (doctorDetails) users[email].profile = { ...users[email].profile, ...doctorDetails };
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      if (currentUsername) logActivity(currentUsername, "Update User Role", `${email} -> ${normalizedRole}`);
      if (currentUsername === email) {
        if (normalizedRole === "Admin") {
          setProfile(users[email].profile);
          storage.set("saleem_profile", users[email].profile);
          setView("admin");
        } else {
          const emailKey = email || "guest";
          storage.remove(`saleem_chat_history_${emailKey}`);
          storage.remove("saleem_chat_history");
          logoutCurrentUser();
          storage.remove("saleem_profile");
          storage.remove("saleem_active_view");
          storage.remove("saleem_active_page");
          setProfile({ firstName: "", lastName: "", allergens: [], onboardingComplete: false });
          setCurrentUsername(null);
          setView("login");
          setToast(effectiveLang === "ar" ? "تم تغيير صلاحياتك إلى مستخدم عادي. يرجى تسجيل الدخول مجدداً." : "Your role was changed to user. Please log in again.");
          return;
        }
      }
      setToast(effectiveLang === "ar" ? "تم تحديث رتبة وصلاحيات المستخدم بنجاح!" : "User role updated successfully!");
      fetchAdminData();
    }
  };

  const handleLogActivity = useCallback((action: string, target: string) => {
    if (currentUsername) {
      const updated = logActivity(currentUsername, action, target);
      setActivities(updated);
    }
  }, [currentUsername]);

  // ─────────────────────────────────────────────
  // Computed lists — DB data only
  // ─────────────────────────────────────────────
  const allProductsMerged = apiProducts;
  
  console.log("[DEBUG] App.tsx computing visibleProducts. currentUsername:", currentUsername, "guestProducts count:", guestProducts.length, "apiProducts count:", apiProducts.length);
  
  const visibleProducts = currentUsername?.startsWith("guest_")
    ? guestProducts.filter(p => !p.isHidden)
    : apiProducts.filter(p => !p.isHidden);
    
  console.log("[DEBUG] App.tsx visibleProducts count:", visibleProducts.length);
  
  const allSpecialistsMerged = apiSpecialists;
  const visibleSpecialists = apiSpecialists.filter(s => !s.isHidden);

  // ─────────────────────────────────────────────
  // AUTH HANDLERS
  // ─────────────────────────────────────────────
  const handleLogin = (userData: any) => {
    const { email, fullName, role, onboardingComplete, allergens } = userData;
    setCurrentUsername(email);
    setStorageUser(email);
    const profileData = {
      firstName: fullName.split(" ")[0],
      lastName: fullName.split(" ").slice(1).join(" "),
      email,
      role,
      allergens: allergens || [],
      onboardingComplete,
    };
    setProfile(profileData);
    storage.set("saleem_profile", profileData);
    if (role === "Admin") {
      setView("admin");
      setActivities(logActivity(email, "Login", "Admin Panel"));
    } else if (onboardingComplete) {
      setView("app");
    } else {
      setView("onboarding");
    }
  };

  const handleSaveAssessment = async (allergies: any[]) => {
    const updated = { ...profile, allergens: allergies, onboardingComplete: true };
    setProfile(updated);
    storage.set("saleem_profile", updated);
    if (currentUsername) {
      const users = getUserStorage();
      if (users[currentUsername]) {
        users[currentUsername].profile.allergens = allergies;
        users[currentUsername].profile.onboardingComplete = true;
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      }
    }
    setView("app");
  };

  const confirmLogout = () => {
    const emailKey = profile?.email || "guest";
    storage.remove(`saleem_chat_history_${emailKey}`);
    storage.remove("saleem_chat_history");
    const wasGuest = profile?.isGuest;
    logoutCurrentUser();
    tokenStore.clearTokens();
    setApiProducts([]);
    setApiSpecialists([]);
    setApiLoaded(false);
    storage.remove("saleem_profile");
    storage.remove("saleem_active_view");
    storage.remove("saleem_active_page");
    setProfile({ firstName: "", lastName: "", allergens: [], onboardingComplete: false });
    setCurrentUsername(null);
    setView(wasGuest ? "login" : "landing");
    setShowLogoutModal(false);
  };

  const handleNavigate = (page: string) => {
    if (profile.isGuest && (page === "chat" || page === "directory" || page === "allergens" || page === "home" || page === "wiki")) {
      confirmLogout();
      return;
    }
    if (page === "admin") {
      if (profile?.role === "Admin") setView("admin");
      else setToast(effectiveLang === "ar" ? "غير مصرح بالدخول للوحة الإدارة" : "Unauthorized admin dashboard access");
      return;
    }
    if (page === "allergens") { setView("onboarding"); return; }
    setActivePage(page);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'DM Sans', sans-serif; background: ${T.gray}; color: ${T.text}; }
      `}</style>

      {/* DB connection error banner */}
      {dataError && view === "admin" && (
        <div style={{
          background: "#FEE2E2", color: "#991B1B", padding: "12px 24px",
          textAlign: "center", fontSize: 14, fontWeight: 600, borderBottom: "2px solid #FCA5A5"
        }}>
          ⚠️ {dataError}
        </div>
      )}

      {view === "landing" && (
        <LandingPage
          onContinue={() => setView("login")}
          onBrowseGuest={() => {
            const guestProfile = { firstName: "Guest", lastName: "User", allergens: [], onboardingComplete: false, isGuest: true };
            const tempUsername = "guest_" + Math.random().toString(36).substr(2, 5);
            setCurrentUsername(tempUsername);
            localStorage.setItem("saleem_current_user", tempUsername);
            setProfile(guestProfile);
            storage.set("saleem_profile", guestProfile);
            setView("app");
            setActivePage("intro");
          }}
          lang={lang}
          onLangChange={setLang}
        />
      )}

      {view === "login" && (
        <LoginPage
          onLogin={handleLogin}
          onSignupClick={() => setView("signup")}
          onBackToIntro={() => setView("landing")}
          onGuestLogin={() => {
            const guestProfile = { firstName: "Guest", lastName: "User", allergens: [], onboardingComplete: false, isGuest: true };
            const tempUsername = "guest_" + Math.random().toString(36).substr(2, 5);
            setCurrentUsername(tempUsername);
            localStorage.setItem("saleem_current_user", tempUsername);
            setProfile(guestProfile);
            storage.set("saleem_profile", guestProfile);
            setView("app");
            setActivePage("intro");
          }}
          lang={lang}
          onLangChange={setLang}
        />
      )}

      {view === "tour" && (
        <TourPage onComplete={() => {
          const savedProfile = storage.get("saleem_profile", null);
          const isGuest = savedProfile?.isGuest || profile?.isGuest;
          setView(isGuest ? "signup" : "onboarding");
        }} />
      )}

      {view === "signup" && (
        <SignupPage onSignupComplete={handleLogin} onBackToLogin={() => setView("login")} lang={lang} onLangChange={setLang} />
      )}

      {view === "onboarding" && (
        <AssessmentPage
          onSave={handleSaveAssessment}
          initialProfile={profile}
          username={currentUsername}
          onProfileUpdate={(newUsername, newProfile) => {
            if (newUsername !== currentUsername) setCurrentUsername(newUsername);
            setProfile(newProfile);
            storage.set("saleem_profile", newProfile);
          }}
          lang={effectiveLang}
        />
      )}

      {view === "admin" && (
        <AdminDashboard
          lang={effectiveLang}
          onLogout={() => setShowLogoutModal(true)}
          activities={activities}
          adminProducts={allProductsMerged}
          defaultProductsOverrides={[]}
          adminSpecialists={allSpecialistsMerged}
          hiddenProductIds={[]}
          hiddenSpecialistIds={[]}
          allUsers={allUsers}
          onAddProduct={handleAddProduct}
          onDeleteAdminProduct={handleDeleteProduct}
          onUpdateProduct={handleUpdateProduct}
          onToggleProductHide={handleToggleProductHide}
          onAddSpecialist={handleAddSpecialist}
          onDeleteAdminSpecialist={handleDeleteAdminSpecialist}
          onHideDefaultSpecialist={handleHideDefaultSpecialist}
          onRestoreSpecialist={handleRestoreSpecialist}
          deletedSpecialistIds={[]}
          defaultSpecialistsOverrides={[]}
          onUpdateSpecialist={handleUpdateSpecialist}
          onDeleteUser={handleDeleteUser}
          onUpdateUser={handleUpdateUser}
          onUpdateUserRole={handleUpdateUserRole}
          onLogActivity={handleLogActivity}
          userCount={allUsers.length}
          onSwitchToApp={() => { setView("app"); setActivePage("home"); }}
        />
      )}

      {view === "app" && (
        <div style={{ display: "flex", height: "100vh", overflow: "hidden", flexDirection: effectiveLang === "ar" ? "row-reverse" : "row" }}>
          <Sidebar activePage={activePage} onNavigate={handleNavigate} profile={profile} username={currentUsername} lang={effectiveLang} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden", position: "relative" }}>
            <Topbar title={activePage} onLogout={() => setShowLogoutModal(true)} isGuest={profile.isGuest} activeGuestPage={activePage} onNavigateGuest={handleNavigate} lang={lang} onLangChange={setLang} />
            <div style={{ flex: 1, overflowY: "auto", width: "100%" }}>
              {activePage === "home" && (
                <HomePage
                  profile={profile}
                  products={visibleProducts}
                  totalProductCount={allProductsMerged.length}
                  username={currentUsername}
                  onNavigateFeed={() => setActivePage("feed")}
                  onProfileUpdate={(newU, newP) => { setCurrentUsername(newU); setProfile(newP); }}
                  isGuest={profile.isGuest}
                  onInteractionRequired={confirmLogout}
                  lang={effectiveLang}
                />
              )}
              {activePage === "intro" && <GuestIntroPage onStartBrowsing={() => setActivePage("feed")} lang={effectiveLang} />}
              {activePage === "feed" && <FeedPage products={visibleProducts} isGuest={profile.isGuest} isLoading={profile.isGuest ? guestLoading : false} onInteractionRequired={() => setView("login")} lang={effectiveLang} />}
              {activePage === "chat" && <ChatPage profile={profile} lang={effectiveLang} onLangChange={setLang} />}
              {activePage === "wiki" && (
                <WikiPage
                  lang={effectiveLang}
                  profile={profile}
                  onUpdateProfile={(updatedProfile: any) => { setProfile(updatedProfile); storage.set("saleem_profile", updatedProfile); }}
                />
              )}
              {activePage === "directory" && <DirectoryPage specialists={visibleSpecialists} lang={effectiveLang} />}
              {activePage === "allergens" && (
                <AssessmentPage
                  onSave={(newAllergenList) => {
                    handleSaveAssessment(newAllergenList);
                    setActivePage("home");
                    setToast(effectiveLang === "ar" ? "تم تحديث إعدادات مسببات الحساسية!" : "Allergen settings updated!");
                  }}
                  initialProfile={profile}
                  username={currentUsername}
                  onProfileUpdate={(newUsername, newProfile) => {
                    if (newUsername !== currentUsername) setCurrentUsername(newUsername);
                    setProfile(newProfile);
                    storage.set("saleem_profile", newProfile);
                  }}
                  isEmbedded={true}
                  lang={effectiveLang}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {showLogoutModal && <LogoutModal onConfirm={confirmLogout} onCancel={() => setShowLogoutModal(false)} isGuest={profile?.isGuest} lang={effectiveLang} />}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </>
  );
}
