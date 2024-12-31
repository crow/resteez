import { loadStripe } from "@stripe/stripe-js";

let stripePromise: Promise<any> | null = null;

export async function getStripe() {
  if (!stripePromise) {
    const key = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
    if (!key) {
      throw new Error('Stripe publishable key is not set');
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
}

export async function redirectToCheckout(sessionId: string) {
  try {
    console.log('Redirecting to checkout with session ID:', sessionId);
    const stripe = await getStripe();
    if (!stripe) {
      throw new Error('Failed to load Stripe');
    }

    const { error } = await stripe.redirectToCheckout({
      sessionId: sessionId,
    });

    if (error) {
      console.error('Stripe redirect error:', error);
      throw new Error(error.message);
    }
  } catch (err) {
    console.error('Stripe checkout error:', err);
    throw new Error(err instanceof Error ? err.message : 'Failed to redirect to checkout');
  }
}

interface PaymentIntentRequest {
  quantity: number;
}

export async function createPaymentIntent(data: PaymentIntentRequest) {
  try {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [
          {
            quantity: data.quantity,
            lookupKey: import.meta.env.VITE_RESTEEZ_LOOKUP_KEY,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    return response.json();
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw error;
  }
}