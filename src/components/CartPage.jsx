// src/components/CartPage.jsx
import React from "react";
import CartScreen from "./CartScreen";

const CartPage = () => {
  return (
    <div className="bg-black min-h-screen pt-20">
      <h1 className="text-center text-white text-2xl font-bold mb-6">
        Your Cart
      </h1>
      <CartScreen />
    </div>
  );
};

export default CartPage;
