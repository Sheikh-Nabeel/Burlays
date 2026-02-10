import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaShoppingCart, FaUser, FaPhone, FaMapMarkerAlt, FaTh, FaSearch, FaMapPin, FaSignOutAlt, FaBriefcase } from "react-icons/fa";
import { CgMenuRight, CgShoppingCart, CgProfile } from "react-icons/cg";
import { useCart } from "../contexts/CartContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

const Header = ({ scrollToSection, homeRef, menuRef, contactRef }) => {
  const { getTotalItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const PANEL_WIDTH = 360;

  // Check user auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Check if we are on the menu page
  const isMenuPage = location.pathname === '/menu';

  const handleSearch = (e) => {
    const query = e.target.value;
    if (isMenuPage) {
      // If already on menu page, just update the search param
      navigate(`/menu?search=${encodeURIComponent(query)}`, { replace: true });
    } else {
      // If not on menu page, navigate to menu page with search param
      navigate(`/menu?search=${encodeURIComponent(query)}`);
    }
  };

  const handleScrollToBlogs = () => {
    setIsMenuOpen(false);
    if (location.pathname === '/') {
      const element = document.getElementById('blogs-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/#blogs-section');
    }
  };

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

  const handleCallHotline = () => {
    const selectedBranch = JSON.parse(localStorage.getItem('selectedBranch') || '{}');
    let phone = selectedBranch.phone || '';

    if (!phone) {
        // Fallback or alert if no phone number
        return;
    }

    // 1. Remove spaces
    phone = phone.replace(/\s+/g, '');

    // 2. Handle 03... -> +923...
    if (phone.startsWith('03')) {
        phone = '+92' + phone.substring(1);
    } 
    // 3. If it doesn't start with +92, add it
    else if (!phone.startsWith('+92')) {
        // Handle case where it might start with 92 without +
        if (phone.startsWith('92')) {
            phone = '+' + phone;
        } else {
            phone = '+92' + phone;
        }
    }

    window.location.href = `tel:${phone}`;
  };

  return (
    <header className={`sticky top-0 w-full z-50 transition-transform duration-300 ${isVisible ? "translate-y-0" : "-translate-y-full"}`}>
      <nav className="bg-white border-b shadow-sm" style={{ borderColor: '#F1F3F4' }}>
        <div className="w-full px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              className="p-1 rounded-md"
              onClick={() => setIsMenuOpen(true)}
            >
               <CgMenuRight size={28} style={{ color: '#FFC72C' }} />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="Logo" className="h-8 md:h-10 w-auto" />
              <span className="font-extrabold text-xl md:text-2xl tracking-tight text-[#1E1E1E]">Burlays</span>
            </Link>
          </div>

          {isMenuPage && (
            <div className="hidden md:flex flex-1 mx-8 max-w-2xl gap-4">
              <div className="flex-1 relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Find in burlays" 
                    onChange={handleSearch}
                    className="w-full bg-gray-50 border-none rounded-md py-2.5 pl-10 pr-4 text-sm focus:ring-1 focus:ring-[#FFC72C]"
                  />
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            {/* Desktop View */}
            <div className="hidden md:flex items-center gap-3">
              <Link to="/cart" className="relative flex items-center gap-2 px-5 py-2.5 rounded-md font-bold text-sm shadow-sm transition-transform active:scale-95" style={{ backgroundColor: '#FFC72C', color: '#000000' }}>
                <FaShoppingCart className="w-4 h-4" />
                <span>CART</span>
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shadow-sm" style={{ backgroundColor: '#FF0000', color: '#FFFFFF' }}>
                  {getTotalItems()}
                </span>
              </Link>
              <button
                className="flex items-center gap-2 px-5 py-2.5 rounded-md font-bold text-sm shadow-sm transition-transform active:scale-95"
                onClick={() => user ? handleLogout() : navigate('/login')}
                style={{ backgroundColor: '#FFC72C', color: '#000000' }}
              >
                {user ? <FaSignOutAlt className="w-4 h-4" /> : <FaUser className="w-4 h-4" />}
                <span>{user ? 'LOGOUT' : 'LOGIN'}</span>
              </button>
            </div>

            {/* Mobile View */}
            <div className="flex md:hidden items-center gap-4">
              <Link to="/cart" className="relative flex items-center gap-1 text-[#E25C1D]">
                <CgShoppingCart className="w-7 h-7" />
                <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold bg-[#E25C1D] text-white">
                  {getTotalItems()}
                </span>
              </Link>
              <button
                onClick={() => user ? handleLogout() : navigate('/login')}
                className="text-[#E25C1D]"
              >
                {user ? <FaSignOutAlt className="w-6 h-6" /> : <CgProfile className="w-7 h-7" />}
              </button>
            </div>
          </div>
        </div>
      </nav>
      {createPortal(
        <AnimatePresence mode="wait">
          {isMenuOpen && (
            <div className="fixed inset-0 z-[100]" key="menu-portal">
              <motion.div
                className="fixed inset-0 z-[90] bg-black/50"
                onClick={() => setIsMenuOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
              <motion.aside
                className="fixed left-0 top-0 z-[110] h-screen shadow-2xl border-r bg-white"
                style={{ width: PANEL_WIDTH }}
                initial={{ x: -380 }}
                animate={{ x: 0 }}
                exit={{ x: -380 }}
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              >
                <div className="flex flex-col h-full bg-white">
                  <div className="flex flex-col px-6 py-6 border-b" style={{ borderColor: '#F1F3F4' }}>
                     <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-[#1E1E1E]" style={{ backgroundColor: '#FFC72C' }}>
                          <FaUser className="w-6 h-6" />
                        </div>
                        <div>
                          {user ? (
                             <>
                                <div className="text-sm text-gray-500">Welcome back</div>
                                <div className="text-sm font-bold text-[#1E1E1E]">{user.phoneNumber}</div>
                             </>
                          ) : (
                             <>
                                <div className="text-sm text-gray-500">Login to explore</div>
                                <div className="text-sm font-bold text-[#1E1E1E]">World of flavors</div>
                             </>
                          )}
                        </div>
                     </div>
                     {user ? (
                        <button 
                            onClick={handleLogout}
                            className="w-fit px-6 py-2 rounded border font-bold text-xs tracking-wider hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors" 
                            style={{ borderColor: '#000000', color: '#000000' }}
                        >
                            LOGOUT
                        </button>
                     ) : (
                        <button 
                            onClick={() => { navigate('/login'); setIsMenuOpen(false); }}
                            className="w-fit px-6 py-2 rounded border font-bold text-xs tracking-wider" 
                            style={{ borderColor: '#000000', color: '#000000' }}
                        >
                            LOGIN
                        </button>
                     )}
                  </div>
  
                  <div className="flex-1 py-2 overflow-y-auto bg-white">
                    <button 
                      className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                      onClick={() => { navigate('/menu'); setIsMenuOpen(false); }}
                    >
                      <FaTh className="w-5 h-5 text-gray-600" />
                      <span className="font-semibold text-sm text-[#1E1E1E]">Explore Menu</span>
                    </button>
                    
                    <button 
                      className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                      onClick={() => { navigate('/branches'); setIsMenuOpen(false); }}
                    >
                      <FaMapMarkerAlt className="w-5 h-5 text-gray-600" />
                      <span className="font-semibold text-sm text-[#1E1E1E]">Branch Locator</span>
                    </button>
                    
                    <button 
                      className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                      onClick={() => { 
                        localStorage.removeItem('selectedBranch');
                        window.location.href = '/';
                      }}
                    >
                      <FaMapPin className="w-5 h-5 text-gray-600" />
                      <span className="font-semibold text-sm text-[#1E1E1E]">Change Branch</span>
                    </button>
                    
                    <button 
                      className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                      onClick={() => { navigate('/careers'); setIsMenuOpen(false); }}
                    >
                      <FaBriefcase className="w-5 h-5 text-gray-600" />
                      <span className="font-semibold text-sm text-[#1E1E1E]">Job Opportunities</span>
                    </button>
                    
                    <div className="h-px bg-gray-100 my-2 mx-6"></div>

                  <button 
                    onClick={handleScrollToBlogs}
                    className="w-full text-left px-6 py-3 text-sm font-medium text-gray-600 hover:text-black transition-colors"
                  >
                    Blog
                  </button>
                  <button 
                    onClick={() => { navigate('/privacy-policy'); setIsMenuOpen(false); }}
                    className="w-full text-left px-6 py-3 text-sm font-medium text-gray-600 hover:text-black transition-colors"
                  >
                      Privacy Policy
                    </button>
                  </div>
  
                  <button 
                    onClick={handleCallHotline}
                    className="px-6 py-4 flex items-center justify-between mt-auto w-full hover:bg-[#ffcf4b] transition-colors" 
                    style={{ backgroundColor: '#FFC72C' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center">
                        <img src="/logo.png" alt="Logo" className="w-5 h-5 opacity-50" />
                      </div>
                      <span className="font-bold text-sm text-black">Burlays Hotline</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#1E1E1E] flex items-center justify-center text-[#FFC72C]">
                      <FaPhone className="w-4 h-4" />
                    </div>
                  </button>
                </div>
              </motion.aside>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </header>
  );
};

export default Header;
