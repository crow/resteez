interface ShippingAddress {
  line1: string;
  city: string;
  state: string;
  postal_code: string;
}

export async function createShippingLabel(address: ShippingAddress) {
  try {
    const response = await fetch("/api/shipping/label", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ address }),
    });

    if (!response.ok) {
      throw new Error("Failed to create shipping label");
    }

    return response.json();
  } catch (error) {
    console.error("Error creating shipping label:", error);
    throw error;
  }
}
