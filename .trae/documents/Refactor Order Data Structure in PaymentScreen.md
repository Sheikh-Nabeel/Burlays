I will modify the order creation logic in `PaymentScreen.jsx` to structure the order items exactly as requested.

**Implementation Plan:**

1.  **Open `src/components/PaymentScreen.jsx`**
2.  **Locate `handlePlaceOrder` function**: Find where the `orderData` object is constructed.
3.  **Refactor `items` mapping**:
    *   Instead of dumping `selectedAddons` and `selectedVariants` as raw objects, I will process them into distinct arrays.
    *   **Variants**: Convert the single `selectedVariants` object into a `variants` array containing the full variant data.
    *   **Split Addons**: Iterate through `selectedAddons` values and separate them into three arrays based on their type:
        *   `flavors` (where `type === 'Flavor'`)
        *   `beverages` (where `type === 'Beverage'`)
        *   `addons` (where `type === 'Addon'` - for regular addons)
4.  **Clean up the payload**: Remove the old/mixed fields (`selectedVariants`, `selectedAddons` object, `variant` object) to ensure the output contains "nothing extra", just the clean arrays with full product data.

**The final structure for each item in the order will look like this:**
```javascript
{
  productId: "...",
  name: "...",
  // ...
  variants: [ { ...fullVariantData } ],
  flavors: [ { ...fullFlavorData } ],
  beverages: [ { ...fullBeverageData } ],
  addons: [ { ...fullAddonData } ]
}
```