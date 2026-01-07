import React, { useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { toast } from "react-toastify";
import { useLocation } from "../hooks/useLocation";

const CheckoutForm = ({ cartItems, clearCart, getTotalPrice }) => {
  const navigate = useNavigate();
  const { location } = useLocation();

  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const isPakistan = location?.countryCode === "PK";
  const total = getTotalPrice();

  const handlePlaceOrder = async () => {
    if (!address || !email || cartItems.length === 0) {
      toast.warn("⚠️ Please fill all fields and add items to cart!");
      return;
    }

    setLoading(true);
    try {
      clearCart();
      toast.success("✅ Order placed successfully!");
      navigate("/");
    } catch (err) {
      const errorMessage = err.message || "Something went wrong, please try again.";
      toast.error(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-black via-[#0F0F10] to-black min-h-screen flex flex-col text-white">
      <div className="bg-[#1a1a1a]/80 backdrop-blur-xl fixed top-0 w-full text-white flex items-center px-4 py-4 border-b border-gray-800 z-50">
        <FaArrowLeft
          className="mr-3 cursor-pointer text-xl hover:text-[#FFC72C] transition"
          onClick={() => navigate(-1)}
        />
        <h1 className="text-xl font-bold tracking-wide">Checkout</h1>
      </div>

      <div className="flex-1 px-4 mb-20 py-8 space-y-6 mt-16 w-full md:w-[70%] lg:w-[50%] mx-auto">
        <div className="rounded-2xl p-5 bg-[#1a1a1a]/70 backdrop-blur-md border border-gray-700 shadow-lg">
          <h2 className="font-semibold text-lg mb-3">Order Summary</h2>
          <div className="space-y-2 text-sm sm:text-base">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{isPakistan ? `Rs ${total}` : `£${total}`}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax & Fees</span>
              <span>0.0</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span className="text-green-400">Free</span>
            </div>
          </div>
          <hr className="border-gray-700 my-3" />
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>{isPakistan ? `Rs ${total}` : `£${total}`}</span>
          </div>
          <p className="text-sm text-gray-400 mt-2">
            Estimated delivery: 15 - 30 mins
          </p>
        </div>

        <div className="space-y-4">
          <textarea
            placeholder="Delivery Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full bg-[#1E1E1E]/70 backdrop-blur-md text-white p-4 rounded-xl border border-gray-700 focus:border-[#FFC72C] outline-none transition"
            rows="3"
          />
          <input
            type="number"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-[#1E1E1E]/70 backdrop-blur-md text-white p-4 rounded-xl border border-gray-700 focus:border-[#FFC72C] outline-none transition"
          />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#1E1E1E]/70 backdrop-blur-md text-white p-4 rounded-xl border border-gray-700 focus:border-[#FFC72C] outline-none transition"
          />
        </div>

        <div className="rounded-2xl p-5 bg-[#1a1a1a]/70 backdrop-blur-md border border-gray-700 shadow-lg">
          <h2 className="font-semibold mb-3">Payment Method</h2>
          <div className="space-y-4">
            <div className="border border-[#FFC72C] rounded-xl p-4 bg-[#1E1E1E]/30">
              Cash On Delivery
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#1a1a1a]/90 backdrop-blur-lg fixed bottom-0 w-full text-white flex justify-between items-center px-6 py-5 border-t border-gray-800 shadow-xl">
        <span className="text-xl font-bold">
          {isPakistan ? `Rs ${total}` : `£${total}`}
        </span>
        <button
          onClick={handlePlaceOrder}
          disabled={loading}
          className="px-10 py-3 rounded-full font-semibold shadow-lg hover:shadow-2xl transition text-lg disabled:opacity-50 animate-pulse text-black"
          style={{ backgroundColor: "#FFC72C" }}
        >
          {loading ? "Processing..." : "Place Order"}
        </button>
      </div>
    </div>
  );
};

const PaymentScreen = () => {
  const { cartItems, getTotalPrice, clearCart } = useCart();
  return (
    <CheckoutForm
      cartItems={cartItems}
      getTotalPrice={getTotalPrice}
      clearCart={clearCart}
    />
  );
};

export default PaymentScreen;
