import React from "react";
import { useCart } from "../contexts/CartContext";
import { FaTrash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useLocation } from "../hooks/useLocation";

const COLORS = {
  primary: "#FFC72C",
  darkBg: "#000000",
  white: "#FFFFFF",
  gray: "#F1F3F4",
};

const CartScreen = ({ onClose }) => {
  const {
    cartItems,
    removeFromCart,
    getTotalPrice,
    getTotalItems,
    updateQuantity,
  } = useCart();

  const { location } = useLocation();
  const navigate = useNavigate(); // ⬅ initialize navigate

  const isPakistan = location?.countryCode === "PK";
  const currencySymbol = isPakistan ? "Rs." : "£";

  const total = cartItems.reduce((sum, item) => {
    const price = isPakistan ? item.price_pk : item.price_uk;
    return sum + price * item.quantity;
  }, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <div className="relative min-h-screen bg-gradient-to-b from-[#0f0f10] to-[#1a1a1a] text-white w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-800 bg-[#1a1a1a]/70 backdrop-blur-xl">
          <Link to="/">
            <img src="/logo.png" className="w-28 drop-shadow-lg" alt="Logo" />
          </Link>
          <h2
            className="text-2xl font-extrabold tracking-wide uppercase drop-shadow"
            style={{ color: COLORS.primary }}
          >
            Your Cart
          </h2>
          <button
            onClick={() => navigate(-1)} // ⬅ go back one page
            className="text-4xl font-light text-gray-400 hover:text-white transition transform hover:rotate-90"
          >
            ×
          </button>
        </div>

        {/* Cart Content */}
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-160px)] text-center px-4">
            <img
              src="/carts.png"
              alt="Empty Cart"
              className="w-36 h-36 sm:w-44 sm:h-44 mb-6 opacity-80 animate-bounce"
            />
            <p className="text-lg font-semibold text-[#FFC72C]">
              Your cart is empty!
            </p>
            <p className="text-gray-400 mt-2 text-sm">
              Add some delicious items to continue shopping.
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-6 w-full max-w-5xl mx-auto overflow-y-auto custom-scroll h-[calc(100vh-180px)]">
            {cartItems.map((item, index) => {
              const price = isPakistan ? item.price_pk : item.price_uk;
              return (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-[#1E1E1E]/70 border border-gray-700 shadow-lg hover:shadow-2xl transition-all duration-300 hover:border-[#FFC72C] backdrop-blur-md group"
                >
                  {/* Product Info */}
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative">
                      <img
                        src={
                          item.productPic || "https://via.placeholder.com/80"
                        }
                        alt={item.name || "Product"}
                        className="w-20 h-20 object-cover rounded-xl border border-gray-700 group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute -top-2 -right-2 bg-[#FFC72C] text-black text-xs px-2 py-0.5 rounded-full shadow">
                        {item.quantity}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {item.name || "Unnamed"}
                      </h3>

                      {item.selectedColor && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-400">Color:</span>
                          <span
                            className="w-5 h-5 rounded-full border border-gray-400"
                            style={{ backgroundColor: item.selectedColor }}
                            title={item.selectedColor} // tooltip shows actual color name/hex
                          />
                        </div>
                      )}

                      <p className="text-gray-400 text-sm mt-1">
                        {currencySymbol} {price}
                      </p>
                    </div>
                  </div>

                  {/* Quantity + Remove */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 mt-4 sm:mt-0 w-full sm:w-auto">
                    <div className="flex items-center bg-[#2a2a2a]/60 rounded-full px-2 py-1 backdrop-blur-sm">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="px-3 py-1 rounded-full hover:bg-gray-600 transition text-lg"
                      >
                        −
                      </button>
                      <span className="px-4 text-lg font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="px-3 py-1 rounded-full hover:bg-gray-600 transition text-lg"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 rounded-full bg-[#FFC72C]/20 hover:bg-[#FFC72C]/40 transition transform hover:scale-110"
                    >
                      <FaTrash size={18} className="text-[#FFC72C]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-col sm:flex-row fixed bottom-0 w-full justify-between items-center gap-4 px-6 py-5 bg-[#1a1a1a]/90 backdrop-blur-xl border-t border-gray-800 shadow-xl">
          <div className="text-gray-300 text-center sm:text-left">
            <p className="text-sm tracking-wide">Items: {getTotalItems()}</p>
            <p className="text-xl font-bold text-white drop-shadow">
              Total: {currencySymbol}
              {total}
            </p>
          </div>
          <Link
            to="/PaymentScreen"
            className="w-full sm:w-auto px-10 py-3 rounded-full font-semibold text-white shadow-lg hover:shadow-2xl transition text-center text-lg animate-pulse"
            style={{ backgroundColor: COLORS.primary }}
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartScreen;
