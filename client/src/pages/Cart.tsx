import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PRODUCT_DATA } from "@/lib/constants";
import { useMutation } from "@tanstack/react-query";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

declare const Stripe: any; // Stripe.js will be loaded in index.html

export default function Cart() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      name: PRODUCT_DATA.name,
      price: PRODUCT_DATA.price,
      quantity: 1,
      image: PRODUCT_DATA.images[0]
    }
  ]);

  const updateQuantity = (id: number, change: number) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems(items => items.filter(item => item.id !== id));
    toast({
      title: "Item removed",
      description: "The item has been removed from your cart."
    });
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const checkout = useMutation({
    mutationFn: async () => {
      // First create the order
      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          items: cartItems
        })
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to create order");
      }

      const { sessionId } = await orderResponse.json();

      // Initialize Stripe and redirect to checkout
      const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
      if (!stripe) throw new Error("Stripe failed to load");

      const { error } = await stripe.redirectToCheckout({
        sessionId
      });

      if (error) throw error;
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to proceed to checkout. Please try again.",
        variant: "destructive"
      });
    }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Shopping Cart</h1>

      <div className="space-y-4">
        {cartItems.map((item) => (
          <Card key={item.id}>
            <CardContent className="flex items-center gap-4 p-4">
              <img
                src={item.image}
                alt={item.name}
                className="w-24 h-24 object-contain rounded"
              />
              <div className="flex-1">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-muted-foreground">
                  ${item.price.toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateQuantity(item.id, -1)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={item.quantity}
                  className="w-16 text-center"
                  readOnly
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateQuantity(item.id, 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => removeItem(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between text-lg font-semibold">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
        </CardContent>
        <CardFooter className="p-4">
          <Button
            className="w-full"
            size="lg"
            onClick={() => checkout.mutate()}
            disabled={cartItems.length === 0 || checkout.isPending}
          >
            {checkout.isPending ? "Processing..." : "Proceed to Checkout"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

async function loadStripe(key: string | undefined) {
  if (!key) return null;
  if (typeof window === 'undefined') return null;

  const stripe = await Stripe(key);
  return stripe;
}