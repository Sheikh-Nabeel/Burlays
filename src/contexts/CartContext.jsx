import { createContext, useContext, useState } from "react";
import { useLocation } from "../hooks/useLocation"; // 👈 import your hook

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const { location } = useLocation();
  const isPakistan = location?.countryCode === "PK";
  const currencySymbol = isPakistan ? "Rs." : "£";

  const addToCart = (product) => {
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
