import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { FaArrowLeft, FaShoppingCart } from "react-icons/fa";
import { useCart } from "../contexts/CartContext";

const ProductsPage = () => {
  const { categoryId, subCategoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsRef = collection(
          db,
          "Web_Categories",
          categoryId,
          "SubCategories",
          subCategoryId,
          "Products"
        );
        const snapshot = await getDocs(productsRef);
        setProducts(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId, subCategoryId]);

  if (loading) return <p className="text-white">Loading...</p>;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center mb-6 text-red-500 hover:underline"
      >
        <FaArrowLeft className="mr-2" /> Back
      </button>

      <h1 className="text-3xl font-bold mb-6">
        {categoryId} / {subCategoryId}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((prod) => (
          <div key={prod.id} className="bg-gray-900 p-4 rounded-lg">
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
              className="mt-3 bg-red-600 px-4 py-2 rounded-lg flex items-center hover:bg-red-700"
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
