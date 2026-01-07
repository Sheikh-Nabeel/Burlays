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
     const existing = prev.find(
       (item) =>
         item.id === product.id && item.selectedColor === product.selectedColor
     );
     if (existing) {
       return prev.map((item) =>
         item.id === product.id && item.selectedColor === product.selectedColor
           ? { ...item, quantity: item.quantity + 1 }
           : item
       );
     }
     return [...prev, { ...product, quantity: 1 }];
   });
 };


  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity } : item))
    );
  };

  // ✅ Always calculate using correct currency price
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const price = isPakistan ? item.price_pk : item.price_uk;
      return total + (price || 0) * item.quantity;
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
