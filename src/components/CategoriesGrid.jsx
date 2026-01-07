// components/CategoriesGrid.jsx
import React, { useEffect, useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getCategories } from "../utils/constants";

const CategoriesGrid = () => {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setCategories(getCategories());
  }, []);

  return (
    <div className="min-h-screen bg-white pb-20 ">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-4xl font-semiboldbold text-darkSecondary my-8 text-center font-serif">
          Our Categories
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigate(`/category/${cat.id}`)}
              className="relative cursor-pointer rounded-xl overflow-hidden hover:shadow-2xl hover:ring-2 hover:ring-[#FFC72C]"
            >
              <img
                src={cat.imageUrl}
                alt={cat.name}
                className="w-full h-52 md:h-96 object-cover"
              />
              <div className="absolute bottom-0 w-full bg-black/60 py-3 text-center">
                <h3 className="text-white font-bold">{cat.name}</h3>
              </div>
              <div className="absolute top-4 right-4 bg-[#FFC72C] p-2 rounded-full text-black">
                <FaArrowRight />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoriesGrid;
