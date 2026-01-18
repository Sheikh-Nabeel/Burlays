import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import CartPage from "./components/CartPage";
import CategoriesGrid from "./components/CategoriesGrid";
import CategoryPage from "./components/CategoryPage";
import MenuPage from "./components/MenuPage"; // Import the new MenuPage
import ProductsPage from "./components/ProductsPage";
import SingleProduct from "./components/SingleProduct";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PaymentScreen from "./components/PaymentScreen";
import Header from "./components/Header";

const App = () => {
  return (
    <div className="bg-white text-darkSecondary font-serif">
      <ToastContainer position="top-right" autoClose={2000} />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/SingleProduct" element={<SingleProduct />} />

        {/* Menu Page - New Route */}
        <Route path="/menu" element={<MenuPage />} />

        {/* Categories */}
        <Route path="/categories" element={<CategoriesGrid />} />
        <Route path="/category/:categoryId" element={<CategoryPage />} />

        {/* Subcategory → Products */}
        <Route
          path="/category/:categoryId/sub/:subCategoryId"
          element={<ProductsPage />}
        />
        <Route path="/PaymentScreen" element={<PaymentScreen />} />
        
      </Routes>
    </div>
  );
};

export default App;
