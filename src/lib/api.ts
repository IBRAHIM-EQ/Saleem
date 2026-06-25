/**
 * api.ts — Saleem Frontend ↔ ASP.NET Core Backend
 * Base URL: https://localhost:7175 (set via VITE_API_BASE_URL in .env)
 *
 * Covers:
 *   Auth        → /api/auth/register | login | refresh-token
 *   Profile     → /api/profile/me | PUT /api/profile/allergies
 *   Products    → /api/products (GET, GET/:id, safe-for-me, search, safe-search, :id/alternatives, :id/suitability)
 *   Specialists → /api/specialists (GET, GET/:id)
 *   Chat        → POST /api/chat | GET /api/chat/history
 *   Admin       → /api/admin/* (dashboard, products, brands, specialists, users)
 */



const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ─────────────────────────────────────────────
// Token helpers (localStorage — tokens only, not data)
// ─────────────────────────────────────────────
const TOKEN_KEY    = "saleem_access_token";
const REFRESH_KEY  = "saleem_refresh_token";

export const tokenStore = {
  getAccess:    ()             => localStorage.getItem(TOKEN_KEY),
  getRefresh:   ()             => localStorage.getItem(REFRESH_KEY),
  setTokens:    (a: string, r: string) => {
    localStorage.setItem(TOKEN_KEY, a);
    localStorage.setItem(REFRESH_KEY, r);
  },
  clearTokens:  () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

// ─────────────────────────────────────────────
// Core fetch wrapper — auto-attaches JWT, retries once on 401
// ─────────────────────────────────────────────
async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  const token = tokenStore.getAccess();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  // Try to refresh on 401
  if (res.status === 401 && retry) {
    const refreshed = await tryRefreshToken();
    if (refreshed) return apiFetch<T>(path, options, false);
    tokenStore.clearTokens();
    window.dispatchEvent(new CustomEvent("saleem:session-expired"));
    throw new ApiError(401, "Session expired. Please login again.");
  }

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const body = await res.text(); if (body) msg = body; } catch {}
    throw new ApiError(res.status, msg);
  }

  // 204 No Content
  const text = await res.text();
  return text ? JSON.parse(text) as T : {} as T;
}

async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${BASE_URL}/api/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    tokenStore.setTokens(data.accessToken, data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────
// Anonymous fetch — NO JWT, NO session-expired side-effect.
// Use this for public/guest endpoints that do not require auth.
// A 401 here is treated as a plain error (network/config issue),
// never as a session expiry that should log the user out.
// ─────────────────────────────────────────────
async function apiFetchAnonymous<T>(path: string): Promise<T> {
  console.log(`[DEBUG Network] apiFetchAnonymous called: GET ${path}`);
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
  });
  console.log(`[DEBUG Network] apiFetchAnonymous response status:`, res.status);
  
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const body = await res.text(); if (body) msg = body; } catch {}
    console.error(`[DEBUG Network] apiFetchAnonymous failed with:`, msg);
    throw new ApiError(res.status, msg);
  }
  const text = await res.text();
  console.log(`[DEBUG Network] apiFetchAnonymous raw body length:`, text.length);
  if (text.length < 500) {
    console.log(`[DEBUG Network] apiFetchAnonymous raw body preview:`, text);
  } else {
    console.log(`[DEBUG Network] apiFetchAnonymous raw body preview:`, text.substring(0, 500) + '...');
  }
  return text ? JSON.parse(text) as T : {} as T;
}

// ─────────────────────────────────────────────
// Google Maps URL resolver — follows short links
// (maps.app.goo.gl) server-side to get full URL
// so the frontend can extract lat/lng coordinates.
// ─────────────────────────────────────────────
export async function resolveMapUrl(url: string): Promise<string> {
  if (!url) return url;
  // Only short Google Maps links lack embedded coords
  if (!url.includes("maps.app.goo.gl") && !url.includes("goo.gl")) return url;
  try {
    // No auth needed — plain fetch, no JWT header
    const res = await fetch(
      `${BASE_URL}/api/utils/resolve-maps?url=${encodeURIComponent(url)}`
    );
    if (!res.ok) return url;
    const data = await res.json();
    return data.resolvedUrl || url;
  } catch {
    return url;
  }
}

