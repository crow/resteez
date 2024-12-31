import { loadStripe } from "@stripe/stripe-js";

export async function createPaymentIntent(data: { quantity: number }) {
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
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Network response was not ok");
    }

    const result = await response.json();
    if (result.url) {
      window.location.href = result.url;
    } else {
      throw new Error("No checkout URL returned from server");
    }
  } catch (error) {
    console.error("Error initiating checkout:", error);
    throw error;
  }
}