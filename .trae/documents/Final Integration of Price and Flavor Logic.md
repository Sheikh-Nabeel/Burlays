I will finalize the integration of the database structure into the frontend, specifically addressing the price logic and flavor image visibility.

**The Fix:**

1.  **Price Logic Update:**
    *   I will update `getProductPrice` (and the "Add to Order" button logic) to strictly follow the logic: `price` field = Base Price, `discountPrice` field = Selling Price.
    *   I will ensure that if `discountPrice` is valid (greater than 0), it becomes the main displayed price, and the `price` field is shown crossed out. This applies even if `discountPrice > price` (as per the weird data, though logically a discount should be lower, I will trust the explicit instruction "discount price should show").

2.  **Flavor Image Visibility:**
    *   The robust regex extraction I added (`/(https?:\/\/[^\s"'`]+)/`) is the correct solution for the messy URL data. I will double-check that this logic is applied correctly and that the image container renders.
    *   I will ensure the fallback placeholder logic remains to provide visibility on load failures.

3.  **Cart & Add-ons:**
    *   I will verify that `selectedAddons` (which contains flavors) correctly propagates the `imageUrl` so it can be displayed in the cart if needed later.

**Plan Steps:**
1.  Modify `MenuPage.jsx` to unify the price calculation logic in one place (a helper function used by both the display card and the "Add to Order" button) to avoid inconsistencies.
2.  Ensure `discountPrice` is always treated as the selling price if present.
