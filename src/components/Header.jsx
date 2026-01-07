import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaShoppingCart, FaChevronDown, FaUser, FaPhone, FaUtensils, FaMapMarkerAlt } from "react-icons/fa";
import { useCart } from "../contexts/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { CATALOG } from "../utils/constants";

const MenuIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    width="24"
    height="24"
    aria-hidden="true"
  >
    <rect x="3" y="5" width="18" height="2" rx="1" fill="#1E1E1E" />
    <rect x="3" y="11" width="18" height="2" rx="1" fill="#1E1E1E" />
    <rect x="3" y="17" width="18" height="2" rx="1" fill="#1E1E1E" />
  </svg>
);

const Header = ({ scrollToSection, homeRef, menuRef, contactRef }) => {
  const { getTotalItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [categories, setCategories] = useState([]);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState(null); // ✅ fix
  const navigate = useNavigate();
  const PANEL_WIDTH = 360;

  // Navbar hide/show on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY < lastScrollY || currentScrollY < 10);
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
  }, [isMenuOpen]);

  useEffect(() => {
    setCategories(CATALOG.map(cat => ({
      id: cat.id,
      name: cat.name,
      subcategories: cat.subcategories.map(sub => ({ id: sub.id, name: sub.name }))
    })));
  }, []);

  return (
    <header className={`sticky top-0 w-full z-50 transition-transform duration-300 ${isVisible ? "translate-y-0" : "-translate-y-full"}`}>
      <nav className="bg-white border-b shadow-sm" style={{ borderColor: '#F1F3F4' }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="p-2 rounded-md"
              onClick={() => setIsMenuOpen(true)}
              style={{ color: '#1E1E1E' }}
            >
              <MenuIcon className="w-6 h-6" />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="Logo" className="h-8" />
              <span className="font-bold text-lg" style={{ color: '#1E1E1E' }}>Burlays</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/cart" className="relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold" style={{ backgroundColor: '#FFC72C', color: '#000000' }}>
              <FaShoppingCart className="w-4 h-4" />
              <span>CART</span>
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs" style={{ backgroundColor: '#000000', color: '#FFFFFF' }}>
                {getTotalItems()}
              </span>
            </Link>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
              onClick={() => setIsMenuOpen(true)}
              style={{ backgroundColor: '#FFC72C', color: '#000000' }}
            >
              <FaUser className="w-4 h-4" />
              <span>LOGIN</span>
            </button>
          </div>
        </div>
      </nav>
      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-50">
            <motion.div
              className="fixed inset-0 z-40 bg-black/50"
              onClick={() => setIsMenuOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.aside
              className="fixed left-0 top-0 z-50 h-full bg-white flex flex-col shadow-2xl border-r"
              style={{ color: '#1E1E1E', width: PANEL_WIDTH }}
              initial={{ x: -380 }}
              animate={{ x: 0 }}
              exit={{ x: -380 }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#F1F3F4' }}>
                <div className="flex items-center gap-2">
                  <FaUser className="w-5 h-5" />
                  <div>
                    <div className="text-sm">Login to explore</div>
                    <div className="text-xs font-semibold">World of flavors</div>
                  </div>
                </div>
                <button className="px-3 py-1 rounded border text-xs" onClick={() => setIsMenuOpen(false)} style={{ borderColor: '#1E1E1E', color: '#1E1E1E' }}>
                  LOGIN
                </button>
              </div>
              <div className="flex-1 px-4 py-4 space-y-4">
                <button className="w-full flex items-center justify-between px-3 py-3 rounded" onClick={() => { navigate('/categories'); setIsMenuOpen(false); }}>
                  <div className="flex items-center gap-3">
                    <FaUtensils className="w-5 h-5" />
                    <span>Explore Menu</span>
                  </div>
                  <FaChevronDown className="w-4 h-4 rotate-270" />
                </button>
                <button className="w-full flex items-center justify-between px-3 py-3 rounded" onClick={() => { navigate('/StoreLocator'); setIsMenuOpen(false); }}>
                  <div className="flex items-center gap-3">
                    <FaMapMarkerAlt className="w-5 h-5" />
                    <span>Branch Locator</span>
                  </div>
                  <FaChevronDown className="w-4 h-4 rotate-270" />
                </button>
                <button className="w-full text-left px-3 py-3 rounded">Blog</button>
                <button className="w-full text-left px-3 py-3 rounded">Privacy Policy</button>
              </div>
              <div className="mt-auto px-4 py-3 flex items-center justify-between" style={{ backgroundColor: '#FFC72C', color: '#000000' }}>
                <div className="flex items-center gap-2 font-semibold">
                  <FaPhone className="w-4 h-4" />
                  <span>Hotline</span>
                </div>
                <button className="px-3 py-1 rounded text-sm font-semibold" style={{ backgroundColor: '#000000', color: '#FFFFFF' }} onClick={() => setIsMenuOpen(false)}>
                  Close
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
