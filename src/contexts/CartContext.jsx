import { createContext, useContext, useState } from "react";
import { useLocation } from "../hooks/useLocation"; // 👈 import your hook
import { toast } from "react-toastify";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const { location } = useLocation();
  const isPakistan = location?.countryCode === "PK";
  const currencySymbol = isPakistan ? "Rs." : "£";

  const toDate = (value) => {
    if (!value) return null;
    if (value?.toDate) return value.toDate();
    const seconds = value?.seconds ?? value?._seconds;
    if (typeof seconds === "number") {
      const nanos = value?.nanoseconds ?? value?._nanoseconds ?? 0;
      const ms = seconds * 1000 + Math.floor(Number(nanos) / 1e6);
      const d = new Date(ms);
      return Number.isNaN(d.getTime()) ? null : d;
    }
    if (typeof value === "string") {
      const match = value.trim().match(/^(\d{1,2}):(\d{2})/);
      if (match) {
        const hours = Number(match[1]);
        const minutes = Number(match[2]);
        if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
          const d = new Date();
          d.setHours(hours, minutes, 0, 0);
          return d;
        }
      }
    }
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return d;
  };

  const toMinutesOfDay = (value) => {
    const d = toDate(value);
    if (!d) return null;
    return d.getHours() * 60 + d.getMinutes();
  };

  const formatTime = (value) => {
    const d = toDate(value);
    if (!d) return "";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getBranchOpenState = () => {
    const selectedBranch = JSON.parse(localStorage.getItem("selectedBranch") || "null");
    if (!selectedBranch?.id) return { ok: false, message: "Please select a branch first." };

    const opening =
      selectedBranch.OpeningTime ??
      selectedBranch.openingTime ??
      selectedBranch.opening_time ??
      selectedBranch["opening time"] ??
      selectedBranch["Opening Time"];
    const closing =
      selectedBranch.ClosingTime ??
      selectedBranch.closingTime ??
      selectedBranch.closing_time ??
      selectedBranch["closing time"] ??
      selectedBranch["Closing Time"];

    const openMin = toMinutesOfDay(opening);
    const closeMin = toMinutesOfDay(closing);
    if (openMin == null || closeMin == null) return { ok: false, message: "Branch timing is not configured. Please try again later." };

    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const isOvernight = closeMin < openMin;
    const isOpen = isOvernight ? nowMin >= openMin || nowMin < closeMin : nowMin >= openMin && nowMin < closeMin;

    if (isOpen) return { ok: true, message: "" };
    const label = `${formatTime(opening)} - ${formatTime(closing)}`.trim();
    return { ok: false, message: label ? `Branch is closed. Open hours: ${label}` : "Branch is closed right now." };
  };

  const addToCart = (product) => {
    const state = getBranchOpenState();
    if (!state.ok) {
      toast.error(state.message);
      return false;
    }
    setCartItems((prev) => {
      // Use uniqueId if available (for products with variants/addons), otherwise fallback to id
      const productId = product.uniqueId || product.id;
      
      const existing = prev.find((item) => {
          if (product.uniqueId) {
              return item.uniqueId === product.uniqueId;
          }
          return item.id === product.id;
      });

      if (existing) {
        return prev.map((item) => {
            const isMatch = product.uniqueId ? item.uniqueId === product.uniqueId : item.id === product.id;
            return isMatch ? { ...item, quantity: item.quantity + 1 } : item;
        });
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    return true;
  };

  const removeFromCart = (productId) => {
    // Check both id and uniqueId
    setCartItems((prev) => prev.filter((item) => (item.uniqueId || item.id) !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => {
          const isMatch = (item.uniqueId || item.id) === productId;
          return isMatch ? { ...item, quantity } : item;
      })
    );
  };

  // ✅ Always calculate using correct currency price
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      // Use the calculated price (price_pk) that we set in MenuPage.jsx
      // If price_pk is not available, fallback to other price fields
      const price = item.price_pk || item.price || 0;
      return total + Number(price) * item.quantity;
    }, 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        getTotalPrice,
        getTotalItems,
        clearCart,
        isPakistan, // 👈 exposed to use in UI
        currencySymbol, // 👈 so you can show Rs./£ anywhere
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
