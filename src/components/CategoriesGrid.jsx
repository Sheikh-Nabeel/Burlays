// components/CategoriesGrid.jsx
import React, { useRef, useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight, FaSpinner } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

const CategoriesGrid = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      const selectedBranch = JSON.parse(localStorage.getItem('selectedBranch'));
      
      if (!selectedBranch) {
        setLoading(false);
        return;
      }

      try {
        let categoriesRef;
        let dealsRef;
        
        // Use the new nested structure: cities/{cityId}/branches/{branchId}/categories
        if (selectedBranch.cityId) {
             categoriesRef = collection(db, `cities/${selectedBranch.cityId}/branches/${selectedBranch.id}/categories`);
             dealsRef = collection(db, `cities/${selectedBranch.cityId}/branches/${selectedBranch.id}/deals`);
        } else {
             // Fallback
             console.warn("Missing cityId in selectedBranch, attempting to use provided schema path structure.");
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
             if (data.endDate) {
                 const end = data.endDate.toDate ? data.endDate.toDate() : new Date(data.endDate);
                 if (end < new Date()) return null;
             }
             if (!data.isActive) return null;
             return { id: doc.id, ...data };
        }).filter(Boolean);

        const categoriesData = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })).filter(cat => cat.active !== false);
        
        let finalData = categoriesData;
        
        // Prepend Deals as a category if available
        if (deals.length > 0) {
            const dealsCategory = {
                id: 'deals-category',
                name: 'Deals',
                imageUrl: 'https://cdn-icons-png.flaticon.com/512/662/662846.png', // Generic deal icon or use specific image
                isDealCategory: true
            };
            finalData = [dealsCategory, ...categoriesData];
        }

        setCategories(finalData);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (catId) => {
    if (catId === 'deals-category') {
        // Scroll to deals or just navigate to menu with deals selected (which is default logic)
        navigate(`/menu?category=deals-category`);
    } else {
        navigate(`/menu?category=${catId}`);
    }
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = 300;
      if (direction === "left") {
        current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white py-10 flex justify-center">
        <FaSpinner className="animate-spin text-3xl text-[#FFC72C]" />
      </div>
    );
  }

  return (
    <div className="bg-white py-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6 px-4">
          <h2 className="text-xl md:text-3xl font-bold text-darkSecondary">
            Explore Menu
          </h2>
          <button 
            onClick={() => navigate('/menu')}
            className="text-[#E25C1D] hover:text-[#c44e18] font-semibold text-xs md:text-base tracking-wider transition-colors"
          >
            VIEW ALL
          </button>
        </div>

        <div className="relative group flex items-center justify-between gap-2">
          {/* Left Arrow */}
          <button
            onClick={() => scroll("left")}
            className="z-10 w-10 h-10 bg-white shadow-lg rounded-xl flex-shrink-0 flex items-center justify-center text-gray-600 hover:text-[#FFC72C] transition-colors border border-gray-100"
          >
            <FaChevronLeft className="w-4 h-4" />
          </button>

          {/* Slider Container */}
          <div 
            ref={scrollRef}
            className="flex overflow-x-auto gap-4 md:gap-6 py-4 scrollbar-hide scroll-smooth snap-x snap-mandatory px-4 max-w-[280px] md:max-w-full"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className="flex-shrink-0 w-52 md:w-72 cursor-pointer group/card snap-center"
              >
                <div className="bg-white rounded-xl border border-gray-200 group-hover/card:border-[#FFC72C] transition-all duration-300 p-4 h-full flex flex-col items-center shadow-sm hover:shadow-md">
                  <div className="w-full aspect-square mb-2 rounded-xl overflow-hidden bg-white">
                    <img
                      src={cat.imageUrl || "https://via.placeholder.com/150"}
                      alt={cat.name}
                      className="w-full h-full object-contain transform group-hover/card:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="text-darkSecondary font-bold text-xs md:text-lg uppercase tracking-wide text-center mt-auto">
                    {cat.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => scroll("right")}
            className="z-10 w-10 h-10 bg-white shadow-lg rounded-xl flex-shrink-0 flex items-center justify-center text-gray-600 hover:text-[#FFC72C] transition-colors border border-gray-100"
          >
            <FaChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoriesGrid;