// ─────────────────────────────────────────────
// Proactive token refresh scheduler
// Call once after login; returns a cleanup fn.
// Decodes the JWT exp claim and schedules a
// refresh 60 s before expiry.  If the refresh
// fails it dispatches "saleem:session-expired"
// so App.tsx can force a logout.
// ─────────────────────────────────────────────
export function setupTokenRefresh(onExpired: () => void): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null;

  function schedule() {
    if (timer) clearTimeout(timer);
    const token = tokenStore.getAccess();
    if (!token) { onExpired(); return; }
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const msLeft = payload.exp * 1000 - Date.now();
      const refreshIn = Math.max(0, msLeft - 60_000); // 60 s before expiry
      timer = setTimeout(async () => {
        const ok = await tryRefreshToken();
        if (ok) schedule();      // new token → reschedule
        else     onExpired();    // refresh failed → force logout
      }, refreshIn);
    } catch {
      onExpired();
    }
  }

  schedule();
  return () => { if (timer) clearTimeout(timer); };
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────
export interface AuthResponse {
  accessToken:  string;
  refreshToken: string;
  email:        string;
  fullName:     string;
  role:         string;
}

export const authApi = {
  /** POST /api/auth/register */
  register: (data: {
    firstName: string; lastName: string; email: string; password: string;
  }) =>
    apiFetch<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** POST /api/auth/login */
  login: (data: { email: string; password: string }) =>
    apiFetch<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** POST /api/auth/refresh-token */
  refreshToken: (refreshToken: string) =>
    apiFetch<AuthResponse>("/api/auth/refresh-token", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }),
};

// ─────────────────────────────────────────────
// PROFILE
// ─────────────────────────────────────────────
export interface UserProfileDto {
  id:                 number;
  firstName:          string;
  lastName:           string;
  email:              string;
  role:               string;
  onboardingComplete: boolean;
  allergies:          { allergenKey: string; severity: string }[];
}

export const profileApi = {
  /** GET /api/profile/me */
  getMe: () => apiFetch<UserProfileDto>("/api/profile/me"),

  /** PUT /api/profile/allergies */
  updateAllergies: (allergies: { allergenKey: string; severity: string }[]) =>
    apiFetch<{ message: string; allergies: any[] }>("/api/profile/allergies", {
      method: "PUT",
      body: JSON.stringify({ allergies }),
    }),
};

// ─────────────────────────────────────────────
// PRODUCTS
// ─────────────────────────────────────────────
export interface StoreDto {
  id:            number;
  name:          string;
  location:      string;
  googleMapsUrl: string;
  isHidden:      boolean;
}

export interface ProductBrandDto {
  id:        number;
  productId: number;
  name:      string;
  isHidden:  boolean;
  stores:    StoreDto[];
}

export interface ProductDto {
  id:            number;
  name:          string;
  brand:         string;
  category:      string;
  allergenKey:   string;
  isSafe:        boolean;
  isHidden:      boolean;
  description:   string;
  imageUrl:      string;
  productBrands: ProductBrandDto[];
}

export interface ProductSuitabilityDto {
  productId:        number;
  isSuitableForUser: boolean;
  reason:           string;
  matchedAllergens: string[];
}

export const productsApi = {
  /** GET /api/products — authenticated path (for logged-in users) */
  getAll: () => apiFetch<ProductDto[]>("/api/products"),

  /** GET /api/products — anonymous path (for guest browsing, no JWT, no 401 side-effects) */
  getAllPublic: () => apiFetchAnonymous<ProductDto[]>("/api/products"),

  /** GET /api/products/:id */
  getById: (id: number) => apiFetch<ProductDto>(`/api/products/${id}`),

  /** GET /api/products/safe-for-me */
  getSafeForMe: () => apiFetch<ProductDto[]>("/api/products/safe-for-me"),

  /** GET /api/products/search?query= */
  search: (query: string) =>
    apiFetch<ProductDto[]>(`/api/products/search?query=${encodeURIComponent(query)}`),

  /** GET /api/products/safe-search?query= */
  safeSearch: (query: string) =>
    apiFetch<ProductDto[]>(`/api/products/safe-search?query=${encodeURIComponent(query)}`),

  /** GET /api/products/:id/alternatives */
  getAlternatives: (id: number) =>
    apiFetch<ProductDto[]>(`/api/products/${id}/alternatives`),

  /** GET /api/products/:id/suitability */
  checkSuitability: (id: number) =>
    apiFetch<ProductSuitabilityDto>(`/api/products/${id}/suitability`),
};

