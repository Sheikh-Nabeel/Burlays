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
import { Link, useLocation } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import BlogDetail from "./components/BlogDetail";

import BranchLocatorPage from "./components/BranchLocatorPage";
import BranchDetailsPage from "./components/BranchDetailsPage";

const App = () => {
  const location = useLocation();
  const hideFloatingButtonPaths = ['/login', '/cart', '/PaymentScreen', '/branches'];
  const shouldHideFloatingButton = hideFloatingButtonPaths.some(path => location.pathname.startsWith(path));
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="bg-white text-darkSecondary font-serif relative">
      <ToastContainer position="top-right" autoClose={2000} />
      {!isLoginPage && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/SingleProduct" element={<SingleProduct />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Menu Page - New Route */}
        <Route path="/menu" element={<MenuPage />} />

        {/* Blog Detail */}
        <Route path="/blog/:blogId" element={<BlogDetail />} />
        
        {/* Branch Locator */}
        <Route path="/branches" element={<BranchLocatorPage />} />
        <Route path="/branches/:branchId" element={<BranchDetailsPage />} />

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

      {/* Floating Order Now Button */}
      {!shouldHideFloatingButton && (
        <Link 
          to="/menu" 
          className="fixed bottom-6 right-6 z-50 bg-[#E25C1D] text-white font-bold px-5 py-2 rounded-full shadow-lg hover:bg-[#c94e16] transition-all hover:scale-105 flex items-center gap-2 text-sm"
        >
          <span>ORDER NOW</span>
        </Link>
      )}
    </div>
  );
};

export default App;
