import React, { useState } from "react";
import { FaArrowLeft, FaShoppingCart } from "react-icons/fa";
import { useCart } from "../contexts/CartContext";

const COLORS = {
  primary: "#FFC72C",
  darkBg: "#000000",
  white: "#FFFFFF",
  gray: "#F1F3F4",
};

const SingleProduct = ({ product, onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState("Baby Food");
  const { addToCart } = useCart();

  const categories = [
    "Baby Food",
    "Baby Lotions & Oils",
    "Diapers & Wipes",
    "Feeding Bottles & Nipples",
    "Milk Formula",
  ];

  return (
    <div className="min-h-screen fixed inset-0 z-50 bg-black text-white p-4">
      {/* Back Button and Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="flex items-center text-white hover:text-[#FFC72C] transition-colors"
        >
          <FaArrowLeft className="w-5 h-5 mr-2" />
          Back to s
        </button>
      </div>

      {/* Product Image and Banner */}
      <div className="relative w-full h-64 mb-6 overflow-hidden">
        <img
          src="https://via.placeholder.com/1200x300"
          alt="Baby Products"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <h1 className="text-4xl font-bold">Baby Products</h1>
        </div>
      </div>

      {/* Category Buttons */}
      <div className="flex space-x-4 mb-6">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full ${
              selectedCategory === category ? "bg-[#FFC72C] text-black" : "bg-gray-800 text-white"
            } hover:bg-gray-700`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Product Image and Stock Status */}
      <div className="flex items-center justify-between">
        <img src="" alt="" />
        <span className="bg-green-500 text-white px-2 py-1 rounded-full text-sm">
          In Stock
        </span>
      </div>

      {/* Add to Cart Button */}
      <div className="absolute bottom-4 right-4">
        <button
          onClick={() => addToCart(product)}
          className="text-black px-4 py-2 rounded-full flex items-center"
          style={{ backgroundColor: "#FFC72C" }}
        >
          <FaShoppingCart className="w-5 h-5 mr-2" />
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default SingleProduct;
