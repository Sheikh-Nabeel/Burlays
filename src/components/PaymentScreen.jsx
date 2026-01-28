import React, { useState, useEffect } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate, useLocation as useRouterLocation } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { toast } from "react-toastify";
import { useLocation } from "../hooks/useLocation";
import { auth, db } from "../firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc, arrayUnion } from "firebase/firestore";

const CheckoutForm = ({ cartItems, clearCart, getTotalPrice }) => {
  const navigate = useNavigate();
  const { location } = useLocation();
  const routerLocation = useRouterLocation();

  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  // Check auth and prefill phone
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
        if (!user) {
            navigate('/login', { state: { from: routerLocation } });
        } else {
            setPhone(user.phoneNumber || "");
        }
    });
    return () => unsubscribe();
  }, [navigate, routerLocation]);

  const isPakistan = location?.countryCode === "PK";
  const currencySymbol = isPakistan ? "Rs." : "£";
  const total = getTotalPrice();

  const handlePlaceOrder = async () => {
    if (!address || !phone || cartItems.length === 0) {
      toast.warn("⚠️ Please fill all fields and add items to cart!");
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      // Get selected branch from localStorage
      const selectedBranch = JSON.parse(localStorage.getItem('selectedBranch'));
      
      const orderData = {
        userId: user.uid,
        customerName: user.displayName || "Customer",
        customerPhone: phone,
        deliveryAddress: address,
        branchId: selectedBranch ? selectedBranch.id : "unknown",
        branchName: selectedBranch ? selectedBranch.name : "Unknown Branch",
        items: cartItems.map(item => ({
            productId: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price_pk || item.price,
            totalPrice: (item.price_pk || item.price) * item.quantity,
            variant: item.selectedVariants || null,
            addons: item.selectedAddons || null,
            image: item.imagepath || item.productPic || ""
        })),
        totalAmount: total,
        paymentMethod: "COD",
        status: "Pending",
        assignedRiderId: "", // Initially empty
        createdAt: serverTimestamp(),
        orderDate: new Date().toLocaleDateString('en-GB'),
        platform: "web"
      };

      // 1. Create Order in 'orders' collection
      const docRef = await addDoc(collection(db, "orders"), orderData);

      // 2. Update Customer's orderHistory
      const userRef = doc(db, "Customers", user.uid);
      await updateDoc(userRef, {
        orderHistory: arrayUnion(docRef.id)
      });

      clearCart();
      toast.success("✅ Order placed successfully!");
      navigate("/");
    } catch (err) {
      console.error("Order Error: ", err);
      const errorMessage = err.message || "Something went wrong, please try again.";
      toast.error(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col text-gray-900 pb-32">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 mr-4"
          >
            <FaArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Checkout</h1>
        </div>
      </div>

      <div className="flex-1 px-4 py-8 w-full max-w-3xl mx-auto space-y-8">
        
        {/* Order Summary */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-lg mb-4">Order Summary</h2>
          <div className="space-y-3 text-sm sm:text-base">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{currencySymbol} {total}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax & Fees</span>
              <span>0.0</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery</span>
              <span className="text-green-600 font-medium">Free</span>
            </div>
            <hr className="border-gray-100 my-2" />
            <div className="flex justify-between font-bold text-lg text-gray-900">
              <span>Total</span>
              <span>{currencySymbol} {total}</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Estimated delivery: 15 - 30 mins
            </p>
          </div>
        </div>

        {/* Delivery Details Form */}
        <div className="space-y-4">
          <h2 className="font-bold text-lg px-1">Delivery Details</h2>
          <textarea
            placeholder="Delivery Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full bg-gray-50 text-gray-900 p-4 rounded-xl border border-gray-200 focus:border-[#FFC72C] focus:ring-1 focus:ring-[#FFC72C] outline-none transition resize-none"
            rows="3"
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-gray-50 text-gray-900 p-4 rounded-xl border border-gray-200 focus:border-[#FFC72C] focus:ring-1 focus:ring-[#FFC72C] outline-none transition"
          />
        </div>

        {/* Payment Method */}
        <div className="space-y-4">
          <h2 className="font-bold text-lg px-1">Payment Method</h2>
          <div className="border-2 border-[#FFC72C] bg-[#FFC72C]/5 rounded-xl p-4 flex items-center gap-3">
            <div className="w-4 h-4 rounded-full border-4 border-[#FFC72C]"></div>
            <span className="font-medium">Cash On Delivery</span>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
            <div className="flex flex-col">
                <span className="text-sm text-gray-500">Total Amount</span>
                <span className="text-xl font-bold text-gray-900">
                    {currencySymbol} {total}
                </span>
            </div>
            <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="px-8 py-3 rounded-xl font-bold shadow-sm hover:shadow-md transition-all text-lg disabled:opacity-70 bg-[#FFC72C] text-black hover:bg-[#ffcf4b] min-w-[160px]"
            >
            {loading ? "Processing..." : "Place Order"}
            </button>
        </div>
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
