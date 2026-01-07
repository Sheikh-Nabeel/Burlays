const functions = require("firebase-functions");
const admin = require("firebase-admin");
require("dotenv").config();
const cors = require("cors")({ origin: true });

const stripeSecret = process.env.STRIPE_SECRET_KEY || (functions.config().stripe && functions.config().stripe.secret);
if (!stripeSecret) {
  console.error("Missing STRIPE_SECRET_KEY. Set environment variable or functions config 'stripe.secret'.");
}
const stripe = require("stripe")(stripeSecret || "");

admin.initializeApp();

exports.createPaymentIntent = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    try {
      // Only allow POST requests
      if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed. Use POST." });
      }

      const { amount, currency = "gbp" } = req.body;

      // ✅ Validate amount exists
      if (!amount || isNaN(amount)) {
        return res.status(400).json({ error: "Invalid amount. Amount is required and must be a number." });
      }

      // ✅ Validate amount (minimum 100 for both GBP and PKR)
      if (amount < 100) {
        const minAmount = currency === "pkr" ? "1.00 PKR (100 paisa)" : "£1.00 (100 pence)";
        return res.status(400).json({ error: `Invalid amount. Must be at least ${minAmount}.` });
      }

      // ✅ Validate currency
      const validCurrencies = ["gbp", "pkr", "usd", "eur"];
      if (!validCurrencies.includes(currency.toLowerCase())) {
        return res.status(400).json({ error: `Invalid currency. Supported currencies: ${validCurrencies.join(", ")}` });
      }

      // ✅ Create PaymentIntent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount), // Ensure it's an integer
        currency: currency.toLowerCase(),
        automatic_payment_methods: { enabled: true },
        setup_future_usage: "off_session", // allows saved cards in future (optional)
      });

      console.log("Created PaymentIntent:", paymentIntent.id, "Amount:", amount, "Currency:", currency);

      res.status(200).json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });
    } catch (error) {
      console.error("Stripe Error:", error.message);
      console.error("Error details:", error);
      
      // Provide more specific error messages
      let errorMessage = "Payment failed. Please try again later.";
      if (error.type === "StripeCardError") {
        errorMessage = error.message || "Card payment failed.";
      } else if (error.type === "StripeInvalidRequestError") {
        errorMessage = error.message || "Invalid payment request.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      res.status(500).json({ error: errorMessage });
    }
  });
});

// Stripe webhook to reconcile payment states server-side
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed. Use POST.");
  }

  try {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || (functions.config().stripe && functions.config().stripe.webhook_secret);
    if (!endpointSecret) {
      console.error("Missing STRIPE_WEBHOOK_SECRET. Set an environment variable or functions config.");
      return res.status(500).send("Server not configured for webhook verification.");
    }

    const event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);

    switch (event.type) {
      case "payment_intent.succeeded": {
        const intent = event.data.object;
        console.log("Webhook payment_intent.succeeded:", intent.id);
        try {
          const ordersRef = admin.firestore().collection("orders");
          const snapshot = await ordersRef.where("stripeId", "==", intent.id).limit(1).get();
          if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            await doc.ref.update({ paymentStatus: "Paid" });
          } else {
            await ordersRef.add({
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
              paymentStatus: "Paid",
              stripeId: intent.id,
              method: "Stripe",
              currency: intent.currency && intent.currency.toUpperCase(),
              totalAmount: intent.amount ? intent.amount / 100 : undefined,
            });
          }
        } catch (err) {
          console.error("Error updating Firestore on succeeded:", err);
        }
        break;
      }
      case "payment_intent.payment_failed": {
        const intent = event.data.object;
        console.log("Webhook payment_intent.payment_failed:", intent.id);
        try {
          const ordersRef = admin.firestore().collection("orders");
          const snapshot = await ordersRef.where("stripeId", "==", intent.id).limit(1).get();
          if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            await doc.ref.update({ paymentStatus: "Failed" });
          } else {
            await ordersRef.add({
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
              paymentStatus: "Failed",
              stripeId: intent.id,
              method: "Stripe",
              currency: intent.currency && intent.currency.toUpperCase(),
              totalAmount: intent.amount ? intent.amount / 100 : undefined,
            });
          }
        } catch (err) {
          console.error("Error updating Firestore on failed:", err);
        }
        break;
      }
      default:
        console.log("Unhandled event type:", event.type);
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

exports.verifyPaymentIntent = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed. Use POST." });
      }

      const { intentId } = req.body;
      if (!intentId) {
        return res.status(400).json({ error: "Missing intentId" });
      }

      const intent = await stripe.paymentIntents.retrieve(intentId);
      res.status(200).json({ id: intent.id, status: intent.status, amount: intent.amount, currency: intent.currency });
    } catch (error) {
      console.error("Verify intent error:", error);
      res.status(500).json({ error: error.message || "Failed to verify payment intent" });
    }
  });
});
