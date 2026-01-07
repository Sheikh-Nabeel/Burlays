## Diagnosis Summary
- Frontend confirms payments and writes success only client-side, with no server verification.
- Payment Request flow disables SCA actions (`handleActions: false`), so 3DS never completes when required.
- No Stripe webhooks exist to reconcile `payment_intent.succeeded` or failures.
- Multiple hardcoded publishable keys risk environment mismatch.

## Key Code References
- Backend create intent: c:\Users\sheik\Desktop\Riaz_bakers\functions\index.js:10-68 (create `PaymentIntent`, return `clientSecret`).
- Frontend card confirm: c:\Users\sheik\Desktop\Riaz_bakers\src\components\PaymentScreen.jsx:293-311 (calls `stripe.confirmCardPayment`).
- Frontend success persistence: c:\Users\sheik\Desktop\Riaz_bakers\src\components\PaymentScreen.jsx:318-336 (writes Firestore as Paid).
- Payment Request confirm without actions: c:\Users\sheik\Desktop\Riaz_bakers\src\components\PaymentScreen.jsx:149-154 and error path at :185-192.
- Hardcoded publishable keys: c:\Users\sheik\Desktop\Riaz_bakers\src\components\PaymentScreen.jsx:18-20, c:\Users\sheik\Desktop\Riaz_bakers\src\stripe.js:4, c:\Users\sheik\Desktop\Riaz_bakers\src\assets\google_pay_config.json:15.

## Fixes Overview
1. Add Stripe webhooks to finalize payments server-side and update orders on `payment_intent.succeeded` / `payment_intent.payment_failed`.
2. Handle SCA properly by removing `handleActions: false` and implementing a second confirmation step when `requires_action`.
3. Verify intent server-side before marking orders paid; avoid trusting client-only status.
4. Centralize publishable key in `src/stripe.js` and move keys to environment/config.
5. Align currency between Payment Request config and runtime selection; restrict to supported currencies if needed.

## Implementation Steps
### Phase 1: Server Reliability
- Add `POST /stripe/webhook` in c:\Users\sheik\Desktop\Riaz_bakers\functions\index.js to handle `payment_intent.succeeded` and `payment_intent.payment_failed` using signed payload verification.
- Update Firestore orders by `paymentIntent.id` when events arrive; set `paymentStatus` to `Paid` or `Failed`.
- Add `GET /payments/:intentId` (or `POST /verify-intent`) to retrieve intent via `stripe.paymentIntents.retrieve` and return canonical status.

### Phase 2: Frontend SCA & Verification
- In c:\Users\sheik\Desktop\Riaz_bakers\src\components\PaymentScreen.jsx:
  - Remove `{ handleActions: false }` for Payment Request confirmation at :149-154.
  - If `requires_action` or `requires_confirmation`, call `stripe.confirmCardPayment(clientSecret)` again to trigger 3DS; handle result.
  - After any client-side `succeeded`, call backend verify endpoint; only write Firestore when server returns `status === 'succeeded'`.
  - Surface clear errors on `requires_payment_method` and failed verifications.

### Phase 3: Key Management & Currency Alignment
- Use `stripePromise` from c:\Users\sheik\Desktop\Riaz_bakers\src\stripe.js consistently; remove duplicate hardcoded keys in `PaymentScreen.jsx` and `google_pay_config.json`.
- Move publishable key to environment (e.g., Vite `import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY`) and backend secret to Functions config.
- Ensure Google Pay merchant and currency in c:\Users\sheik\Desktop\Riaz_bakers\src\assets\google_pay_config.json match runtime currency; if supporting only GBP, force GBP in Payment Request and backend.

## Files to Update
- c:\Users\sheik\Desktop\Riaz_bakers\functions\index.js — add webhook handler and intent verification endpoint; improve logging.
- c:\Users\sheik\Desktop\Riaz_bakers\src\components\PaymentScreen.jsx — SCA handling, server verification, single source of publishable key.
- c:\Users\sheik\Desktop\Riaz_bakers\src\stripe.js — centralize publishable key sourcing.
- c:\Users\sheik\Desktop\Riaz_bakers\src\assets\google_pay_config.json — currency and key alignment.

## Validation
- Use Stripe test cards including 3DS (e.g., `4000 0027 6000 3184`) to confirm SCA flows.
- Trigger test webhooks and confirm Firestore updates occur server-side.
- Simulate client failure mid-flow; verify webhook still marks order accurately.

## Rollout & Safety
- Deploy webhook endpoint and register its URL in Stripe Dashboard with secret.
- Enable verbose logs for first 24–48 hours; capture intent IDs on client for support.
- Keep a kill switch: if verification fails, block marking orders as paid and show retry options.

## Expected Outcome
- Payments requiring SCA complete fully; Stripe marks intents as `succeeded`.
- Orders are marked paid based on server truth (webhook/verification), eliminating false positives/negatives.
- Keys and configs are consistent across environments.