// ─────────────────────────────────────────────
// SPECIALISTS
// ─────────────────────────────────────────────
export interface SpecialistDto {
  id:              number;
  name:            string;
  title:           string;
  bio:             string;
  email:           string;
  phoneNumber:     string;
  whatsAppNumber:  string;
  experienceYears: number;
  rating:          number;
  reviewsCount:    number;
  isHidden:        boolean;
  imageUrl:        string;
}

export const specialistsApi = {
  /** GET /api/specialists */
  getAll: () => apiFetch<SpecialistDto[]>("/api/specialists"),

  /** GET /api/specialists/:id */
  getById: (id: number) => apiFetch<SpecialistDto>(`/api/specialists/${id}`),
};

// ─────────────────────────────────────────────
// CHAT (Gemini via Backend)
// ─────────────────────────────────────────────
export interface ChatResponseDto    { reply: string }
export interface ChatHistoryItemDto { id: number; userMessage: string; botReply: string; createdAt: string }

export const chatApi = {
  /** POST /api/chat — send a message, get AI reply */
  sendMessage: (message: string) =>
    apiFetch<ChatResponseDto>("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message }),
    }),

  /** GET /api/chat/history */
  getHistory: () => apiFetch<ChatHistoryItemDto[]>("/api/chat/history"),
};

// ─────────────────────────────────────────────
// ADMIN — Products
// ─────────────────────────────────────────────
export interface CreateProductDto {
  name:        string;
  brand:       string;
  category:    string;
  allergenKey: string;
  isSafe:      boolean;
  description: string;
  imageUrl:    string;
}

export interface UpdateProductDto extends Partial<CreateProductDto> { id: number }

