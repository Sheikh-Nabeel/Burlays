import React from "react";

const COLORS = {
  primary: "#FFC72C",
  darkBg: "#000000",
  white: "#FFFFFF",
  gray: "#F1F3F4",
};

const CartScreen = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <div className="min-h-screen bg-black text-white w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center p-4 bg-gray-900">
          <div className="flex items-center space-x-2">
            <span
              className="text-xl font-cursive"
              style={{ color: COLORS.white }}
            >
              Riaz
            </span>
            <span
              className="text-xl font-bold"
              style={{ color: COLORS.primary }}
            >
              Bakers
            </span>
          </div>
          <h2
            className="text-xl font-semibold"
            style={{ color: COLORS.primary }}
          >
            Your Cart
          </h2>
          <button className="text-gray-400 hover:text-white" onClick={onClose}>
            <span className="text-xl">×</span>
          </button>
        </div>

        {/* Cart Content */}
        <div className="flex flex-col items-center justify-center h-[calc(100vh-120px)]">
          <img
            src="https://via.placeholder.com/150?text=Cart+Icon"
            alt="Empty Cart"
            className="w-36 h-36 mb-4"
          />
          <p className="text-[#FFC72C] text-lg font-medium">
            Your cart is empty!
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-4 bg-gray-900">
          <div className="text-gray-400">
            <p>Items: 0</p>
            <p>Total: Rs.0.0</p>
          </div>
          <button
            className="px-6 py-2 rounded-full font-semibold"
            style={{ backgroundColor: COLORS.primary, color: "#000000" }}
          >
            Proceed to Pay
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartScreen;
