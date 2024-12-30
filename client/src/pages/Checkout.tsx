import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";

const checkoutSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  address: z.string().min(5),
  city: z.string().min(2),
  state: z.string().length(2),
  zipCode: z.string().length(5),
});

export default function Checkout() {
  const [, setLocation] = useLocation();
  const [search] = useSearch();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: "",
      name: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
    },
  });

  const placeOrder = useMutation({
    mutationFn: async (data: z.infer<typeof checkoutSchema>) => {
      const orderId = new URLSearchParams(search).get('orderId');
      if (!orderId) {
        throw new Error('No order ID found');
      }

      const response = await fetch(`/api/orders/${orderId}/finalize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerEmail: data.email,
          shippingAddress: {
            name: data.name,
            street1: data.address,
            city: data.city,
            state: data.state,
            zip: data.zipCode,
            country: "US",
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to place order');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Order placed successfully!",
        description: "You will receive a confirmation email shortly.",
      });
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Error placing order",
        description: error instanceof Error ? error.message : "Please try again or contact support.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof checkoutSchema>) => {
    placeOrder.mutate(values);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Checkout</h1>

      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4 p-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input {...field} maxLength={2} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP Code</FormLabel>
                      <FormControl>
                        <Input {...field} maxLength={5} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>

            <CardFooter className="p-4">
              <Button
                type="submit"
                className="w-full"
                disabled={placeOrder.isPending}
              >
                {placeOrder.isPending ? "Processing..." : "Place Order"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}