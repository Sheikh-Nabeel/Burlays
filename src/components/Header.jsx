import React, { useState, useEffect } from "react";
import { FaShoppingCart, FaBars, FaTimes, FaChevronDown } from "react-icons/fa";
import { useCart } from "../contexts/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

const Header = ({ scrollToSection, homeRef, menuRef, contactRef }) => {
  const { getTotalItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [categories, setCategories] = useState([]);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState(null); // ✅ fix
  const navigate = useNavigate();

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

  // Fetch categories + subcategories
  useEffect(() => {
    const fetchCategories = async () => {
      const categoriesCol = collection(db, "Web_Categories");
      const categoriesSnapshot = await getDocs(categoriesCol);

      const categoriesData = await Promise.all(
        categoriesSnapshot.docs.map(async (catDoc) => {
          const subCol = collection(
            db,
            `Web_Categories/${catDoc.id}/SubCategories`
          );
          const subSnap = await getDocs(subCol);

          const subcategories = subSnap.docs.map((subDoc) => ({
            id: subDoc.id,
            ...subDoc.data(),
          }));

          return {
            id: catDoc.id,
            ...catDoc.data(),
            subcategories,
          };
        })
      );

      setCategories(categoriesData);
    };

    fetchCategories();
  }, []);

  return (
    <header
      className={`sticky top-0 w-full z-50 bg-black transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <nav className="gradient-bg border-b border-gray-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link to="/">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-12 cursor-pointer"
              onClick={() => scrollToSection(homeRef)}
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection(homeRef)}
              className="text-white hover:text-primary transition-colors font-medium"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection(menuRef)}
              className="text-white hover:text-primary transition-colors font-medium"
            >
              Menu
            </button>
            <button
              onClick={() => scrollToSection(contactRef)}
              className="text-white hover:text-primary transition-colors font-medium"
            >
              Contact
            </button>

            {/* Cart */}
            <Link to="/cart" className="relative p-2">
              <FaShoppingCart className="w-6 h-6 text-white" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <Link to="/cart" className="relative p-2">
              <FaShoppingCart className="w-6 h-6 text-white" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Link>
            <button
              className="text-white p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <FaTimes className="w-6 h-6" />
              ) : (
                <FaBars className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Popup */}
        {isMenuOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col h-screen">
            {/* Close button */}
            <div className="flex justify-end p-4">
              <button
                className="text-white text-2xl"
                onClick={() => setIsMenuOpen(false)}
              >
                <FaTimes />
              </button>
            </div>

            {/* Menu Content */}
            <div className="flex-1 flex flex-col items-start px-6 py-4 space-y-3 overflow-y-auto">
              {/* Static Links */}
              <button
                onClick={() => {
                  scrollToSection(homeRef);
                  setIsMenuOpen(false);
                }}
                className="text-white text-lg w-full text-left py-2 hover:text-primary"
              >
                Home
              </button>

              <button
                onClick={() => {
                  scrollToSection(menuRef);
                  setIsMenuOpen(false);
                }}
                className="text-white text-lg w-full text-left py-2 hover:text-primary"
              >
                Menu
              </button>

              <button
                onClick={() => {
                  scrollToSection(contactRef);
                  setIsMenuOpen(false);
                }}
                className="text-white text-lg w-full text-left py-2 hover:text-primary"
              >
                Contact
              </button>

              {/* Categories Dropdown */}
              <div className="w-full">
                <button
                  onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                  className="flex items-center justify-between w-full text-white text-lg py-2 hover:text-primary"
                >
                  <span>Categories</span>
                  <FaChevronDown
                    className={`ml-2 transition-transform duration-300 ${
                      isCategoriesOpen ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>

                {/* Category + Subcategory rendering */}
                {isCategoriesOpen && (
                  <div className="ml-2 mt-2 flex flex-col space-y-2">
                    {categories.length > 0 ? (
                      categories.map((cat, idx) => (
                        <div key={cat.id} className="flex flex-col">
                          {/* Category */}
                          <button
                            onClick={() =>
                              setOpenCategory(openCategory === idx ? null : idx)
                            }
                            className="flex justify-between items-center text-gray-300 text-left py-2 hover:text-primary"
                          >
                            {cat.name || cat.id}
                            <FaChevronDown
                              className={`ml-2 text-sm transition-transform ${
                                openCategory === idx
                                  ? "rotate-180 text-primary"
                                  : ""
                              }`}
                            />
                          </button>

                          {/* Subcategories */}
                          {openCategory === idx && cat.subcategories && (
                            <div className="ml-4 mt-1 flex flex-col space-y-1 border-l border-gray-700 pl-3">
                              {cat.subcategories.map((sub) => (
                                <button
                                  key={sub.id}
                                  onClick={() => {
                                    navigate(
                                      `/category/${cat.id}/sub/${sub.id}`
                                    );
                                    setIsMenuOpen(false);
                                  }}
                                  className="text-gray-400 text-left py-1 hover:text-primary"
                                >
                                  {sub.name || sub.id}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-sm px-3">
                        Loading categories...
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
