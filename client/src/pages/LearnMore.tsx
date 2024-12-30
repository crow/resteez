import { Button } from "@/components/ui/button";
import { PRODUCT_DATA } from "@/lib/constants";
import { useLocation } from "wouter";
import { ArrowLeft, Check } from "lucide-react";

export default function LearnMore() {
  const [, setLocation] = useLocation();

  return (
    <div className="container mx-auto px-4 py-12 space-y-16">
      {/* Back Button */}
      <Button
        variant="ghost"
        className="button-neo mb-8"
        onClick={() => setLocation("/")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Button>

      {/* Hero Section */}
      <section className="grid md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <h1 className="text-5xl font-bold">{PRODUCT_DATA.name}</h1>
          <p className="text-xl text-foreground/80">{PRODUCT_DATA.description}</p>
          <div className="text-3xl font-bold bg-primary text-primary-foreground inline-block px-4 py-2">
            ${PRODUCT_DATA.price.toFixed(2)}
          </div>
        </div>
        <div className="relative aspect-square">
          <img
            src={PRODUCT_DATA.images[0]}
            alt={PRODUCT_DATA.name}
            className="absolute inset-0 w-full h-full object-cover border-4 border-[hsl(var(--primary))]"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold">Key Features</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {PRODUCT_DATA.features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="flex gap-4">
                <Check className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="text-lg">{feature}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Additional Images */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold">Product Gallery</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {PRODUCT_DATA.images.slice(1).map((image, index) => (
            <div key={index} className="relative aspect-square">
              <img
                src={image}
                alt={`${PRODUCT_DATA.name} view ${index + 2}`}
                className="absolute inset-0 w-full h-full object-cover border-4 border-[hsl(var(--primary))]"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold">Customer Testimonials</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {PRODUCT_DATA.testimonials.map((testimonial, index) => (
            <div key={index} className="feature-card">
              <div className="space-y-4">
                <p className="text-lg italic">"{testimonial.text}"</p>
                <p className="font-semibold">- {testimonial.name}</p>
                <div className="flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <span key={i} className="text-primary">★</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center space-y-6">
        <h2 className="text-3xl font-bold">Ready to Experience Better Sleep?</h2>
        <Button
          className="button-neo text-xl py-8 px-12"
          onClick={() => setLocation("/cart")}
        >
          Add to Cart - ${PRODUCT_DATA.price.toFixed(2)}
        </Button>
      </section>
    </div>
  );
}
