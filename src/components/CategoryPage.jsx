import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { FaArrowLeft, FaShoppingCart, FaCheck } from "react-icons/fa";
import { useCart } from "../contexts/CartContext";
import { toast } from "react-toastify";
import Header from "./Header";
import { useLocation } from "../hooks/useLocation";

const CategoryPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();
  const { location } = useLocation();

  const [subcategories, setSubcategories] = useState([]);
  const [selectedSub, setSelectedSub] = useState(null);
  const [products, setProducts] = useState([]);
  const [categoryData, setCategoryData] = useState(null);

  const [selectedProduct, setSelectedProduct] = useState(null); // popup product
  const [selectedColor, setSelectedColor] = useState(null);

  // fetch category data
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const catRef = doc(db, "Web_Categories", categoryId);
        const catSnap = await getDoc(catRef);
        if (catSnap.exists()) {
          setCategoryData(catSnap.data());
        }
      } catch (error) {
        console.error("Error fetching category:", error);
      }
    };
    fetchCategory();
  }, [categoryId]);

  // fetch subcategories
  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        const subColRef = collection(
          db,
          "Web_Categories",
          categoryId,
          "SubCategories"
        );
        const subSnap = await getDocs(subColRef);
        const subs = subSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setSubcategories(subs);
        if (subs.length > 0) {
          setSelectedSub(subs[0].id);
        }
      } catch (error) {
        console.error("Error fetching subcategories:", error);
      }
    };
    fetchSubCategories();
  }, [categoryId]);

  // fetch products of selected subcategory
  useEffect(() => {
    const fetchProducts = async () => {
      if (!selectedSub) return;
      try {
        const prodRef = collection(
          db,
          "Web_Categories",
          categoryId,
          "SubCategories",
          selectedSub,
          "Products"
        );
        const prodSnap = await getDocs(prodRef);
        const prods = prodSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(prods);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, [categoryId, selectedSub]);

  const isPakistan = location?.countryCode === "PK";

  return (
    <>
      <Header />
      <div className="min-h-screen bg-black text-white p-">
        {/* Back Button */}

        {/* Banner */}
        <div className="relative w-full h-64 mb-6 overflow-hidden">
          <img
            src={
              categoryData?.imageUrl || "https://via.placeholder.com/1200x300"
            }
            alt={categoryData?.categoryName || categoryId}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-4xl font-bold capitalize">
              {categoryData?.categoryName || categoryId}
            </h1>
          </div>
        </div>

        {/* Subcategory Buttons */}
        <div className="flex px-3 whitespace-nowrap gap-3 mb-6 overflow-x-auto no-scrollbar">
          {subcategories.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSelectedSub(sub.id)}
              className={`px-4 py-2 rounded-full ${
                selectedSub === sub.id ? "bg-red-600" : "bg-gray-800"
              } text-white hover:bg-gray-700`}
            >
              {sub.name || sub.id}
            </button>
          ))}
        </div>

        {/* Products */}
        <div className="grid grid-cols-2 px-3 md:grid-cols-4 gap-3 md:gap-6">
          {products.map((prod) => {
            const price = isPakistan ? prod.price_pk : prod.price_uk;
            const currency = isPakistan ? "PKR" : "£";
            const isInCart = cartItems.some((item) => item.id === prod.id);

            return (
              <div
                key={prod.id}
                onClick={() => setSelectedProduct(prod)} // open popup
                className="bg-gray-900 rounded-lg flex flex-col cursor-pointer hover:scale-105 transition-transform"
              >
                <div className="relative">
                  <img
                    src={prod.productPic || "https://via.placeholder.com/300"}
                    alt={prod.name}
                    className="w-full h-36 md:h-48 object-cover rounded-lg mb-4"
                  />

                  {/* ✅ Stock badge */}
                  <span
                    className={`absolute top-2 right-2 px-3 py-1 text-xs font-bold rounded-full ${
                      prod.inStock ? "bg-green-600" : "bg-red-600"
                    }`}
                  >
                    {prod.inStock ? "In Stock" : "Out of Stock"}
                  </span>
                </div>

                <h3 className="text-lg px-2 font-semibold">{prod.name}</h3>
                <p className="text-gray-400 px-2 text-sm mb-2">
                  {prod.description || "No description"}
                </p>

                <div className="flex gap-3 px-2 items-center mb-3">
                  <p className="text-white font-bold">
                    {currency} {price}
                  </p>
                  <p className="text-sm text-gray-500">
                    {prod.inStock ? "Min 2 days." : "Ships in 7 days"}
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isInCart && prod.inStock) {
                      addToCart(prod);
                      toast.success(`${prod.name} added to cart!`);
                    }
                  }}
                  disabled={!prod.inStock}
                  className={`mt-auto px-4 py-2 rounded-xl flex items-center justify-center ${
                    !prod.inStock
                      ? "bg-gray-700 cursor-not-allowed"
                      : isInCart
                      ? "bg-green-600 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {!prod.inStock ? (
                    "Out of Stock"
                  ) : isInCart ? (
                    <>
                      <FaCheck className="mr-2" /> Added
                    </>
                  ) : (
                    <>
                      <FaShoppingCart className="mr-2" /> Add to Cart
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Product Popup */}
      {/* Product Popup */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-lg relative">
            {/* Close button */}
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
            >
              ✕
            </button>

            {/* Product Image */}
            <img
              src={
                selectedProduct.productPic ||
                "https://via.placeholder.com/400x300"
              }
              alt={selectedProduct.name}
              className="w-full h-64 object-cover rounded-lg mb-4"
            />

            {/* Product Info */}
            <h2 className="text-2xl text-white font-bold mb-2">
              {selectedProduct.name}
            </h2>
            <p className="text-gray-400 mb-3">
              {selectedProduct.description || "No description"}
            </p>

            {/* Colors */}
            {selectedProduct.colors && selectedProduct.colors.length > 0 && (
              <div className="mb-4">
                <p className="font-semibold text-white mb-2">Select Color:</p>
                <div className="flex gap-2">
                  {selectedProduct.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      title={color} // tooltip shows name on hover
                      style={{ backgroundColor: color }}
                      className={`w-8 h-8 rounded-full border-2 ${
                        selectedColor === color
                          ? "border-red-600 scale-110"
                          : "border-gray-400"
                      } transition-transform`}
                    />
                  ))}
                </div>

                {/* Show which color is selected */}
                {selectedColor && (
                  <p className="mt-2 text-sm text-gray-300">
                    Selected:{" "}
                    <span className="font-semibold text-white">
                      {selectedColor}
                    </span>
                  </p>
                )}
              </div>
            )}

            {/* Add to Cart button */}
            <button
              onClick={() => {
                if (!selectedProduct.inStock) return;
                if (selectedProduct.colors?.length > 0 && !selectedColor) {
                  return alert("Please select a color before adding to cart");
                }

                addToCart({
                  ...selectedProduct,
                  selectedColor: selectedColor || null, // 👈 save color with product
                });
                toast.success(
                  `${selectedProduct.name} ${
                    selectedColor ? `(${selectedColor}) ` : ""
                  }added to cart!`
                );
                setSelectedProduct(null); // close popup after adding
                setSelectedColor(null); // reset selection
              }}
              disabled={!selectedProduct.inStock}
              className={`mt-4 w-full px-6 py-3 rounded-lg font-semibold text-white ${
                !selectedProduct.inStock
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {selectedProduct.inStock ? "Add to Cart" : "Out of Stock"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CategoryPage;
