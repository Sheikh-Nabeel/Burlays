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
        // Construct the path based on the user's specific database structure
        // cities/{cityId}/branches/{branchId}/categories
        
        // We need to know the cityId. 
        // 1. Check if it's already in the branch object (if we stored it during selection)
        // 2. If not, we might need to query or find it.
        
        let categoriesRef;
        
        // Use the new nested structure: cities/{cityId}/branches/{branchId}/categories
        if (selectedBranch.cityId) {
             categoriesRef = collection(db, `cities/${selectedBranch.cityId}/branches/${selectedBranch.id}/categories`);
        } else {
             // Fallback for legacy data or direct branch access without city context
             // Try to find the cityId from the branch document if possible, or assume a global structure (which we know is incorrect now but kept for safety)
             // Given the strict schema provided, it MUST be nested.
             console.warn("Missing cityId in selectedBranch, attempting to use provided schema path structure.");
             if (selectedBranch.cityId) {
                categoriesRef = collection(db, `cities/${selectedBranch.cityId}/branches/${selectedBranch.id}/categories`);
             } else {
                 // If we really don't have cityId, we can't construct the path. 
                 // However, the selectedBranch object SHOULD have cityId if it came from BranchSelection.
                 console.error("Critical Error: cityId missing from selectedBranch object", selectedBranch);
                 // Attempt global fallback just in case, but likely will fail or return nothing if collection doesn't exist
                 categoriesRef = collection(db, `branches/${selectedBranch.id}/categories`);
             }
        }

        const querySnapshot = await getDocs(categoriesRef);
        
        const categoriesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })).filter(cat => cat.active !== false); // Filter out inactive categories if 'active' field exists
        
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (catId) => {
    navigate(`/menu?category=${catId}`);
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-darkSecondary">
            Explore Menu
          </h2>
          <button 
            onClick={() => navigate('/categories')}
            className="text-[#E25C1D] font-bold text-sm hover:underline"
          >
            VIEW ALL
          </button>
        </div>

        <div className="relative group">
          {/* Left Arrow */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-gray-600 hover:text-[#FFC72C] transition-colors opacity-0 group-hover:opacity-100 duration-300 border border-gray-100"
          >
            <FaChevronLeft className="w-4 h-4" />
          </button>

          {/* Slider Container */}
          <div 
            ref={scrollRef}
            className="flex overflow-x-auto gap-6 pb-8 scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className="flex-shrink-0 w-64 md:w-72 cursor-pointer group/card"
              >
                <div className="bg-white rounded-xl border border-transparent group-hover/card:border-[#FFC72C] transition-all duration-300 p-4 h-full flex flex-col items-center shadow-sm hover:shadow-md">
                  <div className="w-48 h-48 mb-4 rounded-full overflow-hidden">
                    <img
                      src={cat.imageUrl || "https://via.placeholder.com/150"}
                      alt={cat.name}
                      className="w-full h-full object-cover transform group-hover/card:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="text-darkSecondary font-bold text-lg uppercase tracking-wide text-center mt-auto">
                    {cat.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-gray-600 hover:text-[#FFC72C] transition-colors opacity-0 group-hover:opacity-100 duration-300 border border-gray-100"
          >
            <FaChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoriesGrid;
