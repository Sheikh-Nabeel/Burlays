// components/CategoriesGrid.jsx
import React, { useRef } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getCategories } from "../utils/constants";

const CategoriesGrid = () => {
  const categories = getCategories();
  const navigate = useNavigate();
  const scrollRef = useRef(null);

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
                      src={cat.imageUrl}
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
