import { useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function CheckoutSuccess() {
  const [, setLocation] = useLocation();
  const [search] = useSearch();
  const sessionId = new URLSearchParams(search).get('session_id');
  const orderId = new URLSearchParams(search).get('order_id');

  const { data, isLoading } = useQuery({
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

  if (!sessionId || !orderId) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto py-12">
      <Card>
        <CardContent className="pt-6 text-center">
          {isLoading || data?.status !== 'confirmed' ? (
            <div className="space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p>Processing your payment...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-green-600">Order Confirmed!</h1>
              <p>Thank you for your purchase. You will receive a confirmation email shortly.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
