import React from "react";
import { useCart } from "../contexts/CartContext";
import { FaTrash, FaArrowLeft } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useLocation } from "../hooks/useLocation";

const COLORS = {
  primary: "#FFC72C",
  darkBg: "#000000",
  white: "#FFFFFF",
  gray: "#F1F3F4",
};

const CartScreen = () => {
  const {
    cartItems,
    removeFromCart,
    getTotalPrice,
    getTotalItems,
    updateQuantity,
  } = useCart();

  const { location } = useLocation();
  const navigate = useNavigate();

  const isPakistan = location?.countryCode === "PK";
  const currencySymbol = isPakistan ? "Rs." : "£";

  const total = getTotalPrice();

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
          >
            <FaArrowLeft className="w-5 h-5" />
          </button>
          
          <h1 className="text-xl font-bold text-gray-900">Your Cart</h1>
          
          <div className="w-9"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Cart Content */}
      <div className="max-w-3xl mx-auto px-4 pt-6">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-48 h-48 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                <img
                src="/carts.png"
                alt="Empty Cart"
                className="w-32 h-32 opacity-50"
                />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-500 mb-8 max-w-xs">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link
                to="/menu"
                className="bg-[#FFC72C] text-black font-bold px-8 py-3 rounded-xl hover:bg-[#ffcf4b] transition-colors shadow-sm"
            >
                Start Ordering
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item, index) => {
              const price = item.price_pk || item.price || 0;
              return (
                <div
                  key={index}
                  className="flex gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100"
                >
                  {/* Product Image */}
                  <div className="w-24 h-24 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                    <img
                      src={item.imagepath || item.productPic || "https://via.placeholder.com/80"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-gray-900 line-clamp-1">
                                {item.name}
                            </h3>
                            <p className="text-[#E25C1D] font-bold text-sm mt-1">
                                {currencySymbol} {Number(price).toLocaleString()}
                            </p>
                            
                            {/* Show Variants */}
                            {item.selectedVariants && item.selectedVariants.name && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Variant: {item.selectedVariants.name}
                                </p>
                            )}

                            {/* Show Addons */}
                            {item.selectedAddons && Object.values(item.selectedAddons).length > 0 && (
                                <div className="mt-1">
                                    <p className="text-xs text-gray-500 font-medium">Add-ons:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {Object.values(item.selectedAddons).map((addon, idx) => (
                                            <span key={idx} className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                                                {addon.name} (+{currencySymbol}{addon.price})
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => removeFromCart(item.uniqueId || item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        >
                            <FaTrash size={14} />
                        </button>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex justify-between items-end mt-2">
                        <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border border-gray-200">
                            <button
                                onClick={() => updateQuantity(item.uniqueId || item.id, item.quantity - 1)}
                                className="w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:text-black font-bold disabled:opacity-50"
                                disabled={item.quantity <= 1}
                            >
                                −
                            </button>
                            <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                            <button
                                onClick={() => updateQuantity(item.uniqueId || item.id, item.quantity + 1)}
                                className="w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:text-black font-bold"
                            >
                                +
                            </button>
                        </div>
                        <div className="font-bold text-gray-900">
                            {currencySymbol} {(Number(price) * item.quantity).toLocaleString()}
                        </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="max-w-3xl mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-500 font-medium">Total ({getTotalItems()} items)</span>
                    <span className="text-xl font-bold text-gray-900">{currencySymbol} {total}</span>
                </div>
                <Link
                    to="/PaymentScreen"
                    className="w-full bg-[#FFC72C] text-black font-bold py-4 rounded-xl flex items-center justify-center hover:bg-[#ffcf4b] transition-colors shadow-sm text-lg"
                >
                    Proceed to Checkout
                </Link>
            </div>
        </div>
      )}
    </div>
  );
};

export default CartScreen;
