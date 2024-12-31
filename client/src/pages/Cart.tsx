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
import { createPaymentIntent } from "@/lib/stripe";

interface CartItem {
  id: number;
  name: string;
  quantity: number;
  image: string;
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
    return cartItems.reduce((sum, item) => sum + (19.99 * item.quantity), 0);
  };

  const checkout = useMutation({
    mutationFn: async () => {
      try {
        setIsRedirecting(true);
        await createPaymentIntent({ quantity: cartItems[0].quantity });
      } catch (error) {
        setIsRedirecting(false);
        throw error;
      }
    },
    onError: (error) => {
      setIsRedirecting(false);
      toast({
        title: "Checkout failed",
        description: error instanceof Error
          ? error.message
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
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Product Image and Info */}
                    <div className="flex gap-4 items-center">
                      <div className="w-20 h-20 relative flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="absolute inset-0 w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{item.name}</h3>
                        <p className="text-muted-foreground">
                          $19.99 each
                        </p>
                      </div>
                    </div>

                    {/* Quantity Controls and Total */}
                    <div className="flex flex-col sm:flex-row gap-4 items-center sm:ml-auto">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, -1)}
                          className="h-8 w-8"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          className="w-14 text-center h-8"
                          readOnly
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, 1)}
                          className="h-8 w-8"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-medium whitespace-nowrap">
                          Subtotal: ${(19.99 * item.quantity).toFixed(2)}
                        </p>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          className="h-8 w-8"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
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