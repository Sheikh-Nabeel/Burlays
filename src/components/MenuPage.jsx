import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { FaShoppingCart, FaPlus, FaChevronLeft, FaChevronRight, FaSpinner } from "react-icons/fa";
import { motion } from "framer-motion";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

const MenuPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart, cartItems, getTotalPrice } = useCart();
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [selectedAddons, setSelectedAddons] = useState({});

  const [activeCategory, setActiveCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  
  const categoryRefs = useRef({});

  // Fetch categories and products from Firebase

  // ... (existing code)

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setSelectedVariants({});
    setSelectedAddons({});
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;

    // Start with base price
    let finalPrice = Number(selectedProduct.price || 0);
    
    // If a variant is selected, use the variant's price instead of the base price
    // (Assuming variants override base price. If they are additive, change logic to +=)
    if (selectedVariants && selectedVariants.price) {
        finalPrice = Number(selectedVariants.price);
    }

    // Add addon prices
    Object.values(selectedAddons).forEach(addon => {
        finalPrice += Number(addon.price || 0);
    });

    const cartItem = {
        ...selectedProduct,
        price_pk: finalPrice,
        selectedVariants,
        selectedAddons,
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

      try {
        // 1. Get Categories
        const categoriesRef = collection(db, `branches/${selectedBranch.id}/categories`);
        const categoriesSnapshot = await getDocs(categoriesRef);
        
        const categoriesData = await Promise.all(categoriesSnapshot.docs.map(async (categoryDoc) => {
          // 2. Get Products for each Category
          // The collection name in your screenshot is "products" (lowercase), not "Products" (uppercase)
          const productsRef = collection(db, `branches/${selectedBranch.id}/categories/${categoryDoc.id}/products`);
          const productsSnapshot = await getDocs(productsRef);
          const productsData = productsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          return {
            id: categoryDoc.id,
            ...categoryDoc.data(),
            products: productsData
          };
        }));
        
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching menu data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, []);

  // Initialize refs
  useEffect(() => {
    categories.forEach(cat => {
      categoryRefs.current[cat.id] = React.createRef();
    });
  }, [categories]);

  // Handle initial scroll based on URL param
  useEffect(() => {
    if (loading || categories.length === 0) return;

    const catId = searchParams.get("category");
    if (catId && categoryRefs.current[catId]?.current) {
      setTimeout(() => {
        const headerOffset = 180; // Adjust based on header + nav height
        const element = categoryRefs.current[catId].current;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
  
        const container = document.getElementById('products-container');
        if (container) {
            // Calculate position inside the container
            const containerTop = container.getBoundingClientRect().top;
            const scrollOffset = elementPosition - containerTop + container.scrollTop - 20; // 20px padding
            
            container.scrollTo({
                top: scrollOffset,
                behavior: "smooth"
            });
        }

        setActiveCategory(catId);
      }, 500); // Increased timeout to ensure render
    } else if (categories.length > 0) {
       setActiveCategory(categories[0].id);
    }
  }, [searchParams, categories, loading]);

  useEffect(() => {
    const handleScroll = () => {
      const container = document.getElementById('products-container');
      if (!container) return;
      const scrollPosition = container.scrollTop + 200;

      for (const cat of categories) {
        const element = categoryRefs.current[cat.id]?.current;
        if (element) {
          // Since we are inside a scrolling container, we need to use offsetTop relative to the container
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveCategory(cat.id);
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
    navigate(`/menu?category=${catId}`, { replace: true });
    
    const element = categoryRefs.current[catId]?.current;
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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

  const getProductPrice = (product) => {
      // Logic to show base price or range if variants exist
      const validVariants = product.variants ? product.variants.filter(v => v.name) : [];
      if (validVariants.length > 0) {
          const prices = validVariants.map(v => Number(v.price));
          const minPrice = Math.min(...prices);
          return `Rs. ${minPrice}`;
      }
      return `Rs. ${Number(product.price || 0)}`;
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
                className="flex overflow-x-auto gap-3 scrollbar-hide px-8"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {filteredCategories.map((cat) => (
                <button
                    key={cat.id}
                    onClick={() => scrollToCategory(cat.id)}
                    className={`whitespace-nowrap px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                    activeCategory === cat.id
                        ? "bg-[#FFC72C] text-black shadow-md transform scale-105"
                        : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
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
                ref={categoryRefs.current[cat.id]}
                className="scroll-mt-4"
            >
              <h2 className="text-2xl font-bold mb-6 text-gray-800">{cat.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cat.products.map((product) => (
                  <div key={product.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow h-full">
                    <div className="relative w-full h-48 mb-4">
                        <img 
                            src={product.imagepath || "https://via.placeholder.com/150"} 
                            alt={product.name} 
                            className="w-full h-full object-cover rounded-lg"
                        />
                        <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm hover:text-red-500 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                            </svg>
                        </button>
                    </div>
                    
                    <div className="flex-1 flex flex-col">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">{product.name}</h3>
                        {product.description && <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">{product.description}</p>}
                        
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500 font-medium">Starting Price</span>
                                <span className="text-[#E25C1D] font-bold text-lg">{getProductPrice(product)}</span>
                            </div>
                            <button 
                                onClick={() => openProductModal(product)}
                                className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-800 px-4 py-2 rounded-lg text-sm font-bold transition-colors border border-gray-200"
                            >
                                <FaPlus className="w-3 h-3 text-[#FFC72C]" />
                                ADD
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
                                <div key={item.id} className="flex justify-between items-center text-left">
                                    <div>
                                        <div className="text-sm font-bold">{item.name}</div>
                                        <div className="text-xs text-gray-500">x{item.quantity}</div>
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
                    src={selectedProduct.imagepath || "https://via.placeholder.com/150"} 
                    alt={selectedProduct.name} 
                    className="w-full h-full object-cover"
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
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedProduct.name}</h2>
                <p className="text-gray-500 text-sm mb-6">{selectedProduct.description}</p>

                {/* Variants Section */}
                {selectedProduct.variants && selectedProduct.variants.length > 0 && selectedProduct.variants.some(v => v.name) && (
                    <div className="mb-6">
                        <h3 className="font-bold text-gray-800 mb-3 flex items-center justify-between">
                            Choose Variation 
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Required</span>
                        </h3>
                        <div className="space-y-3">
                            {selectedProduct.variants.filter(v => v.name).map((variant, index) => (
                                <label 
                                    key={index}
                                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                        selectedVariants.name === variant.name 
                                            ? 'border-[#FFC72C] bg-[#FFC72C]/5' 
                                            : 'border-gray-100 hover:border-gray-200'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                            selectedVariants.name === variant.name 
                                                ? 'border-[#FFC72C]' 
                                                : 'border-gray-300'
                                        }`}>
                                            {selectedVariants.name === variant.name && (
                                                <div className="w-2.5 h-2.5 rounded-full bg-[#FFC72C]"></div>
                                            )}
                                        </div>
                                        <span className="font-medium text-gray-700">{variant.name}</span>
                                    </div>
                                    <span className="font-bold text-gray-900">Rs. {variant.price}</span>
                                    <input 
                                        type="radio" 
                                        name="variant" 
                                        className="hidden"
                                        checked={selectedVariants.name === variant.name}
                                        onChange={() => setSelectedVariants(variant)}
                                    />
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {/* Addons Section */}
                {selectedProduct.addons && selectedProduct.addons.length > 0 && selectedProduct.addons.some(a => a.name) && (
                    <div className="mb-6">
                         <h3 className="font-bold text-gray-800 mb-3 flex items-center justify-between">
                            Add Ons 
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Optional</span>
                        </h3>
                        <div className="space-y-3">
                            {selectedProduct.addons.filter(a => a.name).map((addon, index) => (
                                <label 
                                    key={index}
                                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                        selectedAddons[index] 
                                            ? 'border-[#FFC72C] bg-[#FFC72C]/5' 
                                            : 'border-gray-100 hover:border-gray-200'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                            selectedAddons[index] 
                                                ? 'border-[#FFC72C] bg-[#FFC72C]' 
                                                : 'border-gray-300'
                                        }`}>
                                            {selectedAddons[index] && (
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-white">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>
                                        <span className="font-medium text-gray-700">{addon.name}</span>
                                    </div>
                                    <span className="font-bold text-gray-900">+ Rs. {addon.price}</span>
                                    <input 
                                        type="checkbox" 
                                        className="hidden"
                                        checked={!!selectedAddons[index]}
                                        onChange={(e) => {
                                            const newAddons = { ...selectedAddons };
                                            if (e.target.checked) {
                                                newAddons[index] = addon;
                                            } else {
                                                delete newAddons[index];
                                            }
                                            setSelectedAddons(newAddons);
                                        }}
                                    />
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-gray-100 bg-white">
                <button 
                    onClick={handleAddToCart}
                    disabled={selectedProduct.variants && selectedProduct.variants.filter(v => v.name).length > 0 && !selectedVariants.name}
                    className="w-full bg-[#FFC72C] hover:bg-[#ffcf4b] text-black font-bold py-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-between px-6"
                >
                    <span>Add to Order</span>
                    <span>
                        Rs. {(() => {
                            let total = Number(selectedProduct.price || 0);
                            // If variant selected, use that price instead of base (or add to it depending on your logic, usually variants replace base price)
                            if (selectedVariants.price) total = Number(selectedVariants.price);
                            
                            Object.values(selectedAddons).forEach(a => total += Number(a.price));
                            return total;
                        })()}
                    </span>
                </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MenuPage;