export const adminProductsApi = {
  /** GET /api/admin/products */
  getAll: () => apiFetch<ProductDto[]>("/api/admin/products"),

  /** POST /api/admin/products */
  create: (data: CreateProductDto) =>
    apiFetch<ProductDto>("/api/admin/products", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** PUT /api/admin/products/:id */
  update: (id: number, data: Partial<CreateProductDto>) =>
    apiFetch<ProductDto>(`/api/admin/products/${id}`, {
      method: "PUT",
      body: JSON.stringify({ id, ...data }),
    }),

  /** DELETE /api/admin/products/:id */
  delete: (id: number) =>
    apiFetch<void>(`/api/admin/products/${id}`, { method: "DELETE" }),

  /** PATCH /api/admin/products/:id/toggle-hide */
  toggleHide: (id: number) =>
    apiFetch<void>(`/api/admin/products/${id}/toggle-hide`, { method: "PATCH" }),
};

// ─────────────────────────────────────────────
// ADMIN — Product Brands
// ─────────────────────────────────────────────
export interface CreateBrandDto {
  productId: number;
  name:      string;
}

export interface CreateStoreDto {
  brandId:       number;
  name:          string;
  location:      string;
  googleMapsUrl: string;
}

export const adminBrandsApi = {
  /** GET /api/admin/products/:productId/brands */
  getByProduct: (productId: number) =>
    apiFetch<ProductBrandDto[]>(`/api/admin/products/${productId}/brands`),

  /** POST /api/admin/products/:productId/brands */
  create: (productId: number, name: string) =>
    apiFetch<ProductBrandDto>(`/api/admin/products/${productId}/brands`, {
      method: "POST",
      body: JSON.stringify({ name }),
    }),

  /** PUT /api/admin/products/:productId/brands/:brandId */
  update: (productId: number, brandId: number, data: Partial<CreateBrandDto>) =>
    apiFetch<ProductBrandDto>(`/api/admin/products/${productId}/brands/${brandId}`, {
      method: "PUT",
      body: JSON.stringify({ id: brandId, ...data }),
    }),

  /** DELETE /api/admin/products/:productId/brands/:brandId */
  delete: (productId: number, brandId: number) =>
    apiFetch<void>(`/api/admin/products/${productId}/brands/${brandId}`, { method: "DELETE" }),

  /** PATCH /api/admin/products/:productId/brands/:brandId/hide or /show */
  toggleHide: (productId: number, brandId: number, currentIsHidden: boolean) =>
    apiFetch<void>(
      `/api/admin/products/${productId}/brands/${brandId}/${currentIsHidden ? "show" : "hide"}`,
      { method: "PATCH" }
    ),

  /** POST /api/admin/brands/:brandId/stores */
  addStore: (brandId: number, data: Omit<CreateStoreDto, "brandId">) =>
    apiFetch<StoreDto>(`/api/admin/brands/${brandId}/stores`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** PUT /api/admin/brands/:brandId/stores/:storeId */
  updateStore: (brandId: number, storeId: number, data: { name: string; location: string; googleMapsUrl: string; isHidden?: boolean }) =>
    apiFetch<StoreDto>(`/api/admin/brands/${brandId}/stores/${storeId}`, {
      method: "PUT",
      body: JSON.stringify({ ...data, isHidden: data.isHidden ?? false }),
    }),

  /** DELETE /api/admin/brands/:brandId/stores/:storeId */
  deleteStore: (brandId: number, storeId: number) =>
    apiFetch<void>(`/api/admin/brands/${brandId}/stores/${storeId}`, { method: "DELETE" }),
};

// ─────────────────────────────────────────────
// ADMIN — Specialists
// ─────────────────────────────────────────────
export interface CreateSpecialistDto {
  name:            string;
  title:           string;
  bio:             string;
  email:           string;
  phoneNumber:     string;
  whatsAppNumber:  string;
  experienceYears: number;
  rating:          number;
  reviewsCount:    number;
  imageUrl:        string;
}

export const adminSpecialistsApi = {
  /** GET /api/admin/specialists */
  getAll: () => apiFetch<SpecialistDto[]>("/api/admin/specialists"),

  /** POST /api/admin/specialists */
  create: (data: CreateSpecialistDto) =>
    apiFetch<SpecialistDto>("/api/admin/specialists", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** PUT /api/admin/specialists/:id */
  update: (id: number, data: Partial<CreateSpecialistDto>) =>
    apiFetch<SpecialistDto>(`/api/admin/specialists/${id}`, {
      method: "PUT",
      body: JSON.stringify({ id, ...data }),
    }),

  /** DELETE /api/admin/specialists/:id */
  delete: (id: number) =>
    apiFetch<void>(`/api/admin/specialists/${id}`, { method: "DELETE" }),

  /** PATCH /api/admin/specialists/:id/toggle-hide */
  toggleHide: (id: number) =>
    apiFetch<void>(`/api/admin/specialists/${id}/toggle-hide`, { method: "PATCH" }),
};

// ─────────────────────────────────────────────
// ADMIN — Users
// ─────────────────────────────────────────────
export interface AdminUserDto {
  id:                 number;
  firstName:          string;
  lastName:           string;
  email:              string;
  role:               string;
  onboardingComplete: boolean;
  createdAt:          string;
}

export interface UpdateUserDto {
  firstName: string;
  lastName:  string;
  email:     string;
  password?: string;
}

export const adminUsersApi = {
  getAll: () => apiFetch<AdminUserDto[]>("/api/admin/users"),

  delete: (id: number) =>
    apiFetch<void>(`/api/admin/users/${id}`, { method: "DELETE" }),

  updateRole: (id: number, role: string) =>
    apiFetch<void>(`/api/admin/users/${id}/role`, {
      method: "PUT",
      body: JSON.stringify({ role }),
    }),

  updateUser: (id: number, data: UpdateUserDto) =>
    apiFetch<void>(`/api/admin/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

// ─────────────────────────────────────────────
// ADMIN — Dashboard Stats
// ─────────────────────────────────────────────
export interface AdminDashboardStatsDto {
  totalUsers:          number;
  totalProducts:       number;
  totalProductBrands:  number;
  totalStores:         number;
  totalSpecialists:    number;
  hiddenProducts:      number;
  hiddenProductBrands: number;
  hiddenStores:        number;
  hiddenSpecialists:   number;
}

export const adminDashboardApi = {
  /** GET /api/admin/dashboard/stats */
  getStats: () => apiFetch<AdminDashboardStatsDto>("/api/admin/dashboard/stats"),
};
