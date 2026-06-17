/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from "react";
import { T } from "../constants";
import { MapPin, ExternalLink, X, Tag, Globe, Navigation, Phone, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { mapAllergenName } from "../lib/allergyService";
import { productsApi, resolveMapUrl } from "../lib/api";

interface Store {
  id: number;
  name: string;
  location: string;
  googleMapsUrl?: string;
  link?: string;
  distance?: number;
  phone?: string;
}

interface Brand {
  id: number;
  name: string;
  isHidden: boolean;
  stores: Store[];
}

interface ProductModalProps {
  product: any;
  onClose: () => void;
  lang?: "ar" | "en";
}

// ─────────────────────────────────────────────
// Location permission stored in sessionStorage:
//   "saleem_location_granted" = "true" | "false" | "denied"
//   "saleem_user_lat" / "saleem_user_lng" = coordinates
// This means the GPS prompt appears only ONCE per browser session.
// ─────────────────────────────────────────────
const LOCATION_GRANTED_KEY = "saleem_location_granted";
const LOCATION_LAT_KEY     = "saleem_user_lat";
const LOCATION_LNG_KEY     = "saleem_user_lng";

function getCachedCoords(): { latitude: number; longitude: number } | null {
  try {
    const granted = sessionStorage.getItem(LOCATION_GRANTED_KEY);
    if (granted !== "true") return null;
    const lat = parseFloat(sessionStorage.getItem(LOCATION_LAT_KEY) || "");
    const lng = parseFloat(sessionStorage.getItem(LOCATION_LNG_KEY) || "");
    if (isNaN(lat) || isNaN(lng)) return null;
    return { latitude: lat, longitude: lng };
  } catch {
    return null;
  }
}

function cacheCoords(lat: number, lng: number) {
  try {
    sessionStorage.setItem(LOCATION_GRANTED_KEY, "true");
    sessionStorage.setItem(LOCATION_LAT_KEY, String(lat));
    sessionStorage.setItem(LOCATION_LNG_KEY, String(lng));
  } catch {}
}

function markLocationDenied() {
  try {
    sessionStorage.setItem(LOCATION_GRANTED_KEY, "denied");
  } catch {}
}

function locationWasDecided(): boolean {
  try {
    const v = sessionStorage.getItem(LOCATION_GRANTED_KEY);
    return v === "true" || v === "denied" || v === "false";
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────
// Get coordinates for a store.
// Priority:
//   1. Pre-stored lat/lng on the store object (set by admin form)
//   2. Extracted from googleMapsUrl / link (full URLs only)
//   3. null — distance will show as "unavailable"
// ─────────────────────────────────────────────
function getStoreCoordsFromObject(store: Store): { latitude: number; longitude: number } | null {
  // 1. Pre-stored by admin (works for short links too)
  const lat = (store as any).lat;
  const lng = (store as any).lng;
  if (lat != null && lng != null && !isNaN(Number(lat)) && !isNaN(Number(lng))) {
    return { latitude: Number(lat), longitude: Number(lng) };
  }

  // 2. Try to extract from the Maps URL
  const url = store.googleMapsUrl || (store as any).link || "";
  if (!url) return null;

  const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) return { latitude: parseFloat(atMatch[1]), longitude: parseFloat(atMatch[2]) };

  const qMatch = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (qMatch) return { latitude: parseFloat(qMatch[1]), longitude: parseFloat(qMatch[2]) };

  const llMatch = url.match(/[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (llMatch) return { latitude: parseFloat(llMatch[1]), longitude: parseFloat(llMatch[2]) };

  return null;
}

// ─────────────────────────────────────────────
// Haversine formula — returns distance in km
// ─────────────────────────────────────────────
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function ProductModal({ product, onClose, lang = "en" }: ProductModalProps) {
  const [selectedBrand,   setSelectedBrand]   = useState<Brand | null>(null);
  const [showGpsPrompt,   setShowGpsPrompt]   = useState(false);
  const [gpsBlocked,      setGpsBlocked]      = useState(false);  // browser denied at OS/settings level
  const [freshBrands,   setFreshBrands]   = useState<Brand[] | null>(null);
  const [loadingBrands, setLoadingBrands] = useState(true);
  // storeId → resolved full Maps URL (populated when brand is selected)
  const [resolvedUrls, setResolvedUrls] = useState<Record<number, string>>({});

  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(
    () => getCachedCoords()
  );

  // ── Fetch fresh brands+stores when modal opens ──
  useEffect(() => {
    const id = Number(product.id);
    if (!id) { setLoadingBrands(false); return; }
    setLoadingBrands(true);
    productsApi.getById(id)
      .then(fresh => {
        const list = (fresh.productBrands || [])
          .filter((b: Brand) => !b.isHidden);
        setFreshBrands(list);
      })
      .catch(() => setFreshBrands(null))
      .finally(() => setLoadingBrands(false));
  }, [product.id]);

  // Use fresh API data; fall back to embedded product data
  const brands: Brand[] = useMemo(() => {
    const source = freshBrands ?? (product.localBrands || product.productBrands || []);
    return (source as Brand[]).filter(b => !b.isHidden);
  }, [freshBrands, product]);

  // ── Resolve short Maps URLs when a brand is selected ──
  useEffect(() => {
    if (!selectedBrand?.stores?.length) return;
    selectedBrand.stores.forEach(async (s) => {
      const url = s.googleMapsUrl || (s as any).link || "";
      if (!url || resolvedUrls[s.id]) return;
      const resolved = await resolveMapUrl(url);
      if (resolved !== url) {
        setResolvedUrls(prev => ({ ...prev, [s.id]: resolved }));
      }
    });
  }, [selectedBrand]);

  // ── GPS helpers ──
  const brandHasLocatableStores = (brand: Brand) =>
    (brand.stores || []).some(s => {
      const url = s.googleMapsUrl || (s as any).link || "";
      return getStoreCoordsFromObject({ ...s, googleMapsUrl: url }) !== null;
    });

  const selectBrand = (brand: Brand) => setSelectedBrand(brand);

  const handleBrandClick = (brand: Brand) => {
    // Toggle off
    if (selectedBrand?.id === brand.id) { setSelectedBrand(null); return; }

    // Always select the brand immediately so stores always appear
    selectBrand(brand);

    // Then ask for GPS if store has coords but we don't have user location yet
    if (brandHasLocatableStores(brand) && !userCoords && !locationWasDecided()) {
      setShowGpsPrompt(true);
    }
  };

  const handleAllowLocation = async () => {
    if (!navigator.geolocation) {
      setGpsBlocked(true);
      return;
    }

    // Check browser-level permission before calling getCurrentPosition
    try {
      const perm = await navigator.permissions.query({ name: "geolocation" as PermissionName });
      if (perm.state === "denied") {
        // Browser has blocked geolocation — can't prompt, show instructions
        setGpsBlocked(true);
        return;
      }
    } catch {
      // permissions API not supported — fall through and try anyway
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        cacheCoords(coords.latitude, coords.longitude);
        setUserCoords(coords);
        setGpsBlocked(false);
        setShowGpsPrompt(false);
      },
      (err) => {
        if (err.code === 1 /* PERMISSION_DENIED */) {
          setGpsBlocked(true);
        } else {
          markLocationDenied();
          setShowGpsPrompt(false);
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
    );
  };

  const handleDeclineLocation = () => {
    markLocationDenied();
    setGpsBlocked(false);
    setShowGpsPrompt(false);
  };

  // ── Stores: filter empty, compute distance, sort ──
  const sortedStores = useMemo(() => {
    if (!selectedBrand?.stores) return [];

    const usable = selectedBrand.stores.filter(
      s => s.name?.trim() || s.location?.trim() || s.googleMapsUrl?.trim()
    );

    const withDist = usable.map(s => {
      // Use resolved URL (if short link was expanded) for coordinate extraction
      const effectiveUrl = resolvedUrls[s.id] || s.googleMapsUrl || (s as any).link || "";
      const storeCoords = getStoreCoordsFromObject({ ...s, googleMapsUrl: effectiveUrl });
      let distance: number | undefined;
      if (userCoords && storeCoords) {
        distance = haversineKm(
          userCoords.latitude, userCoords.longitude,
          storeCoords.latitude, storeCoords.longitude
        );
      } else if ((s as any).distance != null) {
        distance = (s as any).distance;
      }
      return { ...s, distance };
    });

    return withDist.sort((a, b) => {
      if (a.distance == null && b.distance == null) return 0;
      if (a.distance == null) return 1;
      if (b.distance == null) return -1;
      return a.distance - b.distance;
    });
  }, [selectedBrand, userCoords, resolvedUrls]);

  const mapAllergen = (key: string) => {
    if (!key || key.toLowerCase() === "none") return lang === "ar" ? "آمن / لا يسبب حساسية" : "Safe / No conflict";
    return mapAllergenName(key, lang);
  };

  const allergenKey = product.allergenKey || product.allergen || "";
  const allergenLabel = allergenKey ? mapAllergen(allergenKey) : (lang === "ar" ? "آمن" : "Allergen-Free");
  // Hide category if it duplicates the product name or the allergen key
  const categoryLabel =
    product.category &&
    product.category !== product.name &&
    product.category.toLowerCase() !== allergenKey.toLowerCase()
      ? product.category
      : null;

  const t = {
    availableBrands:  lang === "ar" ? "العلامات التجارية المتاحة" : "Available Brands",
    storesSelling:    lang === "ar" ? "متاجر تبيع" : "Stores selling",
    sortedProximity:  lang === "ar" ? "مرتبة حسب القرب" : "Sorted by proximity",
    kmAway:           lang === "ar" ? "كم" : "km away",
    distanceUnknown:  lang === "ar" ? "المسافة غير متوفرة" : "Distance unavailable",
    noBranchInfo:     lang === "ar" ? "لا تتوفر بيانات المتاجر بعد" : "No store data available yet",
    selectBrand:      lang === "ar" ? "اختر علامة تجارية لعرض المتاجر" : "Select a brand to view stores",
    availabilitySoon: lang === "ar" ? "معلومات التوفر ستضاف قريباً" : "Availability info coming soon",
    close:            lang === "ar" ? "إغلاق" : "Close",
    loading:          lang === "ar" ? "جاري تحميل البيانات..." : "Loading store data...",
    callFirst:        lang === "ar" ? "اتصل بالمتجر للتأكد من توفر المنتج قبل الزيارة." : "Call the store to confirm availability before visiting.",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(15,23,42,0.6)", backdropFilter: "blur(12px)",
        zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        style={{
          background: "white", borderRadius: 32, maxWidth: 600, width: "100%",
          maxHeight: "90vh", overflowY: "auto", position: "relative",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.3)",
          direction: lang === "ar" ? "rtl" : "ltr",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div style={{
          padding: "28px 28px 20px", borderBottom: "1px solid #F1F5F9",
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          gap: 16, flexDirection: lang === "ar" ? "row-reverse" : "row",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, flexDirection: lang === "ar" ? "row-reverse" : "row", flex: 1, minWidth: 0 }}>
            {/* Product image */}
            <div style={{
              width: 72, height: 72, flexShrink: 0, borderRadius: 20, background: "#F8FAFC",
              display: "flex", alignItems: "center", justifyContent: "center",
              overflow: "hidden", border: "1px solid #E2E8F0",
            }}>
              {product.imageUrl
                ? <img src={product.imageUrl} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} referrerPolicy="no-referrer" />
                : <span style={{ fontSize: 40 }}>{product.emoji || "📦"}</span>}
            </div>
            {/* Product info */}
            <div style={{ textAlign: lang === "ar" ? "right" : "left", minWidth: 0 }}>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: T.text, margin: 0 }}>{product.name}</h2>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, marginTop: 6, flexDirection: lang === "ar" ? "row-reverse" : "row" }}>
                {categoryLabel && (
                  <>
                    <span style={{ fontSize: 12, color: T.grayDark, fontWeight: 600, background: "#F1F5F9", padding: "3px 10px", borderRadius: 20 }}>
                      {categoryLabel}
                    </span>
                    <span style={{ color: "#CBD5E1", fontSize: 12 }}>•</span>
                  </>
                )}
                <span style={{
                  fontSize: 12, fontWeight: 700,
                  color: allergenKey ? T.red : T.mintDark,
                  background: allergenKey ? "#FEF2F2" : "#ECFDF5",
                  padding: "3px 10px", borderRadius: 20,
                }}>
                  {allergenLabel}
                </span>
              </div>
              {product.description && product.description !== product.name && (
                <p style={{ fontSize: 12, color: T.grayDark, margin: "6px 0 0", lineHeight: 1.5 }}>{product.description}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ flexShrink: 0, background: "#F1F5F9", border: "none", borderRadius: 14, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: T.text }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: 28 }}>

          {/* ── Loading state ── */}
          {loadingBrands && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: 40, color: T.grayDark }}>
              <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
              <span style={{ fontWeight: 600, fontSize: 14 }}>{t.loading}</span>
            </div>
          )}

          {/* ── Brands list ── */}
          {!loadingBrands && brands.length > 0 && (
            <div style={{ marginBottom: 24, textAlign: lang === "ar" ? "right" : "left" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexDirection: lang === "ar" ? "row-reverse" : "row" }}>
                <Tag size={16} style={{ color: T.blue }} />
                <h3 style={{ fontSize: 14, fontWeight: 800, color: T.text, margin: 0 }}>{t.availableBrands}</h3>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", flexDirection: lang === "ar" ? "row-reverse" : "row" }}>
                {brands.map(brand => (
                  <button
                    key={brand.id}
                    onClick={() => handleBrandClick(brand)}
                    style={{
                      padding: "10px 18px", borderRadius: 14,
                      background: selectedBrand?.id === brand.id ? T.blue : "#F8FAFC",
                      color:      selectedBrand?.id === brand.id ? "white"  : T.text,
                      border: `1px solid ${selectedBrand?.id === brand.id ? T.blue : "#E2E8F0"}`,
                      fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.15s",
                      boxShadow: selectedBrand?.id === brand.id ? `0 6px 14px ${T.blue}25` : "none",
                    }}
                  >
                    {brand.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Stores section ── */}
          {!loadingBrands && (
            <AnimatePresence mode="wait">
              {selectedBrand ? (
                <motion.div
                  key={selectedBrand.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                >
                  <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    marginBottom: 16, flexDirection: lang === "ar" ? "row-reverse" : "row",
                  }}>
                    <h3 style={{ fontSize: 16, fontWeight: 900, margin: 0, textAlign: lang === "ar" ? "right" : "left" }}>
                      {lang === "ar"
                        ? <>{t.storesSelling} <span style={{ color: T.blue }}>{selectedBrand.name}</span></>
                        : <>{t.storesSelling} <span style={{ color: T.blue }}>{selectedBrand.name}</span></>}
                    </h3>
                    {userCoords ? (
                      <span style={{ fontSize: 11, color: T.mintDark, fontWeight: 700, background: "#ECFDF5", padding: "3px 10px", borderRadius: 20 }}>
                        📍 {lang === "ar" ? "مرتبة حسب قربها منك" : "Sorted nearest first"}
                      </span>
                    ) : (
                      <button
                        onClick={() => setShowGpsPrompt(true)}
                        style={{
                          display: "flex", alignItems: "center", gap: 6,
                          padding: "5px 12px", borderRadius: 20, border: `1px solid ${T.blue}`,
                          background: `${T.blue}10`, color: T.blue,
                          fontSize: 11, fontWeight: 700, cursor: "pointer",
                        }}
                      >
                        <MapPin size={12} />
                        {lang === "ar" ? "احسب المسافة 📍" : "Get distance 📍"}
                      </button>
                    )}
                  </div>

                  {sortedStores.length === 0 ? (
                    <div style={{ padding: 40, textAlign: "center", background: "#F8FAFC", borderRadius: 20, border: "2px dashed #E2E8F0" }}>
                      <MapPin size={28} style={{ color: "#CBD5E1", marginBottom: 10 }} />
                      <p style={{ color: T.grayDark, fontWeight: 600, margin: 0 }}>{t.noBranchInfo}</p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {sortedStores.map((store, idx) => {
                        const mapUrl = resolvedUrls[store.id] || store.googleMapsUrl || (store as any).link || "";
                        return (
                          <div key={store.id ?? idx} style={{
                            padding: 18, borderRadius: 18, border: "1px solid #F1F5F9", background: "#FAFBFC",
                            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                            flexDirection: lang === "ar" ? "row-reverse" : "row",
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0, flexDirection: lang === "ar" ? "row-reverse" : "row" }}>
                              {/* Icon */}
                              <div style={{ width: 42, height: 42, flexShrink: 0, borderRadius: 12, background: `${T.mint}15`, display: "flex", alignItems: "center", justifyContent: "center", color: T.mintDark }}>
                                <Globe size={20} />
                              </div>
                              {/* Info */}
                              <div style={{ textAlign: lang === "ar" ? "right" : "left", minWidth: 0 }}>
                                <div style={{ fontWeight: 800, fontSize: 15, color: T.text }}>{store.name || "—"}</div>
                                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, flexDirection: lang === "ar" ? "row-reverse" : "row" }}>
                                  <MapPin size={11} style={{ color: T.grayDark, flexShrink: 0 }} />
                                  <span style={{ fontSize: 12, color: T.grayDark, fontWeight: 600 }}>
                                    {store.location || (lang === "ar" ? "الموقع غير محدد" : "Location not specified")}
                                  </span>
                                  {store.distance != null && (
                                    <span style={{ fontSize: 12, fontWeight: 800, color: T.mintDark, background: "#ECFDF5", padding: "1px 8px", borderRadius: 12, flexShrink: 0 }}>
                                      {store.distance.toFixed(1)} {t.kmAway}
                                    </span>
                                  )}
                                  {store.distance == null && userCoords && (
                                    <span style={{ fontSize: 11, color: "#94A3B8", fontStyle: "italic" }}>
                                      {t.distanceUnknown}
                                    </span>
                                  )}
                                </div>
                                {(store as any).phone && (
                                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, flexDirection: lang === "ar" ? "row-reverse" : "row" }}>
                                    <Phone size={11} style={{ color: T.blue, flexShrink: 0 }} />
                                    <span style={{ fontSize: 12, color: T.text, fontWeight: 700, direction: "ltr" }}>{(store as any).phone}</span>
                                  </div>
                                )}
                                {(store as any).phone && (
                                  <p style={{ fontSize: 11, color: "#DC2626", margin: "4px 0 0", fontWeight: 600 }}>{t.callFirst}</p>
                                )}
                              </div>
                            </div>

                            {/* Navigate button */}
                            {mapUrl && (
                              <button
                                onClick={() => window.open(mapUrl, "_blank", "noopener,noreferrer")}
                                style={{
                                  flexShrink: 0, width: 42, height: 42, borderRadius: 12,
                                  background: T.blue, color: "white", border: "none", cursor: "pointer",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  boxShadow: `0 4px 12px ${T.blue}30`,
                                }}
                                title={lang === "ar" ? "فتح في خرائط جوجل" : "Open in Google Maps"}
                              >
                                <Navigation size={18} />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              ) : brands.length > 0 ? (
                <div style={{ padding: 36, textAlign: "center", background: "#F8FAFC", borderRadius: 20, border: "2px dashed #E2E8F0", color: T.grayDark }}>
                  <Tag size={24} style={{ opacity: 0.3, marginBottom: 10 }} />
                  <p style={{ fontWeight: 600, margin: 0, fontSize: 14 }}>{t.selectBrand}</p>
                </div>
              ) : (
                <div style={{ padding: 36, textAlign: "center", background: "#F8FAFC", borderRadius: 20, border: "2px dashed #E2E8F0", color: T.grayDark }}>
                  <p style={{ fontWeight: 600, margin: 0, fontSize: 14 }}>{t.availabilitySoon}</p>
                </div>
              )}
            </AnimatePresence>
          )}

          <button
            onClick={onClose}
            style={{ width: "100%", height: 52, background: "#F1F5F9", color: T.text, borderRadius: 16, border: "none", fontSize: 15, fontWeight: 800, cursor: "pointer", marginTop: 28 }}
          >
            {t.close}
          </button>
        </div>
      </motion.div>

      {/* ── GPS Permission Prompt ── */}
      <AnimatePresence>
        {showGpsPrompt && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(15,23,42,0.75)", backdropFilter: "blur(16px)",
              zIndex: 11000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
            }}
            onClick={handleDeclineLocation}
          >
            <motion.div
              initial={{ scale: 0.92, y: 15 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 15 }}
              style={{
                background: "white", borderRadius: 28, maxWidth: 420, width: "100%",
                padding: 32, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.4)",
                textAlign: "center", direction: lang === "ar" ? "rtl" : "ltr",
              }}
              onClick={e => e.stopPropagation()}
            >
              {gpsBlocked ? (
                /* ── Browser has blocked location ── */
                <>
                  <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", color: "#EF4444", margin: "0 auto 20px" }}>
                    <MapPin size={32} />
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 900, color: T.text, marginBottom: 12 }}>
                    {lang === "ar" ? "الوصول إلى الموقع محظور 🚫" : "Location Access Blocked 🚫"}
                  </h3>
                  <p style={{ fontSize: 13, lineHeight: 1.7, color: T.textMid, marginBottom: 0, fontWeight: 500, textAlign: lang === "ar" ? "right" : "left" }}>
                    {lang === "ar"
                      ? "لقد منع المتصفح الوصول إلى موقعك. لتفعيل المسافة:"
                      : "Your browser has blocked location access. To enable distances:"}
                  </p>
                  <ol style={{ fontSize: 12, lineHeight: 2, color: T.text, fontWeight: 600, margin: "12px 0 0", textAlign: lang === "ar" ? "right" : "left", paddingInlineStart: 20 }}>
                    <li>{lang === "ar" ? "انقر على أيقونة 🔒 أو 🌐 في شريط العنوان" : "Click the 🔒 or 🌐 icon in the browser address bar"}</li>
                    <li>{lang === "ar" ? 'اختر "الإعدادات" ثم "الموقع"' : 'Select "Site settings" → "Location"'}</li>
                    <li>{lang === "ar" ? 'غيّر الإعداد إلى "السماح"' : 'Change from "Block" to "Allow"'}</li>
                    <li>{lang === "ar" ? "أعد تحميل الصفحة وحاول مرة أخرى" : "Reload the page and try again"}</li>
                  </ol>
                  <button onClick={handleDeclineLocation} style={{ width: "100%", height: 44, background: "#F1F5F9", color: T.text, border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer", marginTop: 20 }}>
                    {lang === "ar" ? "متابعة بدون موقع" : "Continue Without Location"}
                  </button>
                </>
              ) : (
                /* ── Normal GPS prompt ── */
                <>
                  <div style={{ width: 64, height: 64, borderRadius: "50%", background: `${T.blue}10`, display: "flex", alignItems: "center", justifyContent: "center", color: T.blue, margin: "0 auto 20px" }}>
                    <MapPin size={32} />
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 900, color: T.text, marginBottom: 12 }}>
                    {lang === "ar" ? "السماح بالوصول إلى الموقع 📍" : "Allow Location Access 📍"}
                  </h3>
                  <p style={{ fontSize: 14, lineHeight: 1.6, color: T.textMid, marginBottom: 0, fontWeight: 500 }}>
                    {lang === "ar"
                      ? "سيُستخدم موقعك مرة واحدة فقط لحساب المسافة بينك وبين أقرب متجر."
                      : "Your location will be used once to calculate the distance to the nearest store."}
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 24 }}>
                    <button onClick={handleAllowLocation} style={{ width: "100%", height: 48, background: T.blue, color: "white", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 800, cursor: "pointer" }}>
                      {lang === "ar" ? "نعم، السماح ✅" : "Yes, Allow ✅"}
                    </button>
                    <button onClick={handleDeclineLocation} style={{ width: "100%", height: 48, background: "#F8FAFC", color: T.textMid, border: "1px solid #E2E8F0", borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                      {lang === "ar" ? "متابعة بدون موقع" : "Continue Without Location"}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
