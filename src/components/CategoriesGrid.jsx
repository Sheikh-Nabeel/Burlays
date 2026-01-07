// components/CategoriesGrid.jsx
import React, { useEffect, useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

const CategoriesGrid = () => {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      const snap = await getDocs(collection(db, "Web_Categories"));
      setCategories(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-black pb-20 ">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-4xl font-semiboldbold text-white my-8 text-center font-serif">
          Our Categories
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigate(`/category/${cat.id}`)}
              className="relative cursor-pointer rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-red-500/80"
            >
              <img
                src={cat.imageUrl}
                alt={cat.categoryName}
                className="w-full h-52 md:h-96 object-cover"
              />
              <div className="absolute bottom-0 w-full bg-black/60 py-3 text-center">
                <h3 className="text-white font-bold">{cat.categoryName}</h3>
              </div>
              <div className="absolute top-4 right-4 bg-red-600 p-2 rounded-full text-white">
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
