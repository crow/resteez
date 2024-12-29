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
    <Card className="overflow-hidden">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="relative aspect-square">
          <img
            src={product.images[0]}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        <div className="p-6 space-y-6">
          <CardHeader className="p-0">
            <CardTitle className="text-3xl">{product.name}</CardTitle>
            <CardDescription className="text-lg mt-2">
              {product.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            <div className="space-y-4">
              <div className="text-2xl font-bold">
                ${product.price.toFixed(2)}
              </div>

              <div>
                <h3 className="font-semibold mb-2">Key Features:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {product.features.map((feature, index) => (
                    <li key={index} className="text-muted-foreground">
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>

          <CardFooter className="p-0">
            <Button
              size="lg"
              className="w-full"
              onClick={addToCart}
            >
              Add to Cart
            </Button>
          </CardFooter>
        </div>
      </div>
    </Card>
  );
}
