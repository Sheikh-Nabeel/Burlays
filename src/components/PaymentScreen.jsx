import React, { useState, useEffect } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import {
  Elements,
  CardElement,
  PaymentRequestButtonElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { stripePromise } from "../stripe";
import { toast } from "react-toastify";
import { useLocation } from "../hooks/useLocation";

const CheckoutForm = ({ cartItems, clearCart, getTotalPrice }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { location } = useLocation();

  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [canMakePayment, setCanMakePayment] = useState(false);

  const isPakistan = location?.countryCode === "PK";
  const total = getTotalPrice();

  // Stripe Payment Request API supported countries (Pakistan is NOT supported)
  const STRIPE_PAYMENT_REQUEST_SUPPORTED_COUNTRIES = [
    "AE", "AT", "AU", "BE", "BG", "BR", "CA", "CH", "CI", "CR", "CY", "CZ", 
    "DE", "DK", "DO", "EE", "ES", "FI", "FR", "GB", "GI", "GR", "GT", "HK", 
    "HR", "HU", "ID", "IE", "IN", "IT", "JP", "LI", "LT", "LU", "LV", "MT", 
    "MX", "MY", "NL", "NO", "NZ", "PE", "PH", "PL", "PT", "RO", "SE", "SG", 
    "SI", "SK", "SN", "TH", "TT", "US", "UY"
  ];

  const isPaymentRequestSupported = location?.countryCode && 
    STRIPE_PAYMENT_REQUEST_SUPPORTED_COUNTRIES.includes(location.countryCode.toUpperCase());

  // Create Payment Request for Google Pay and Apple Pay
  useEffect(() => {
    if (!stripe) {
      setCanMakePayment(false);
      setPaymentRequest(null);
      return;
    }

    // Don't create if total is invalid
    if (total <= 0) {
      setCanMakePayment(false);
      setPaymentRequest(null);
      return;
    }

    // Don't create Payment Request if country is not supported by Stripe
    if (!isPaymentRequestSupported) {
      console.log("Payment Request API not supported for country:", location?.countryCode);
      setCanMakePayment(false);
      setPaymentRequest(null);
      return;
    }

    let pr = null;

    try {
      // Set currency and country based on location
      // For supported countries, use appropriate currency
      const countryCode = location?.countryCode?.toUpperCase() || "GB";
      const currency = isPakistan ? "pkr" : "gbp";
      const country = countryCode;
      // Minimum amounts: 50 pence for GBP, 100 paisa (1 PKR) for PKR
      const minAmount = isPakistan ? 100 : 50;
      const amount = Math.max(minAmount, Math.round(total * 100));
      
      pr = stripe.paymentRequest({
        country: country,
        currency: currency,
        total: {
          label: "Riaz Bakers Order",
          amount: amount,
        },
        requestPayerName: true,
        requestPayerEmail: true,
        requestPayerPhone: true,
      });

      // Check if payment can be made
      pr.canMakePayment().then((result) => {
        if (result) {
          console.log("Payment method available:", result);
          setPaymentRequest(pr);
          setCanMakePayment(true);
        } else {
          console.log("Payment method not available");
          setCanMakePayment(false);
          setPaymentRequest(null);
        }
      }).catch((err) => {
        console.error("Error checking payment availability:", err);
        setCanMakePayment(false);
        setPaymentRequest(null);
      });

      // Handle payment method event
      pr.on("paymentmethod", async (ev) => {
        setLoading(true);
        try {
          // Create payment intent
          const currency = isPakistan ? "pkr" : "gbp";
          const amountToCharge = Math.round(total * 100);
          console.log("Creating payment intent:", { amount: amountToCharge, currency, total });
          
          const response = await fetch(
            "https://us-central1-riaz-bakers-588e6.cloudfunctions.net/createPaymentIntent",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                amount: amountToCharge,
                currency: currency,
              }),
            }
          );

          // Check if response is ok
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: "Failed to create payment" }));
            throw new Error(errorData.error || `Server error: ${response.status}`);
          }

          const data = await response.json();
          
          if (!data.clientSecret) {
            throw new Error("No client secret received from server");
          }

          const { clientSecret } = data;

          // Confirm payment with payment method from payment request
          const { paymentIntent, error: confirmError } =
            await stripe.confirmCardPayment(clientSecret, {
              payment_method: ev.paymentMethod.id,
            });

          if (confirmError) {
            ev.complete("fail");
            toast.error("Payment failed: " + confirmError.message);
            setLoading(false);
            return;
          }

          // Handle different payment intent statuses
          let finalIntent = paymentIntent;
          if (finalIntent.status === "requires_action" || finalIntent.status === "requires_confirmation") {
            const { paymentIntent: nextIntent, error: nextError } = await stripe.confirmCardPayment(clientSecret);
            if (nextError) {
              ev.complete("fail");
              toast.error("Authentication failed: " + nextError.message);
              setLoading(false);
              return;
            }
            finalIntent = nextIntent;
          }

          if (finalIntent.status === "succeeded") {
            const verifyRes = await fetch(
              "https://us-central1-riaz-bakers-588e6.cloudfunctions.net/verifyPaymentIntent",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ intentId: finalIntent.id }),
              }
            );

            if (!verifyRes.ok) {
              ev.complete("fail");
              toast.error("Failed to verify payment on server.");
              setLoading(false);
              return;
            }
            const verifyData = await verifyRes.json();
            if (verifyData.status !== "succeeded") {
              ev.complete("fail");
              toast.error(`Payment not finalized (status: ${verifyData.status}).`);
              setLoading(false);
              return;
            }

            // Get billing details from payment request
            const billingDetails = ev.paymentMethod.billing_details;
            
            const currency = isPakistan ? "PKR" : "GBP";
            await addDoc(collection(db, "orders"), {
              address: billingDetails.address?.line1 || address || "Provided via payment method",
              emailAddress: billingDetails.email || email,
              phone: billingDetails.phone || phone,
              items: cartItems,
              totalAmount: total,
              createdAt: serverTimestamp(),
              paymentStatus: "Paid",
              stripeId: finalIntent.id,
              method: "Google Pay / Apple Pay",
              currency: currency,
            });

            ev.complete("success");
            clearCart();
            toast.success("✅ Payment successful & order saved!");
            navigate("/");
          } else if (finalIntent.status === "requires_payment_method") {
            // Payment requires additional action (like 3D Secure)
            ev.complete("fail");
            toast.error("Payment requires additional authentication or a new method.");
          } else {
            ev.complete("fail");
            toast.error(`Payment was not completed. Status: ${finalIntent.status}`);
          }
        } catch (err) {
          console.error("Payment error:", err);
          ev.complete("fail");
          const errorMessage = err.message || "Something went wrong, please try again.";
          toast.error(`❌ ${errorMessage}`);
        } finally {
          setLoading(false);
        }
      });
    } catch (err) {
      console.error("Error creating payment request:", err);
      setCanMakePayment(false);
      setPaymentRequest(null);
    }

    // Cleanup
    return () => {
      // Payment request cleanup is handled by Stripe
    };
  }, [stripe, isPakistan, total, isPaymentRequestSupported, location?.countryCode]); // Recreate when stripe, location, or total changes

  // Update payment request amount when total changes (if payment request already exists)
  useEffect(() => {
    if (paymentRequest && total > 0) {
      try {
        const minAmount = isPakistan ? 100 : 50;
        const amount = Math.max(minAmount, Math.round(total * 100));
        paymentRequest.update({
          total: {
            label: "Riaz Bakers Order",
            amount: amount,
          },
        });
      } catch (err) {
        console.error("Error updating payment request:", err);
      }
    }
  }, [paymentRequest, total, isPakistan]);

  const handlePlaceOrder = async () => {
    if (!address || !email || cartItems.length === 0) {
      toast.warn("⚠️ Please fill all fields and add items to cart!");
      return;
    }

    setLoading(true);
    try {
      // Check if user wants to use card payment (for all countries including Pakistan)
      const cardElement = elements.getElement(CardElement);
      const useCardPayment = cardElement && !isPakistan; // For now, card payment for non-Pakistan only
      
      // For Pakistan, default to COD unless explicitly using card
      // For other countries, use card payment
      if (isPakistan && !useCardPayment) {
        // Cash on Delivery Flow for Pakistan
        await addDoc(collection(db, "orders"), {
          address,
          emailAddress: email,
          phone,
          items: cartItems,
          totalAmount: total,
          createdAt: serverTimestamp(),
          paymentStatus: "Pending (COD)",
          method: "Cash on Delivery",
          currency: "PKR",
        });

        clearCart();
        toast.success("✅ COD Order placed successfully!");
        navigate("/");
      } else {
        // Stripe Card Payment Flow (for all countries)
        const currency = isPakistan ? "pkr" : "gbp";
        const amountToCharge = Math.round(total * 100);
        console.log("Creating payment intent for card payment:", { amount: amountToCharge, currency, total });
        
        const response = await fetch(
          "https://us-central1-riaz-bakers-588e6.cloudfunctions.net/createPaymentIntent",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              amount: amountToCharge,
              currency: currency,
            }),
          }
        );

        // Check if response is ok
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Failed to create payment" }));
          throw new Error(errorData.error || `Server error: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.clientSecret) {
          throw new Error("No client secret received from server");
        }

        const { clientSecret } = data;

        if (!cardElement) {
          throw new Error("Card element not found. Please enter card details.");
        }

        const { paymentIntent, error } = await stripe.confirmCardPayment(
          clientSecret,
          {
            payment_method: {
              card: cardElement,
              billing_details: {
                email,
                phone,
                address: { line1: address },
              },
            },
          }
        );

        if (error) {
          toast.error("Payment failed: " + error.message);
          return;
        }

        let finalIntent = paymentIntent;
        if (finalIntent.status === "requires_action" || finalIntent.status === "requires_confirmation") {
          const { paymentIntent: nextIntent, error: nextError } = await stripe.confirmCardPayment(clientSecret);
          if (nextError) {
            toast.error("Authentication failed: " + nextError.message);
            return;
          }
          finalIntent = nextIntent;
        }

        if (finalIntent.status === "succeeded") {
          const verifyRes = await fetch(
            "https://us-central1-riaz-bakers-588e6.cloudfunctions.net/verifyPaymentIntent",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ intentId: finalIntent.id }),
            }
          );

          if (!verifyRes.ok) {
            toast.error("Failed to verify payment on server.");
            return;
          }
          const verifyData = await verifyRes.json();
          if (verifyData.status !== "succeeded") {
            toast.error(`Payment not finalized (status: ${verifyData.status}).`);
            return;
          }

          const currencyDisplay = isPakistan ? "PKR" : "GBP";
          await addDoc(collection(db, "orders"), {
            address,
            emailAddress: email,
            phone,
            items: cartItems,
            totalAmount: total,
            createdAt: serverTimestamp(),
            paymentStatus: "Paid",
            stripeId: finalIntent.id,
            method: "Stripe Card Payment",
            currency: currencyDisplay,
          });

          clearCart();
          toast.success("✅ Payment successful & order saved!");
          navigate("/");
        }
      }
    } catch (err) {
      console.error("Order placement error:", err);
      const errorMessage = err.message || "Something went wrong, please try again.";
      toast.error(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-black via-[#0F0F10] to-black min-h-screen flex flex-col text-white">
      {/* Header */}
      <div className="bg-[#1a1a1a]/80 backdrop-blur-xl fixed top-0 w-full text-white flex items-center px-4 py-4 border-b border-gray-800 z-50">
        <FaArrowLeft
          className="mr-3 cursor-pointer text-xl hover:text-red-500 transition"
          onClick={() => navigate(-1)}
        />
        <h1 className="text-xl font-bold tracking-wide">Checkout</h1>
      </div>

      {/* Main */}
      <div className="flex-1 px-4 mb-20 py-8 space-y-6 mt-16 w-full md:w-[70%] lg:w-[50%] mx-auto">
        {/* Order Summary */}
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

        {/* Address + Contact */}
        <div className="space-y-4">
          <textarea
            placeholder="Delivery Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full bg-[#1a1a1a]/70 backdrop-blur-md text-white p-4 rounded-xl border border-gray-700 focus:border-red-600 outline-none transition"
            rows="3"
          />
          <input
            type="number"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-[#1a1a1a]/70 backdrop-blur-md text-white p-4 rounded-xl border border-gray-700 focus:border-red-600 outline-none transition"
          />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#1a1a1a]/70 backdrop-blur-md text-white p-4 rounded-xl border border-gray-700 focus:border-red-600 outline-none transition"
          />
        </div>

        {/* Payment Method */}
        <div className="rounded-2xl p-5 bg-[#1a1a1a]/70 backdrop-blur-md border border-gray-700 shadow-lg">
          <h2 className="font-semibold mb-3">Payment Method</h2>
          <div className="space-y-4">
            {/* Google Pay / Apple Pay Button - Only show for supported countries */}
            {isPaymentRequestSupported && canMakePayment && paymentRequest ? (
              <div className="border border-green-500 rounded-xl p-4 bg-green-900/20">
                <p className="text-sm mb-3 font-medium">💳 Quick Pay</p>
                <div className="bg-white rounded-lg p-2" id="payment-request-button">
                  <PaymentRequestButtonElement
                    options={{
                      paymentRequest,
                      style: {
                        paymentRequestButton: {
                          theme: "light",
                          height: "48px",
                        },
                      },
                    }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Pay with Google Pay or Apple Pay
                </p>
              </div>
            ) : !isPaymentRequestSupported && isPakistan ? (
              <div className="border border-gray-600 rounded-xl p-4 bg-gray-900/20">
                <p className="text-xs text-gray-400">
                  💡 Google Pay / Apple Pay is not available in Pakistan. Please use Cash on Delivery or Card Payment.
                </p>
              </div>
            ) : (
              <div className="border border-gray-600 rounded-xl p-4 bg-gray-900/20">
                <p className="text-xs text-gray-400">
                  💡 Google Pay / Apple Pay not available
                  {typeof window !== "undefined" && window.location.protocol !== "https:" && (
                    <span className="block mt-1 text-yellow-400">
                      (Requires HTTPS connection)
                    </span>
                  )}
                </p>
              </div>
            )}
            
            {/* Divider */}
            {isPaymentRequestSupported && canMakePayment && paymentRequest && (
              <div className="flex items-center gap-3">
                <div className="flex-1 border-t border-gray-600"></div>
                <span className="text-sm text-gray-400">OR</span>
                <div className="flex-1 border-t border-gray-600"></div>
              </div>
            )}

            {/* Card Payment - Show for all countries (including Pakistan for online payment) */}
            <div className="border border-red-600 rounded-xl p-4 bg-red-900/20">
              <p className="text-sm mb-3 font-medium">💳 Pay with Card</p>
              <div className="bg-white rounded-lg p-3">
                <CardElement className="outline-none" />
              </div>
            </div>

            {/* Cash on Delivery - Only show for Pakistan */}
            {isPakistan && (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex-1 border-t border-gray-600"></div>
                  <span className="text-sm text-gray-400">OR</span>
                  <div className="flex-1 border-t border-gray-600"></div>
                </div>
                <div className="border border-red-600 rounded-xl p-4 bg-red-900/20">
                  💵 Cash On Delivery
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#1a1a1a]/90 backdrop-blur-lg fixed bottom-0 w-full text-white flex justify-between items-center px-6 py-5 border-t border-gray-800 shadow-xl">
        <span className="text-xl font-bold">
          {isPakistan ? `Rs ${total}` : `£${total}`}
        </span>
        <button
          onClick={handlePlaceOrder}
          disabled={loading}
          className="px-10 py-3 rounded-full font-semibold text-white shadow-lg hover:shadow-2xl transition text-lg disabled:opacity-50 animate-pulse"
          style={{ backgroundColor: "#CF0A0A" }}
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
    <Elements stripe={stripePromise}>
      <CheckoutForm
        cartItems={cartItems}
        getTotalPrice={getTotalPrice}
        clearCart={clearCart}
      />
    </Elements>
  );
};

export default PaymentScreen;
