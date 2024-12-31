import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import confetti from "canvas-confetti";

interface ShippingDetails {
  address: {
    city: string;
    country: string;
    line1: string;
    line2?: string;
    postal_code: string;
    state: string;
  };
  name: string;
}

interface OrderResponse {
  status: string;
  shippingDetails?: ShippingDetails;
}

export default function CheckoutSuccess() {
  const [, setLocation] = useLocation();
  const [search] = useSearch();
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);
  const sessionId = new URLSearchParams(search).get('session_id');
  const orderId = new URLSearchParams(search).get('order_id');

  const { data, isLoading } = useQuery<OrderResponse>({
    queryKey: [`/api/orders/${orderId}/check-payment`, { sessionId }],
    queryFn: async () => {
      const response = await fetch(`/api/orders/${orderId}/check-payment?sessionId=${sessionId}`);
      if (!response.ok) throw new Error('Failed to check payment status');
      return response.json();
    },
    enabled: !!sessionId && !!orderId,
    refetchInterval: (data) => data?.status === 'confirmed' ? false : 1000,
  });

  useEffect(() => {
    if (!sessionId || !orderId) {
      setLocation("/");
    }
  }, [sessionId, orderId, setLocation]);

  useEffect(() => {
    if (data?.status === 'confirmed' && !hasTriggeredConfetti) {
      const duration = 2 * 1000;
      const end = Date.now() + duration;

      (function frame() {
        confetti({
          particleCount: 7,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#6366f1', '#8b5cf6', '#d946ef']
        });
        confetti({
          particleCount: 7,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#6366f1', '#8b5cf6', '#d946ef']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());

      setHasTriggeredConfetti(true);
    }
  }, [data?.status, hasTriggeredConfetti]);

  if (!sessionId || !orderId) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto py-12">
      <Card>
        <CardContent className="pt-6">
          {isLoading || data?.status !== 'confirmed' ? (
            <div className="space-y-4 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="text-lg">Processing your payment...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto" />
                <h1 className="text-2xl font-bold text-green-600">Order Confirmed!</h1>
                <p className="text-lg text-muted-foreground">
                  Thank you for your purchase. You will receive a confirmation email shortly.
                </p>
              </div>

              {data.shippingDetails && (
                <div className="border rounded-lg p-4 space-y-2 bg-muted/50">
                  <h2 className="font-semibold">Shipping Details</h2>
                  <p>{data.shippingDetails.name}</p>
                  <p>{data.shippingDetails.address.line1}</p>
                  {data.shippingDetails.address.line2 && (
                    <p>{data.shippingDetails.address.line2}</p>
                  )}
                  <p>
                    {data.shippingDetails.address.city}, {data.shippingDetails.address.state} {data.shippingDetails.address.postal_code}
                  </p>
                  <p>{data.shippingDetails.address.country}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}