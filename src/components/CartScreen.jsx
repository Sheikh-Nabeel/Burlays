import React, { useEffect, useRef, useState } from "react";
import { useCart } from "../contexts/CartContext";
import { FaTrash, FaArrowLeft, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Link, useNavigate, useLocation as useRouterLocation } from "react-router-dom";
import { auth, db } from "../firebase";
import { collection, doc, getDoc, getDocs, orderBy, query } from "firebase/firestore";

const COLORS = {
  primary: "#FFC72C",
  darkBg: "#000000",
  white: "#FFFFFF",
  gray: "#F1F3F4",
};

const CartScreen = () => {
  const {
    cartItems,
    removeFromCart,
    getTotalPrice,
    getTotalItems,
    updateQuantity,
  } = useCart();

  const routerLocation = useRouterLocation();
  const navigate = useNavigate();
  const [gstPercentage, setGstPercentage] = useState(0);
  const [menuItems, setMenuItems] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [recoLoading, setRecoLoading] = useState(false);
  const [isRecoPaused, setIsRecoPaused] = useState(false);
  const recoScrollRef = useRef(null);
  const recoSourceBranchIdRef = useRef(null);

  const currencySymbol = "Rs.";

  const total = getTotalPrice();

  // Fetch latest branch GST settings
  useEffect(() => {
    const fetchBranchDetails = async () => {
        const storedBranch = JSON.parse(localStorage.getItem('selectedBranch') || '{}');
        if (storedBranch.id) {
            // Set initial value from local storage
            if (storedBranch.gst) {
                setGstPercentage(Number(storedBranch.gst));
            }

            try {
                // Construct reference based on new schema: cities/{cityId}/branches/{branchId}
                let branchRef;
                if (storedBranch.cityId) {
                    branchRef = doc(db, 'cities', storedBranch.cityId, 'branches', storedBranch.id);
                } else {
                    // Fallback to global collection if cityId is missing (legacy support)
                     branchRef = doc(db, 'branches', storedBranch.id);
                }

                const branchSnap = await getDoc(branchRef);
                if (branchSnap.exists()) {
                    const branchData = branchSnap.data();
                    const newGst = Number(branchData.gst || 0);
                    setGstPercentage(newGst);
                    
                    // Update local storage to keep it fresh
                    localStorage.setItem('selectedBranch', JSON.stringify({ ...storedBranch, ...branchData }));
                }
            } catch (error) {
                console.error("Error fetching branch GST:", error);
                // Fallback to stored value
                setGstPercentage(Number(storedBranch.gst || 0));
            }
        }
    };
    fetchBranchDetails();
  }, []);

  useEffect(() => {
    const loadMenuItems = async () => {
      if (cartItems.length === 0) {
        setMenuItems([]);
        return;
      }

      const selectedBranch = JSON.parse(localStorage.getItem("selectedBranch") || "null");
      if (!selectedBranch?.id) return;

      if (recoSourceBranchIdRef.current === selectedBranch.id && menuItems.length > 0) return;
      recoSourceBranchIdRef.current = selectedBranch.id;

      const cacheKey = `menuCache_${selectedBranch.id}`;
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const flattened = parsed.flatMap((cat) =>
              (cat.products || []).filter(Boolean).map((prod) => ({
                ...prod,
                categoryId: cat.id,
                categoryName: cat.name,
              }))
            );
            setMenuItems(flattened.filter((p) => p && p.id && p.name));
            return;
          }
        } catch (e) {
          console.error("Menu cache parse error:", e);
        }
      }

      setRecoLoading(true);
      try {
        let categoriesRef;
        if (selectedBranch.cityId) {
          categoriesRef = collection(
            db,
            `cities/${selectedBranch.cityId}/branches/${selectedBranch.id}/categories`
          );
        } else {
          categoriesRef = collection(db, `branches/${selectedBranch.id}/categories`);
        }

        const categoriesSnapshot = await getDocs(query(categoriesRef, orderBy("order", "asc")));

        const allItems = [];
        await Promise.all(
          categoriesSnapshot.docs.map(async (categoryDoc) => {
            const categoryData = categoryDoc.data();
            if (categoryData?.active === false) return;

            const basePath = selectedBranch.cityId
              ? `cities/${selectedBranch.cityId}/branches/${selectedBranch.id}/categories/${categoryDoc.id}`
              : `branches/${selectedBranch.id}/categories/${categoryDoc.id}`;

            const productsRef = collection(db, `${basePath}/products`);
            const dealsRef = collection(db, `${basePath}/deals`);

            const [productsSnapshot, dealsSnapshot] = await Promise.all([
              getDocs(productsRef),
              getDocs(dealsRef),
            ]);

            productsSnapshot.docs.forEach((d) => {
              const data = d.data();
              if (data?.inStock === false) return;
              allItems.push({
                id: d.id,
                ...data,
                categoryId: categoryDoc.id,
                categoryName: categoryData?.name,
                isDeal: false,
              });
            });

            dealsSnapshot.docs.forEach((d) => {
              const data = d.data();
              if (data?.endDate) {
                const end = data.endDate.toDate ? data.endDate.toDate() : new Date(data.endDate);
                if (end < new Date()) return;
              }
              if (data?.isActive === false) return;
              allItems.push({
                id: d.id,
                ...data,
                categoryId: categoryDoc.id,
                categoryName: categoryData?.name,
                isDeal: true,
              });
            });
          })
        );

        setMenuItems(allItems.filter((p) => p && p.id && p.name));
      } catch (error) {
        console.error("Error loading recommendations menu items:", error);
      } finally {
        setRecoLoading(false);
      }
    };

    loadMenuItems();
  }, [cartItems.length, menuItems.length]);

  useEffect(() => {
    if (cartItems.length === 0) {
      setRecommendations([]);
      return;
    }
    if (!Array.isArray(menuItems) || menuItems.length === 0) {
      setRecommendations([]);
      return;
    }

    const cartIdSet = new Set(cartItems.map((i) => i.id).filter(Boolean));
    const cartCategorySet = new Set();
    cartItems.forEach((item) => {
      const match = menuItems.find((p) => p.id === item.id);
      if (match?.categoryId) cartCategorySet.add(match.categoryId);
    });

    const scoreOf = (item) => {
      let score = 0;
      if (item?.categoryId && cartCategorySet.has(item.categoryId)) score += 10;
      const discount = Number(item?.discountPrice || 0);
      if (discount > 0) score += 2;
      if (item?.isDeal || item?.dealPrice) score += 1;
      return score;
    };

    const sorted = menuItems
      .filter((p) => p && p.id && !cartIdSet.has(p.id))
      .sort((a, b) => {
        const sa = scoreOf(a);
        const sb = scoreOf(b);
        if (sa !== sb) return sb - sa;
        return String(a?.name || "").localeCompare(String(b?.name || ""));
      })
      .slice(0, 12);

    setRecommendations(sorted);
  }, [cartItems, menuItems]);

  useEffect(() => {
    if (recoLoading) return;
    if (isRecoPaused) return;
    if (!Array.isArray(recommendations) || recommendations.length < 2) return;

    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (prefersReducedMotion) return;

    const intervalId = window.setInterval(() => {
      const el = recoScrollRef.current;
      if (!el) return;

      const nearEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 10;
      if (nearEnd) {
        el.scrollTo({ left: 0, behavior: "smooth" });
        return;
      }

      const firstChild = el.firstElementChild;
      let step = 260;
      if (firstChild) {
        const w = firstChild.getBoundingClientRect().width;
        if (w) step = Math.round(w + 16);
      }
      el.scrollBy({ left: step, behavior: "smooth" });
    }, 3000);

    return () => window.clearInterval(intervalId);
  }, [isRecoPaused, recoLoading, recommendations]);

  const scrollReco = (direction) => {
    if (!recoScrollRef.current) return;
    const scrollAmount = 260;
    recoScrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const getRecoPrice = (item) => {
    const dealPrice = Number(item?.dealPrice || 0);
    const discountPrice = Number(item?.discountPrice || 0);
    const basePrice = Number(item?.price || 0);
    return dealPrice > 0 ? dealPrice : discountPrice > 0 ? discountPrice : basePrice;
  };

  const handleRecoClick = (item) => {
    if (!item?.id) return;
    const params = new URLSearchParams();
    if (item.categoryId) params.set("category", item.categoryId);
    params.set("product", item.id);
    navigate(`/menu?${params.toString()}`);
  };
  
  const gstAmount = (total * gstPercentage) / 100;
  const finalTotal = total + gstAmount;

  const handleCheckout = () => {
    if (auth.currentUser) {
      navigate('/PaymentScreen');
    } else {
      navigate('/login', { state: { from: routerLocation } });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-48">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
          >
            <FaArrowLeft className="w-5 h-5" />
          </button>
          
          <h1 className="text-xl font-bold text-gray-900">Your Cart</h1>
          
          <div className="w-9"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Cart Content */}
      <div className="max-w-3xl mx-auto px-4 pt-6">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-48 h-48 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                <img
                src="/carts.png"
                alt="Empty Cart"
                className="w-32 h-32 opacity-50"
                />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-500 mb-8 max-w-xs">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link
                to="/menu"
                className="bg-[#FFC72C] text-black font-bold px-8 py-3 rounded-xl hover:bg-[#ffcf4b] transition-colors shadow-sm"
            >
                Start Ordering
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item, index) => {
              const price = item.price_pk || item.price || 0;
              return (
                <div
                  key={index}
                  className="flex gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100"
                >
                  {/* Product Image */}
                  <div className="w-24 h-24 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                    <img
                      src={item.imageUrl || item.imagepath || "https://via.placeholder.com/80"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-gray-900 line-clamp-1">
                                {item.name}
                            </h3>
                            <p className="text-[#E25C1D] font-bold text-sm mt-1">
                                {currencySymbol} {Number(price).toLocaleString()}
                            </p>
                            
                            {/* Show Variants */}
                            {item.selectedVariants && item.selectedVariants.name && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Variant: {item.selectedVariants.name}
                                </p>
                            )}

                            {/* Show Addons */}
                            {item.selectedAddons && Object.values(item.selectedAddons).length > 0 && (
                                <div className="mt-1">
                                    <p className="text-xs text-gray-500 font-medium">Add-ons:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {Object.values(item.selectedAddons).map((addon, idx) => (
                                            <span key={idx} className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                                                {addon.quantity > 1 ? `${addon.quantity}x ` : ''}{addon.name} (+{currencySymbol}{Number(addon.price) * (addon.quantity || 1)})
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {/* Show GST Note if applicable */}
                            {gstPercentage > 0 && (
                                <p className="text-[10px] text-gray-400 mt-1">
                                    * Exclusive of {gstPercentage}% GST
                                </p>
                            )}
                        </div>
                        <button
                            onClick={() => removeFromCart(item.uniqueId || item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        >
                            <FaTrash size={14} />
                        </button>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex justify-between items-end mt-2">
                        <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border border-gray-200">
                            <button
                                onClick={() => updateQuantity(item.uniqueId || item.id, item.quantity - 1)}
                                className="w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:text-black font-bold disabled:opacity-50"
                            >
                                {item.quantity <= 1 ? <FaTrash size={10} /> : "−"}
                            </button>
                            <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                            <button
                                onClick={() => updateQuantity(item.uniqueId || item.id, item.quantity + 1)}
                                className="w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:text-black font-bold"
                            >
                                +
                            </button>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="font-bold text-gray-900">
                                {currencySymbol} {(Number(price) * item.quantity).toLocaleString()}
                            </span>
                            {gstPercentage > 0 && (
                                <span className="text-[10px] text-gray-400">
                                    + {currencySymbol} {((Number(price) * item.quantity * gstPercentage) / 100).toLocaleString()} GST
                                </span>
                            )}
                        </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {cartItems.length > 0 && (recoLoading || recommendations.length > 0) && (
        <div className="max-w-3xl mx-auto px-4 mt-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-extrabold tracking-tight text-gray-900">Recommended for you</h2>
            <button
              onClick={() => navigate("/menu")}
              className="text-[#E25C1D] hover:text-[#c44e18] font-semibold text-xs tracking-wider transition-colors"
            >
              VIEW ALL
            </button>
          </div>

          {recoLoading ? (
            <div className="relative bg-white border border-gray-100 rounded-2xl p-4">
              <div className="flex gap-4 overflow-hidden">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="w-48 flex-shrink-0">
                    <div className="animate-pulse bg-gray-50 border border-gray-200 rounded-xl p-3">
                      <div className="w-full aspect-square bg-gray-200 rounded-lg" />
                      <div className="h-3 bg-gray-200 rounded mt-3" />
                      <div className="h-3 bg-gray-200 rounded mt-2 w-2/3" />
                      <div className="h-8 bg-gray-200 rounded mt-3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div
              className="relative bg-white border border-gray-100 rounded-2xl p-3"
              onMouseEnter={() => setIsRecoPaused(true)}
              onMouseLeave={() => setIsRecoPaused(false)}
              onTouchStart={() => setIsRecoPaused(true)}
              onTouchEnd={() => setIsRecoPaused(false)}
            >
              <button
                onClick={() => scrollReco("left")}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white shadow-lg rounded-full flex items-center justify-center text-gray-600 hover:text-[#E25C1D] transition-colors border border-gray-100"
                aria-label="Previous"
              >
                <FaChevronLeft className="w-4 h-4" />
              </button>

              <div
                ref={recoScrollRef}
                className="flex overflow-x-auto gap-4 py-2 scrollbar-hide scroll-smooth snap-x snap-mandatory px-6"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {recommendations.map((item) => (
                  <div
                    key={`${item.categoryId || "cat"}-${item.id}`}
                    onClick={() => handleRecoClick(item)}
                    className="flex-shrink-0 w-48 cursor-pointer snap-center"
                  >
                    <div className="group bg-white rounded-xl border border-gray-200 hover:border-[#FFC72C] transition-all duration-300 p-3 h-full flex flex-col shadow-sm hover:shadow-md">
                      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-[#FFF5D6] to-[#FFE9A8]">
                        <img
                          src={item.imageUrl || item.imagepath || "https://via.placeholder.com/150"}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-white/90 text-[#E25C1D] text-[11px] font-bold">
                          {currencySymbol} {getRecoPrice(item).toLocaleString()}
                        </div>
                        {item.isDeal && (
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#E25C1D] text-white text-[10px] font-bold">
                            DEAL
                          </div>
                        )}
                      </div>

                      <div className="mt-3 flex-1">
                        <h3 className="text-sm font-bold text-gray-900 line-clamp-2 min-h-[34px]">
                          {item.name}
                        </h3>
                        {item.categoryName && (
                          <div className="mt-1 text-[10px] font-semibold text-gray-500 tracking-wide">
                            {item.categoryName}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRecoClick(item);
                        }}
                        className="mt-3 w-full bg-[#FFC72C] text-black font-bold py-2 rounded-lg hover:bg-[#ffcf4b] transition-colors text-sm"
                      >
                        ADD
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => scrollReco("right")}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white shadow-lg rounded-full flex items-center justify-center text-gray-600 hover:text-[#E25C1D] transition-colors border border-gray-100"
                aria-label="Next"
              >
                <FaChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Bottom Action Bar */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="max-w-3xl mx-auto">
                <div className="flex flex-col gap-1 mb-4">
                    <div className="flex justify-between items-center text-gray-600 text-sm">
                        <span>Subtotal ({getTotalItems()} items)</span>
                        <span>{currencySymbol} {Number(total).toLocaleString()}</span>
                    </div>
                    {gstPercentage > 0 && (
                        <div className="flex justify-between items-center text-gray-600 text-sm">
                            <span>GST ({gstPercentage}%)</span>
                            <span>{currencySymbol} {Number(gstAmount).toLocaleString()}</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                        <span className="text-gray-900 font-bold text-lg">Total</span>
                        <span className="text-xl font-bold text-gray-900">{currencySymbol} {Number(finalTotal).toLocaleString()}</span>
                    </div>
                </div>
                <button
                    onClick={handleCheckout}
                    className="w-full bg-[#FFC72C] text-black font-bold py-4 rounded-xl flex items-center justify-center hover:bg-[#ffcf4b] transition-colors shadow-sm text-lg"
                >
                    Proceed to Checkout
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default CartScreen;
