interface PaymentIntentRequest {
  amount: number;
  currency: string;
  shipping: {
    name: string;
    address: {
      line1: string;
      city: string;
      state: string;
      postal_code: string;
    };
  };
}

export async function createPaymentIntent(data: PaymentIntentRequest) {
  try {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [{
          productId: 1,
          quantity: 1,
          price: data.amount / 100
        }],
        customerEmail: "customer@example.com",
        shippingAddress: data.shipping.address
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
