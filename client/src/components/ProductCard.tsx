import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: {
    name: string;
    description: string;
    price: number;
    features: string[];
    images: string[];
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const addToCart = () => {
    toast({
      title: "Added to cart",
      description: "Your item has been added to the cart.",
    });
    setLocation("/cart");
  };

  return (
    <div className="product-card overflow-hidden">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="relative aspect-square border-r-[6px] border-[hsl(var(--primary))]">
          <img
            src={product.images[0]}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        <div className="p-8 space-y-8">
          <div>
            <h2 className="text-4xl font-bold mb-4">{product.name}</h2>
            <p className="text-xl text-foreground">{product.description}</p>
          </div>

          <div className="space-y-6">
            <div className="text-3xl font-bold bg-primary text-primary-foreground inline-block px-4 py-2">
              ${product.price.toFixed(2)}
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-bold">Features:</h3>
              <ul className="space-y-3">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex gap-2 items-start">
                    <span className="text-xl">→</span>
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Button
            className="button-neo w-full text-xl py-8"
            onClick={addToCart}
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}