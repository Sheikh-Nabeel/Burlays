I will update the order creation logic to include flavors and beverages in the order items.

**The Issue:**
Currently, the `handlePlaceOrder` function in `PaymentScreen.jsx` likely constructs the `items` array from `cartItems` but might not be explicitly capturing or formatting the `selectedVariants`, `selectedAddons`, `flavors`, and `beverages` in a way that is clear for the backend or order history display.

**The Fix:**
1.  **Inspect `cartItems` structure:** The `MenuPage.jsx` constructs the `cartItem` like this:
    ```javascript
    const cartItem = {
        ...selectedProduct,
        price_pk: finalPrice,
        selectedVariants,
        selectedAddons, // This contains both regular addons, flavors, and beverages
        uniqueId: Date.now()
    };
    ```
2.  **Update `PaymentScreen.jsx`:** I need to ensure that when `handlePlaceOrder` maps `cartItems` to the order payload, it explicitly includes `selectedAddons` (which holds flavors/beverages).
    *   I will modify the mapping to ensure `selectedAddons` is passed through.
    *   I will also verify if `selectedVariants` is passed.

**Plan:**
1.  Read `src/components/PaymentScreen.jsx` to understand the current `orderData` construction.
2.  Modify `handlePlaceOrder` to include `selectedAddons` and `selectedVariants` in the `items` array of the order document.
3.  Ensure the data structure is clean (e.g., converting the `selectedAddons` object to an array if needed, or keeping it as a map depending on backend expectation).

**Note:** The user mentioned "add these flavores bevrages etc also with it". In `MenuPage.jsx`, flavors and beverages are stored inside `selectedAddons` with types or implicit structure. I will make sure this data is preserved in the order.
