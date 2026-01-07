import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProducts } from "../utils/constants";
import { FaArrowLeft, FaShoppingCart } from "react-icons/fa";
import { useCart } from "../contexts/CartContext";

const ProductsPage = () => {
  const { categoryId, subCategoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const prods = getProducts(categoryId, subCategoryId);
      setProducts(prods);
    } finally {
      setLoading(false);
    }
  }, [categoryId, subCategoryId]);

  if (loading) return <p className="text-darkSecondary">Loading...</p>;

  return (
    <div className="min-h-screen bg-white text-darkSecondary p-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center mb-6 text-[#FFC72C] hover:underline"
      >
        <FaArrowLeft className="mr-2" /> Back
      </button>

      <h1 className="text-3xl font-bold mb-6">
        {categoryId} / {subCategoryId}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((prod) => (
          <div key={prod.id} className="bg-white p-4 rounded-lg border border-grayLight">
            <img
              src={prod.productPic || "https://via.placeholder.com/200"}
              alt={prod.name}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h3 className="text-xl font-semibold">{prod.name}</h3>
            <p className="text-gray-400">
              PKR {prod.price_pk} / £{prod.price_uk}
            </p>
            <button
              onClick={() => addToCart(prod)}
              className="mt-3 px-4 py-2 rounded-lg flex items-center text-black"
              style={{ backgroundColor: "#FFC72C" }}
            >
              <FaShoppingCart className="mr-2" /> Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsPage;
