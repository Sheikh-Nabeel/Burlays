import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getAllProducts, getCategories } from "../utils/constants";
import { useCart } from "../contexts/CartContext";
import { FaShoppingCart, FaPlus, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { motion } from "framer-motion";

const MenuPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart, cartItems, getTotalPrice } = useCart();
  
  const [activeCategory, setActiveCategory] = useState("");
  const categories = getCategories();
  const products = getAllProducts();
  const scrollRef = useRef(null);
  
  const categoryRefs = useRef({});

  // Initialize refs
  useEffect(() => {
    products.forEach(cat => {
      categoryRefs.current[cat.id] = React.createRef();
    });
  }, [products]);

  // Handle initial scroll based on URL param
  useEffect(() => {
    const catId = searchParams.get("category");
    if (catId && categoryRefs.current[catId]?.current) {
      setTimeout(() => {
        const headerOffset = 180; // Adjust based on header + nav height
        const element = categoryRefs.current[catId].current;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
  
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
        setActiveCategory(catId);
      }, 100);
    } else if (products.length > 0) {
       setActiveCategory(products[0].id);
    }
  }, [searchParams, products]);

  useEffect(() => {
    const handleScroll = () => {
      const container = document.getElementById('products-container');
      if (!container) return;
      const scrollPosition = container.scrollTop + 200;

      for (const cat of products) {
        const element = categoryRefs.current[cat.id]?.current;
        if (element) {
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
  }, [products]);

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
                {products.map((cat) => (
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
          {products.map((cat) => (
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
                            src={product.productPic} 
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
                        <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">{product.description}</p>
                        
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500 font-medium">Starting Price</span>
                                <span className="text-[#E25C1D] font-bold text-lg">Rs. {product.price_pk.toLocaleString()}</span>
                            </div>
                            <button 
                                onClick={() => addToCart(product)}
                                className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-800 px-4 py-2 rounded-lg text-sm font-bold transition-colors border border-gray-200"
                            >
                                <FaPlus className="w-3 h-3 text-[#FFC72C]" />
                                ADD TO CART
                            </button>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
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
    </div>
  );
};

export default MenuPage;
