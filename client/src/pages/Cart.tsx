import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Trash2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PRODUCT_DATA } from "@/lib/constants";
import { useMutation } from "@tanstack/react-query";
import { LoadingOverlay } from "@/components/ui/loading-overlay";

interface CartItem {
  id: number;
  name: string;
  quantity: number;
  image: string;
  price: number;
}

export default function Cart() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      name: PRODUCT_DATA.name,
      quantity: 1,
      image: PRODUCT_DATA.images[0],
      price: PRODUCT_DATA.price
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

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const checkout = useMutation({
    mutationFn: async () => {
      try {
        setIsRedirecting(true);
        const response = await fetch("/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            items: cartItems.map(item => ({
              quantity: item.quantity
            }))
          })
        });

        if (!response.ok) {
          const error = await response.json();
          console.error('Checkout response error:', error);
          throw new Error(error.message || error.error || "Failed to create order");
        }

        const data = await response.json();
        console.log('Checkout response:', data);

        if (!data.url) {
          throw new Error("No checkout URL returned from server");
        }

        window.location.href = data.url;
      } catch (error) {
        setIsRedirecting(false);
        console.error('Checkout error:', error);
        throw error;
      }
    },
    onError: (error) => {
      setIsRedirecting(false);
      console.error('Checkout mutation error:', error);
      toast({
        title: "Checkout failed",
        description: error instanceof Error
          ? `Error: ${error.message}. Please try again or contact support if the issue persists.`
          : "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
  });

  return (
    <div className="min-h-screen flex flex-col">
      {isRedirecting && (
        <LoadingOverlay message="Preparing your checkout..." />
      )}

      <div className="flex-1 container mx-auto px-4 py-6 pb-32">
        <Button
          variant="ghost"
          className="button-neo mb-6"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Your cart is empty</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4">
                  <div className="w-20 h-20 relative flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="font-semibold truncate">{item.name}</h3>
                    <p className="text-muted-foreground">
                      ${item.price.toFixed(2)} each
                    </p>
                    <p className="font-medium">
                      Subtotal: ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
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
        )}
      </div>

      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border">
          <div className="container mx-auto px-4">
            <Card className="mx-auto max-w-4xl border-0 bg-transparent shadow-none">
              <CardContent className="p-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </CardContent>
              <CardFooter className="p-4">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => checkout.mutate()}
                  disabled={cartItems.length === 0 || checkout.isPending || isRedirecting}
                >
                  {checkout.isPending || isRedirecting ? "Processing..." : "Proceed to Checkout"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}