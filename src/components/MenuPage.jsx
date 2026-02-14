import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { FaShoppingCart, FaPlus, FaChevronLeft, FaChevronRight, FaSpinner } from "react-icons/fa";
import { motion } from "framer-motion";
import { auth, db } from "../firebase";
import { collection, getDocs, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { toast } from "react-toastify";

const MenuPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart, cartItems, getTotalPrice, updateQuantity } = useCart();
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [selectedAddons, setSelectedAddons] = useState({});
  const [activeSubProduct, setActiveSubProduct] = useState(null); // For deals with multiple product choices
  const [favorites, setFavorites] = useState([]); // State for favorite product IDs

  const [activeCategory, setActiveCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const activeCategoryRef = useRef(""); // Ref to track active category without re-renders
  
  const categoryRefs = useRef({});

  // Keep ref in sync with state
  useEffect(() => {
    activeCategoryRef.current = activeCategory;
  }, [activeCategory]);

  // Fetch categories and products from Firebase

  // ... (existing code)

  const [selectedDealProducts, setSelectedDealProducts] = useState({}); // Track selections for EACH product in a deal
  const [activeSubProductIndex, setActiveSubProductIndex] = useState(0); // Track which product we are currently customizing

  const isProductReady = (prod, selection) => {
      if (!selection) selection = {};
      
      // 1. Check Variants
      if (prod.variants && prod.variants.length > 0 && prod.variants.some(v => v.name)) {
          if (!selection.variant || !selection.variant.name) return false;
      }

      // 2. Check Flavors (Required)
      if (prod.flavors && prod.flavors.length > 0 && prod.flavors.some(f => f.name)) {
          if (!selection.addons || !selection.addons['flavor']) return false;
      }

      // 3. Check Beverages (Required - at least one)
      if (prod.Beverages && prod.Beverages.length > 0 && prod.Beverages.some(b => b.name)) {
           if (!selection.addons) return false;
           const hasBev = Object.keys(selection.addons).some(k => k.startsWith('bev-'));
           if (!hasBev) return false;
      }

      return true;
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setSelectedVariants({});
    setSelectedAddons({});
    setSelectedDealProducts({});
    setActiveSubProductIndex(0);
    
    // For deals, initialize the selection structure for all products
    if (product.isDeal && product.products && product.products.length > 0) {
        setActiveSubProduct(product.products[0]);
    } else {
        setActiveSubProduct(null);
    }
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
  };

  // Fetch favorites on load
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userRef = doc(db, "Customers", user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setFavorites(userSnap.data().favorites || []);
          }
        } catch (error) {
          console.error("Error fetching favorites:", error);
        }
      } else {
        setFavorites([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const toggleFavorite = async (e, productId) => {
    e.stopPropagation(); // Prevent opening product modal
    if (!auth.currentUser) {
      toast.info("Please login to manage favorites");
      navigate('/login', { state: { from: location } });
      return;
    }

    const isFav = favorites.includes(productId);
    const userRef = doc(db, "Customers", auth.currentUser.uid);

    // Optimistic update
    if (isFav) {
      setFavorites(prev => prev.filter(id => id !== productId));
    } else {
      setFavorites(prev => [...prev, productId]);
    }

    try {
      if (isFav) {
        await updateDoc(userRef, {
          favorites: arrayRemove(productId)
        });
        toast.success("Removed from favorites");
      } else {
        await updateDoc(userRef, {
          favorites: arrayUnion(productId)
        });
        toast.success("Added to favorites");
      }
    } catch (error) {
      console.error("Error updating favorite:", error);
      // Revert on error
      if (isFav) {
         setFavorites(prev => [...prev, productId]);
      } else {
         setFavorites(prev => prev.filter(id => id !== productId));
      }
      toast.error("Failed to update favorite");
    }
  };

  const handleAddToCart = () => {
    if (!auth.currentUser) {
        toast.info("Please login to add items to cart");
        navigate('/login', { state: { from: location } });
        return;
    }

    if (!selectedProduct) return;

    // For Deal: We need to validate that ALL required choices for ALL products are made
    if (selectedProduct.isDeal) {
        // Build the cart item with nested product selections
        const dealItems = selectedProduct.products.map((prod, index) => {
            const selection = selectedDealProducts[index] || {};
            return {
                ...prod,
                selectedVariants: selection.variant || {},
                selectedAddons: selection.addons || {}
            };
        });

        // Calculate total price based on deal base price + extra costs from all sub-products
        let dealTotal = Number(selectedProduct.dealPrice || selectedProduct.price || 0);
        dealItems.forEach(item => {
            if (item.selectedVariants && item.selectedVariants.price) {
                dealTotal += Number(item.selectedVariants.price);
            }
            if (item.selectedAddons) {
                Object.values(item.selectedAddons).forEach(addon => {
                    dealTotal += Number(addon.price || 0) * (addon.quantity || 1);
                });
            }
        });

        const cartItem = {
            ...selectedProduct,
            name: selectedProduct.name, // Just deal name, sub-details will be in description or separate field
            description: dealItems.map(d => `${d.name} (${d.selectedVariants.name || 'Regular'})`).join(', '),
            price_pk: dealTotal,
            isDeal: true,
            dealItems: dealItems, // Store full details
            uniqueId: Date.now()
        };
        addToCart(cartItem);
        closeProductModal();
        return;
    }

    // Regular Product Logic (Existing)
    // Start with base price (prioritizing discountPrice if available)
    let finalPrice = Number(selectedProduct.price || 0);
    if (selectedProduct.discountPrice && Number(selectedProduct.discountPrice) > 0) {
        finalPrice = Number(selectedProduct.discountPrice);
    }
    
    // If a variant is selected, use the variant's price instead of the base price
    if (selectedVariants && selectedVariants.price) {
        finalPrice = Number(selectedVariants.price);
    }

    // Add addon prices based on quantity
    Object.values(selectedAddons).forEach(addon => {
        finalPrice += Number(addon.price || 0) * (addon.quantity || 1);
    });

    const cartItem = {
        ...selectedProduct,
        name: selectedProduct.isDeal && activeSubProduct ? `${selectedProduct.name} (${activeSubProduct.name})` : selectedProduct.name,
        price_pk: finalPrice,
        selectedVariants,
        selectedAddons,
        selectedSubProduct: activeSubProduct, // Persist the specific sub-product choice
        uniqueId: Date.now() // Unique ID for cart item to distinguish same product with different options
    };

    addToCart(cartItem);
    closeProductModal();
  };

  useEffect(() => {
    const fetchMenuData = async () => {
      const selectedBranch = JSON.parse(localStorage.getItem('selectedBranch'));
      
      if (!selectedBranch) {
        setLoading(false);
        return;
      }

      // 1. Try to load from cache first for instant feel
      const cacheKey = `menuCache_${selectedBranch.id}`;
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
          try {
              const parsedCache = JSON.parse(cachedData);
              if (parsedCache && Array.isArray(parsedCache) && parsedCache.length > 0) {
                  setCategories(parsedCache);
                  setLoading(false); // Show content immediately
              }
          } catch (e) {
              console.error("Cache parse error", e);
          }
      }

      try {
        // 2. Fetch fresh data from Firebase
        let categoriesRef;
        let dealsRef;
        
        if (selectedBranch.cityId) {
             categoriesRef = collection(db, `cities/${selectedBranch.cityId}/branches/${selectedBranch.id}/categories`);
             dealsRef = collection(db, `cities/${selectedBranch.cityId}/branches/${selectedBranch.id}/deals`);
        } else {
             categoriesRef = collection(db, `branches/${selectedBranch.id}/categories`);
             dealsRef = collection(db, `branches/${selectedBranch.id}/deals`);
        }

        const [categoriesSnapshot, dealsSnapshot] = await Promise.all([
             getDocs(categoriesRef),
             getDocs(dealsRef)
        ]);

        // Process Deals
        const deals = dealsSnapshot.docs.map(doc => {
             const data = doc.data();
             
             // Check expiry
             if (data.endDate) {
                 const end = data.endDate.toDate ? data.endDate.toDate() : new Date(data.endDate);
                 if (end < new Date()) return null;
             }
             if (!data.isActive) return null;

             return {
                 id: doc.id,
                 ...data,
                 name: data.name || "Deal",
                 description: data.description,
                 price: data.dealPrice, // Use dealPrice as main price
                 discountPrice: data.dealPrice, // For consistent display
                 originalPrice: data.regularPrice, // Show if available
                 imageUrl: data.imageUrl,
                 isDeal: true, // Flag to identify deals
                 // Normalize sub-products structure
                 products: (data.products || []).map(p => ({
                     ...p,
                     // Map deal sub-product fields to standard fields expected by modal
                     variants: p.availableVariants || [],
                     flavors: p.availableFlavors || [],
                     addons: p.availableAddons || [],
                     Beverages: p.availableBeverages || [],
                     price: p.basePrice || 0 // Use basePrice as the product's reference price
                 }))
             };
        })
        .filter(Boolean)
        .sort((a, b) => {
             // Sort by createdAt desc (newest first)
             const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
             const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
             return dateB - dateA;
        });

        // Create a virtual "Deals" category if deals exist
        let dealsCategory = null;
        if (deals.length > 0) {
            dealsCategory = {
                id: "deals-category",
                name: "Deals",
                active: true,
                products: deals
            };
        }
        
        const categoriesData = await Promise.all(categoriesSnapshot.docs.map(async (categoryDoc) => {
          const categoryData = categoryDoc.data();
          
          if (categoryData.active === false) return null;

          let productsRef;
          
          if (selectedBranch.cityId) {
               productsRef = collection(db, `cities/${selectedBranch.cityId}/branches/${selectedBranch.id}/categories/${categoryDoc.id}/products`);
          } else {
               productsRef = collection(db, `branches/${selectedBranch.id}/categories/${categoryDoc.id}/products`);
          }

          const productsSnapshot = await getDocs(productsRef);
          const productsData = productsSnapshot.docs.map(doc => {
            const data = doc.data();
            
            const flavors = data.flavors ? data.flavors.map(f => {
                if (typeof f === 'string') return { name: f, id: f };
                return { ...f };
            }) : [];

            return {
                id: doc.id,
                ...data,
                flavors: flavors
            };
          }).filter(prod => prod.inStock !== false);

          return {
            id: categoryDoc.id,
            ...categoryData,
            products: productsData
          };
        }));
        
        let finalData = categoriesData.filter(cat => cat !== null);
        
        // Prepend Deals category if it exists
        if (dealsCategory) {
            finalData = [dealsCategory, ...finalData];
        }
        
        // Update state and cache
        setCategories(finalData);
        localStorage.setItem(cacheKey, JSON.stringify(finalData));
        
      } catch (error) {
        console.error("Error fetching menu data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, []);

  // Initialize refs - No longer needed with callback refs
  // useEffect(() => {
  //   categories.forEach(cat => {
  //     categoryRefs.current[cat.id] = React.createRef();
  //   });
  // }, [categories]);

  // Handle initial scroll based on URL param
  useEffect(() => {
    if (loading || categories.length === 0) return;

    const catId = searchParams.get("category");
    
    // Helper function to perform the scroll
    const performScroll = (targetId, retryCount = 0) => {
        const element = categoryRefs.current[targetId]; // Access DOM element directly
        const container = document.getElementById('products-container');
        
        if (element && container) {
            const elementTop = element.offsetTop;
            
            container.scrollTo({
                top: elementTop - 20, // 20px padding from top
                behavior: "smooth"
            });
            setActiveCategory(targetId);
        } else if (retryCount < 5) {
            // Retry if element not found yet (e.g. rendering delay)
            setTimeout(() => performScroll(targetId, retryCount + 1), 200);
        }
    };

    if (catId) {
      // Use a small timeout to ensure DOM is ready
      setTimeout(() => {
        performScroll(catId);
      }, 100); 
    } else if (categories.length > 0) {
       setActiveCategory(categories[0].id);
    }
  }, [searchParams, categories, loading]);

  useEffect(() => {
    const handleScroll = () => {
      const container = document.getElementById('products-container');
      if (!container) return;
      
      // Add a small buffer to the scroll position detection
      const scrollPosition = container.scrollTop + 220; // Increased offset slightly

      for (const cat of categories) {
        const element = categoryRefs.current[cat.id];
        if (element) {
          const { offsetTop, offsetHeight } = element;
          
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            // Only update if category changed to prevent constant re-renders and scroll jitter
            if (activeCategoryRef.current !== cat.id) {
                activeCategoryRef.current = cat.id; // Immediate update to prevent race conditions
                setActiveCategory(cat.id);
                
                // Scroll the category nav to center the active item
                const navContainer = scrollRef.current;
                if (navContainer) {
                    const activeBtn = navContainer.querySelector(`[data-category-id="${cat.id}"]`);
                    
                    if (activeBtn) {
                        // Calculate center position
                        // Note: Ensure navContainer has 'relative' class for correct offsetLeft
                        const scrollLeft = activeBtn.offsetLeft - (navContainer.clientWidth / 2) + (activeBtn.clientWidth / 2);
                        navContainer.scrollTo({ left: scrollLeft, behavior: 'smooth' });
                    }
                }
            }
            break; 
          }
        }
      }
    };

    const container = document.getElementById('products-container');
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [categories]);

  const scrollToCategory = (catId) => {
    setActiveCategory(catId);
    
    // Check if we are already on the menu page with this category
    const currentCategory = searchParams.get("category");
    if (currentCategory === catId) {
        // If already selected, force scroll
        const element = categoryRefs.current[catId]; // Access DOM element directly
        if (element) {
            const container = document.getElementById('products-container');
            if (container) {
                const elementPosition = element.offsetTop;
                container.scrollTo({
                    top: elementPosition - 20, // 20px padding
                    behavior: "smooth"
                });
            }
        }
        return;
    }

    navigate(`/menu?category=${catId}`, { replace: true });
    
    // The useEffect listening to [searchParams] will handle the scrolling
  };

  const scrollNav = (direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = 200;
      if (direction === "left") {
        current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }
  };

  const getCleanImageUrl = (source) => {
      if (!source) return null;
      
      let raw;
      if (typeof source === 'string') {
          raw = source;
      } else {
          // Check all possible casing and fields
          raw = source.imageUrl || source.imageurl || source.image_url || source.image || source.img || source.imagepath || source.path;
      }
      
      if (!raw) return null;
      
      // Nuclear option: Remove ALL quotes (single/double) and backticks globally
      // Also trim whitespace
      let clean = String(raw).replace(/["'`]/g, "").trim();
      
      return clean.length > 0 ? clean : null;
  };

  const getProductPrice = (product) => {
      // User explicit instruction: "don't use variants price for main display"
      // Use strictly product.price and product.discountPrice
      
      const basePrice = Number(product.price || 0);
      const discountPrice = Number(product.discountPrice || 0);
      
      let priceDisplay;
      let hasDiscount = false;
      let originalPrice = 0;

      if (discountPrice > 0) {
          // Always prioritize discountPrice as the selling price if it exists
          priceDisplay = discountPrice;
          originalPrice = basePrice;
          // ALWAYS show original price crossed out if discount exists
          hasDiscount = true;
      } else {
          // No discount
          priceDisplay = basePrice;
      }

      return (
          <div className="flex items-center gap-2 mt-2">
             <span className="text-[#E25C1D] font-bold text-sm">
                 Rs. {priceDisplay.toLocaleString()}
             </span>
             {hasDiscount && (
                 <span className="px-2 py-0.5 bg-[#E25C1D] text-white text-[9px] font-bold rounded-full">
                     Starting Price
                 </span>
             )}
          </div>
      );
  };

  // Filter products based on search query
  const searchQuery = searchParams.get('search') || '';
  
  const filteredCategories = categories.map(cat => ({
    ...cat,
    products: cat.products.filter(product => 
      !searchQuery || 
      (product.name && product.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })).filter(cat => cat.products.length > 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <FaSpinner className="animate-spin text-4xl text-[#FFC72C]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-gray-50">
      {/* Sticky Category Nav */}
      <div className="flex-none bg-white shadow-sm py-4 z-40">
        <div className="max-w-7xl mx-auto px-4 relative group">
            {/* Left Arrow */}
            <button
                onClick={() => scrollNav("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center text-gray-600 hover:text-[#FFC72C] opacity-0 group-hover:opacity-100 transition-opacity border"
            >
                <FaChevronLeft className="w-3 h-3" />
            </button>

            <div 
                ref={scrollRef}
                className="relative flex overflow-x-auto gap-3 scrollbar-hide px-8"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {filteredCategories.map((cat) => (
                <button
                    key={cat.id}
                    data-category-id={cat.id}
                    onClick={() => scrollToCategory(cat.id)}
                    className={`whitespace-nowrap px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-sm ${
                    activeCategory === cat.id
                        ? "bg-[#FFC72C] text-black shadow-md transform scale-105 border border-[#FFC72C]"
                        : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                    }`}
                >
                    {cat.name}
                </button>
                ))}
            </div>

             {/* Right Arrow */}
             <button
                onClick={() => scrollNav("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center text-gray-600 hover:text-[#FFC72C] opacity-0 group-hover:opacity-100 transition-opacity border"
            >
                <FaChevronRight className="w-3 h-3" />
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden max-w-7xl mx-auto w-full px-4 mt-8 flex gap-8">
        {/* Main Content - Product List */}
        <div id="products-container" className="flex-1 overflow-y-auto space-y-12 pr-4 pb-20 scrollbar-thin">
          {filteredCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-xl font-bold text-gray-500 mb-2">No items found</p>
                <p className="text-gray-400">Try searching for something else</p>
            </div>
          ) : (
            filteredCategories.map((cat) => (
            <div 
                key={cat.id} 
                id={cat.id} 
                ref={el => categoryRefs.current[cat.id] = el}
                className="scroll-mt-4"
            >
              <h2 className="text-2xl font-bold mb-6 text-gray-800">{cat.name}</h2>
              <div className="grid grid-cols-2 gap-4">
                {cat.products.map((product) => (
                  <div key={product.id} className="bg-white p-3 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 flex flex-col items-center text-center hover:shadow-lg transition-all duration-300 h-full relative group">
                    {/* Favorite Button - Top Right */}
                    <button 
                        onClick={(e) => toggleFavorite(e, product.id)}
                        className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-white/80 backdrop-blur-sm text-gray-400 hover:text-red-500 transition-colors shadow-sm"
                    >
                        {favorites.includes(product.id) ? (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-red-500">
                                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[#E25C1D]">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                            </svg>
                        )}
                    </button>

                    <div 
                        className="relative w-full aspect-square mb-2 overflow-hidden rounded-2xl bg-white cursor-pointer"
                        onClick={() => openProductModal(product)}
                    >
                        <img 
                            src={getCleanImageUrl(product) || "https://via.placeholder.com/640"} 
                            alt={product.name} 
                            className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
                        />
                    </div>
                    
                    <div className="flex-1 flex flex-col items-center w-full px-1">
                        <h3 className="text-xl font-serif font-bold text-gray-900 mb-1 leading-tight">{product.name}</h3>
                        {product.description && (
                            <p className="text-xs text-gray-500 line-clamp-2 mb-3 font-medium leading-relaxed">
                                {product.description}
                            </p>
                        )}
                        
                        <div className="mt-auto w-full flex flex-col items-center gap-3">
                            {getProductPrice(product)}
                            
                            <button 
                                onClick={() => openProductModal(product)}
                                className="w-full bg-white text-black font-bold py-2 md:py-2.5 px-2 md:px-0 rounded-lg hover:bg-[#FFC72C] hover:border-[#FFC72C] transition-colors border border-gray-200 flex items-center justify-center gap-1.5 md:gap-2 shadow-sm text-[10px] sm:text-xs md:text-sm tracking-wide whitespace-nowrap"
                            >
                                <FaPlus className="w-2 h-2 md:w-2.5 md:h-2.5" />
                                ADD TO CART
                            </button>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )))}
        </div>

        {/* Right Sidebar - Cart */}
        <div className="hidden lg:block w-80 h-full overflow-y-auto pb-20">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[300px] flex flex-col items-center justify-center text-center">
                {cartItems.length === 0 ? (
                    <>
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-300">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                            </svg>
                        </div>
                        <h3 className="font-bold text-gray-800 mb-2">YOUR CART IS EMPTY</h3>
                        <p className="text-sm text-gray-500">Go ahead and explore top categories.</p>
                    </>
                ) : (
                    <div className="w-full">
                         <h3 className="font-bold text-gray-800 mb-4 text-left border-b pb-2">Your Order</h3>
                         <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto">
                            {cartItems.map(item => (
                                <div key={item.uniqueId || item.id} className="flex justify-between items-center text-left">
                                    <div className="flex-1">
                                        <div className="text-sm font-bold line-clamp-1">{item.name}</div>
                                        <div className="flex items-center gap-2 mt-2 bg-gray-50 w-max rounded-lg p-1">
                                            <button 
                                                onClick={() => updateQuantity(item.uniqueId || item.id, item.quantity - 1)}
                                                className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 hover:text-black font-bold text-sm transition-colors hover:bg-red-50 hover:text-red-500"
                                            >
                                                {item.quantity === 1 ? (
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                    </svg>
                                                ) : "−"}
                                            </button>
                                            <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                            <button 
                                                onClick={() => updateQuantity(item.uniqueId || item.id, item.quantity + 1)}
                                                className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 hover:text-black font-bold text-sm transition-colors"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-sm font-bold">Rs. {(item.price_pk * item.quantity).toLocaleString()}</div>
                                </div>
                            ))}
                         </div>
                         <div className="border-t pt-4">
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-bold">Total</span>
                                <span className="font-bold text-[#E25C1D]">Rs. {getTotalPrice().toLocaleString()}</span>
                            </div>
                            <button 
                                onClick={() => navigate('/cart')}
                                className="w-full bg-[#FFC72C] text-black font-bold py-3 rounded-lg hover:bg-[#ffcf4b] transition-colors"
                            >
                                CHECKOUT
                            </button>
                         </div>
                    </div>
                )}
            </div>
        </div>
      </div>
      {/* Product Options Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeProductModal}></div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[90vh]"
          >
            {/* Header Image */}
            <div className="relative h-48 bg-gray-100">
                <img 
                    src={
                        (selectedProduct.isDeal && activeSubProduct)
                        ? (getCleanImageUrl(activeSubProduct) || getCleanImageUrl(selectedProduct) || "https://via.placeholder.com/150")
                        : (getCleanImageUrl(selectedProduct) || "https://via.placeholder.com/150")
                    } 
                    alt={selectedProduct.isDeal && activeSubProduct ? activeSubProduct.name : selectedProduct.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                />
                <button 
                    onClick={closeProductModal}
                    className="absolute top-4 right-4 bg-white/90 p-2 rounded-full shadow-md hover:bg-white text-gray-800"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedProduct.isDeal && activeSubProduct ? activeSubProduct.name : selectedProduct.name}
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                    {selectedProduct.isDeal && activeSubProduct ? activeSubProduct.description : selectedProduct.description}
                </p>

                {/* Deal Product Selection Tabs */}
                {selectedProduct.isDeal && selectedProduct.products && selectedProduct.products.length > 0 && (
                    <div className="mb-6">
                        <h3 className="font-bold text-gray-800 mb-3">Configure Your Meal</h3>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                            {selectedProduct.products.map((subProd, index) => {
                                const currentSelection = selectedDealProducts[index] || {};
                                const isCompleted = isProductReady(subProd, currentSelection); // Robust Check
                                const isActive = activeSubProduct === subProd;
                                
                                return (
                                <button 
                                    key={index}
                                    onClick={() => {
                                        setActiveSubProduct(subProd);
                                        setActiveSubProductIndex(index);
                                        // Load existing selection for this product if any
                                        const saved = selectedDealProducts[index] || {};
                                        setSelectedVariants(saved.variant || {});
                                        setSelectedAddons(saved.addons || {});
                                    }}
                                    className={`flex-shrink-0 flex items-center gap-2 p-2 pr-4 rounded-xl border-2 transition-all ${
                                        isActive 
                                            ? 'border-[#FFC72C] bg-[#FFC72C]/10' 
                                            : isCompleted 
                                                ? 'border-green-500 bg-green-50'
                                                : 'border-gray-100 hover:border-gray-200'
                                    }`}
                                >
                                    <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                        <img 
                                            src={getCleanImageUrl(subProd) || "https://via.placeholder.com/150"} 
                                            alt={subProd.name} 
                                            className="w-full h-full object-cover"
                                            referrerPolicy="no-referrer"
                                        />
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <span className={`font-bold text-xs ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
                                            {subProd.name}
                                        </span>
                                        <span className="text-[10px] text-gray-500">
                                            {isCompleted ? '✓ Ready' : 'Pending'}
                                        </span>
                                    </div>
                                </button>
                            )})}
                        </div>
                    </div>
                )}

                {/* Render Options for the Active Target (Product or Deal Sub-Product) */}
                {(() => {
                    const targetProduct = selectedProduct.isDeal ? activeSubProduct : selectedProduct;
                    
                    if (!targetProduct) return null;

                    return (
                        <>
                            {/* Variants Section */}
                            {targetProduct.variants && targetProduct.variants.length > 0 && targetProduct.variants.some(v => v.name) && (
                                <div className="mb-6">
                                    <h3 className="font-bold text-gray-800 mb-3 flex items-center justify-between">
                                        Choose Variation 
                                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded font-bold">Required</span>
                                    </h3>
                                    <div className="space-y-3">
                                        {targetProduct.variants.filter(v => v.name).map((variant, index) => (
                                            <label 
                                                key={variant.id || index}
                                                className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                                    selectedVariants.id === variant.id || selectedVariants.name === variant.name 
                                                        ? 'border-[#FFC72C] bg-[#FFC72C]/5' 
                                                        : 'border-gray-100 hover:border-gray-200'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                        <div className={`w-12 h-12 rounded-lg border flex-shrink-0 overflow-hidden ${
                                                            selectedVariants.id === variant.id || selectedVariants.name === variant.name ? 'border-[#FFC72C]' : 'border-gray-200'
                                                        }`}>
                                                            <img 
                                                                src={getCleanImageUrl(selectedProduct.isDeal ? null : variant) || getCleanImageUrl(targetProduct) || getCleanImageUrl(selectedProduct) || "https://via.placeholder.com/150"} 
                                                                alt={variant.name}
                                                                className="w-full h-full object-cover"
                                                                referrerPolicy="no-referrer"
                                                            />
                                                        </div>
                                                        <div className="flex flex-col">
                                                        <span className="font-medium text-gray-700">{variant.name}</span>
                                                        {(selectedVariants.id === variant.id || selectedVariants.name === variant.name) && (
                                                            <span className="text-xs text-[#E25C1D] font-bold">Selected</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-bold text-gray-900">
                                                        {Number(variant.price) > 0 ? `+ Rs. ${variant.price}` : 'Free'}
                                                    </span>
                                                    <input 
                                                        type="radio" 
                                                        name="variant" 
                                                        className="hidden"
                                                        checked={selectedVariants.id === variant.id || selectedVariants.name === variant.name}
                                                        onChange={() => {
                                                            setSelectedVariants(variant);
                                                            // Save to deal state
                                                            if (selectedProduct.isDeal) {
                                                                setSelectedDealProducts(prev => ({
                                                                    ...prev,
                                                                    [activeSubProductIndex]: {
                                                                        ...prev[activeSubProductIndex],
                                                                        variant: variant
                                                                    }
                                                                }));
                                                            }
                                                        }}
                                                    />
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                                        selectedVariants.id === variant.id || selectedVariants.name === variant.name 
                                                            ? 'border-[#FFC72C]' 
                                                            : 'border-gray-300'
                                                    }`}>
                                                        {(selectedVariants.id === variant.id || selectedVariants.name === variant.name) && (
                                                            <div className="w-2.5 h-2.5 rounded-full bg-[#FFC72C]"></div>
                                                        )}
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Flavors Section */}
                            {targetProduct.flavors && targetProduct.flavors.length > 0 && targetProduct.flavors.some(f => f.name) && (
                                <div className="mb-6">
                                    <h3 className="font-bold text-gray-800 mb-3 flex items-center justify-between">
                                        Flavors 
                                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded font-bold">Required</span>
                                    </h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {targetProduct.flavors.filter(f => f.name).map((flavor, index) => {
                                            const isSelected = selectedAddons['flavor']?.name === flavor.name;
                                            const flavorImg = getCleanImageUrl(flavor);
                                            return (
                                            <label 
                                                key={`flav-${flavor.id || index}`}
                                                className={`relative flex flex-col items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                                    isSelected
                                                        ? 'border-[#FFC72C] bg-[#FFC72C]/5' 
                                                        : 'border-gray-100 hover:border-gray-200'
                                                }`}
                                            >
                                                {flavorImg && (
                                                    <div className="w-16 h-16 mb-2 rounded-full overflow-hidden border border-gray-100 bg-gray-50 relative">
                                                        <img 
                                                            src={flavorImg} 
                                                            alt={flavor.name} 
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.target.src = "https://via.placeholder.com/150?text=No+Image";
                                                                e.target.onerror = () => {
                                                                    e.target.style.display = 'none';
                                                                };
                                                            }}
                                                            loading="lazy"
                                                            referrerPolicy="no-referrer"
                                                        />
                                                    </div>
                                                )}
                                                <span className={`text-sm text-center ${isSelected ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
                                                    {flavor.name}
                                                </span>
                                                {flavor.price && Number(flavor.price) > 0 && (
                                                    <span className="text-xs text-[#E25C1D] font-bold mt-1">
                                                        + Rs. {Number(flavor.price).toLocaleString()}
                                                    </span>
                                                )}
                                                
                                                {isSelected && (
                                                    <div className="absolute top-2 right-2 w-4 h-4 bg-[#FFC72C] rounded-full flex items-center justify-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-white">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                )}

                                                <input 
                                                    type="radio" 
                                                    name="flavor_selection"
                                                    className="hidden"
                                                    checked={isSelected}
                                                    onChange={() => {
                                                        const newAddons = { ...selectedAddons };
                                                        newAddons['flavor'] = { 
                                                            id: flavor.id,
                                                            name: flavor.name, 
                                                            imageUrl: flavorImg,
                                                            price: Number(flavor.price || 0), 
                                                            quantity: 1,
                                                            type: 'Flavor'
                                                        };
                                                        setSelectedAddons(newAddons);
                                                        
                                                        if (selectedProduct.isDeal) {
                                                            setSelectedDealProducts(prev => ({
                                                                ...prev,
                                                                [activeSubProductIndex]: {
                                                                    ...prev[activeSubProductIndex],
                                                                    addons: newAddons
                                                                }
                                                            }));
                                                        }
                                                    }}
                                                />
                                            </label>
                                        );})}
                                    </div>
                                </div>
                            )}

                            {/* Addons Section */}
                            {targetProduct.addons && targetProduct.addons.length > 0 && targetProduct.addons.some(a => a.name) && (
                                <div className="mb-6">
                                    <h3 className="font-bold text-gray-800 mb-3 flex items-center justify-between">
                                        Add Ons 
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold">Optional</span>
                                    </h3>
                                    <div className="space-y-3">
                                        {targetProduct.addons.filter(a => a.name).map((addon, index) => (
                                            <div key={addon.id || index} className="flex flex-col gap-2 p-4 rounded-xl border border-gray-100">
                                                <label 
                                                    className={`flex items-center justify-between cursor-pointer transition-all ${
                                                        selectedAddons[addon.id || index] ? 'opacity-100' : 'opacity-80'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {!selectedProduct.isDeal && (
                                                            <div className={`w-12 h-12 rounded-lg border flex-shrink-0 overflow-hidden ${
                                                                selectedAddons[addon.id || index] ? 'border-[#FFC72C]' : 'border-gray-200'
                                                            }`}>
                                                                <img 
                                                                    src={getCleanImageUrl(addon) || "https://via.placeholder.com/150"} 
                                                                    alt={addon.name}
                                                                    className="w-full h-full object-cover"
                                                                    referrerPolicy="no-referrer"
                                                                />
                                                            </div>
                                                        )}
                                                        <span className="font-medium text-gray-700">{addon.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-bold text-gray-900">+ Rs. {addon.price}</span>
                                                        <input 
                                                            type="checkbox" 
                                                            className="hidden"
                                                            checked={!!selectedAddons[addon.id || index]}
                                                            onChange={(e) => {
                                                                const newAddons = { ...selectedAddons };
                                                                if (e.target.checked) {
                                                                    newAddons[addon.id || index] = { 
                                                                        id: addon.id,
                                                                        name: addon.name,
                                                                        price: addon.price,
                                                                        imageUrl: addon.imageUrl,
                                                                        quantity: 1,
                                                                        type: 'Addon' 
                                                                    };
                                                                } else {
                                                                    delete newAddons[addon.id || index];
                                                                }
                                                                setSelectedAddons(newAddons);

                                                                if (selectedProduct.isDeal) {
                                                                    setSelectedDealProducts(prev => ({
                                                                        ...prev,
                                                                        [activeSubProductIndex]: {
                                                                            ...prev[activeSubProductIndex],
                                                                            addons: newAddons
                                                                        }
                                                                    }));
                                                                }
                                                            }}
                                                        />
                                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                                            selectedAddons[addon.id || index] 
                                                                ? 'border-[#FFC72C] bg-[#FFC72C]' 
                                                                : 'border-gray-300'
                                                        }`}>
                                                            {selectedAddons[addon.id || index] && (
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-white">
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                    </div>
                                                </label>
                                                
                                                {selectedAddons[addon.id || index] && (
                                                    <div className="flex justify-end items-center mt-2 border-t border-gray-50 pt-2">
                                                        <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const newAddons = { ...selectedAddons };
                                                                    if (newAddons[addon.id || index].quantity > 1) {
                                                                        newAddons[addon.id || index].quantity -= 1;
                                                                        setSelectedAddons(newAddons);
                                                                    } else {
                                                                        delete newAddons[addon.id || index];
                                                                        setSelectedAddons(newAddons);
                                                                    }

                                                                    if (selectedProduct.isDeal) {
                                                                        setSelectedDealProducts(prev => ({
                                                                            ...prev,
                                                                            [activeSubProductIndex]: {
                                                                                ...prev[activeSubProductIndex],
                                                                                addons: newAddons
                                                                            }
                                                                        }));
                                                                    }
                                                                }}
                                                                className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 hover:text-black font-bold"
                                                            >
                                                                −
                                                            </button>
                                                            <span className="text-xs font-bold w-4 text-center">{selectedAddons[addon.id || index].quantity}</span>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const newAddons = { ...selectedAddons };
                                                                    newAddons[addon.id || index].quantity = (newAddons[addon.id || index].quantity || 1) + 1;
                                                                    setSelectedAddons(newAddons);

                                                                    if (selectedProduct.isDeal) {
                                                                        setSelectedDealProducts(prev => ({
                                                                            ...prev,
                                                                            [activeSubProductIndex]: {
                                                                                ...prev[activeSubProductIndex],
                                                                                addons: newAddons
                                                                            }
                                                                        }));
                                                                    }
                                                                }}
                                                                className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 hover:text-black font-bold"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Beverages Section */}
                            {targetProduct.Beverages && targetProduct.Beverages.length > 0 && targetProduct.Beverages.some(b => b.name) && (
                                <div className="mb-6">
                                    <h3 className="font-bold text-gray-800 mb-3 flex items-center justify-between">
                                        Beverages 
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold">Optional</span>
                                    </h3>
                                    <div className="space-y-2">
                                        {targetProduct.Beverages.filter(b => b.name).map((beverage, index) => (
                                            <label 
                                                key={`bev-${beverage.id || index}`}
                                                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                                                    selectedAddons[`bev-${beverage.id || index}`] 
                                                        ? 'border-[#FFC72C] bg-[#FFC72C]/5' 
                                                        : 'border-gray-100 hover:border-gray-200'
                                                }`}
                                            >
                                                <span className="font-medium text-gray-700">{beverage.name}</span>
                                                <div className="flex items-center gap-3">
                                                    <input 
                                                        type="checkbox" 
                                                        className="hidden"
                                                        checked={!!selectedAddons[`bev-${beverage.id || index}`]}
                                                        onChange={(e) => {
                                                            const newAddons = { ...selectedAddons };
                                                            if (e.target.checked) {
                                                                newAddons[`bev-${beverage.id || index}`] = { 
                                                                    id: beverage.id,
                                                                    name: beverage.name, 
                                                                    price: 0, 
                                                                    quantity: 1,
                                                                    type: 'Beverage'
                                                                };
                                                            } else {
                                                                delete newAddons[`bev-${beverage.id || index}`];
                                                            }
                                                            setSelectedAddons(newAddons);

                                                            if (selectedProduct.isDeal) {
                                                                setSelectedDealProducts(prev => ({
                                                                    ...prev,
                                                                    [activeSubProductIndex]: {
                                                                        ...prev[activeSubProductIndex],
                                                                        addons: newAddons
                                                                    }
                                                                }));
                                                            }
                                                        }}
                                                    />
                                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                                        selectedAddons[`bev-${beverage.id || index}`] 
                                                            ? 'border-[#FFC72C] bg-[#FFC72C]' 
                                                            : 'border-gray-300'
                                                    }`}>
                                                        {selectedAddons[`bev-${beverage.id || index}`] && (
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-white">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    );
                })()}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-gray-100 bg-white">
                <button 
                    onClick={handleAddToCart}
                    disabled={(() => {
                        if (selectedProduct.isDeal) {
                            const subProducts = selectedProduct.products || [];
                            return !subProducts.every((prod, idx) => {
                                const selection = selectedDealProducts[idx] || {};
                                return isProductReady(prod, selection);
                            });
                        } else {
                            const targetProduct = selectedProduct;
                            if (targetProduct.variants && targetProduct.variants.filter(v => v.name).length > 0 && !selectedVariants.name) return true;
                            return false;
                        }
                    })()}
                    className="w-full bg-[#FFC72C] hover:bg-[#ffcf4b] text-black font-bold py-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-between px-6"
                >
                    <span>Add to Order</span>
                    <span>
                        Rs. {(() => {
                            let total = 0;
                            
                            if (selectedProduct.isDeal) {
                                // 1. Start with Deal Base Price
                                total = Number(selectedProduct.dealPrice || selectedProduct.price || 0);
                                
                                // 2. Add extra costs from ALL products in the deal (Variants + Addons)
                                // We iterate over the full product list to capture selections from state
                                (selectedProduct.products || []).forEach((_, idx) => {
                                    const selection = selectedDealProducts[idx] || {};
                                    
                                    // Add Variant Price
                                    if (selection.variant && selection.variant.price) {
                                        total += Number(selection.variant.price);
                                    }
                                    
                                    // Add Addons Prices (Flavors, Beverages, Extras)
                                    if (selection.addons) {
                                        Object.values(selection.addons).forEach(addon => {
                                            total += Number(addon.price || 0) * (addon.quantity || 1);
                                        });
                                    }
                                });
                            } else {
                                // Regular Product Logic
                                total = Number(selectedProduct.price || 0);
                                if (selectedProduct.discountPrice && Number(selectedProduct.discountPrice) > 0) {
                                    total = Number(selectedProduct.discountPrice);
                                }
                                if (selectedVariants.price) {
                                    total = Number(selectedVariants.price);
                                }
                                Object.values(selectedAddons).forEach(a => total += Number(a.price || 0) * (a.quantity || 1));
                            }
                            
                            return total.toLocaleString();
                        })()}
                    </span>
                </button>
            </div>
          </motion.div>
        </div>
      )}
      {/* Mobile Cart Footer - Fixed Bottom */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] lg:hidden z-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="relative">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#E25C1D" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                 </svg>
                 <span className="absolute -top-1 -right-1 bg-[#E25C1D] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                   {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                 </span>
               </div>
               <span className="font-bold text-xl text-gray-900">
                 Rs {getTotalPrice().toLocaleString()}
               </span>
            </div>
            <button 
              onClick={() => navigate('/cart')}
              className="bg-[#FFC72C] text-black font-bold py-3 px-8 rounded-xl shadow-sm hover:bg-[#ffcf4b] transition-colors text-sm tracking-wider uppercase"
            >
              VIEW CART
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuPage;
