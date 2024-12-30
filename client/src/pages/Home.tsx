import { PRODUCT_DATA, STOCK_PHOTOS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-12 p-6 md:p-12 bg-white dark:bg-neutral-900 text-black dark:text-neutral-50 transition-colors">
      {/* Hero Section */}
      <section className="flex flex-col-reverse lg:flex-row items-center gap-8 border-4 border-black dark:border-neutral-50 rounded-lg shadow-[8px_8px_0_0_black] dark:shadow-[8px_8px_0_0_#f5f5f5] p-6 hover:-translate-y-1 hover:translate-x-1 transition-transform">
        <div className="flex-1 space-y-6">
          <h1 className="text-4xl lg:text-6xl font-bold text-neutral-900 dark:text-neutral-50">
            Find Relief from Restless Leg Syndrome
          </h1>
          <p className="text-lg text-neutral-700 dark:text-neutral-300">
            Experience breakthrough comfort with our innovative pressure therapy device.
          </p>
        </div>
      </section>

      {/* Product Section */}
      <section className="border-4 border-black dark:border-neutral-50 rounded-lg shadow-[8px_8px_0_0_black] dark:shadow-[8px_8px_0_0_#f5f5f5] p-6 space-y-6 transition-transform hover:-translate-y-1 hover:translate-x-1">
        <div className="flex flex-col gap-6 md:flex-row items-center">
          <div className="flex-1 space-y-4">
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
              {PRODUCT_DATA.name}
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300">
              {PRODUCT_DATA.description}
            </p>
            <Button className="border-4 border-black dark:border-neutral-50 shadow-[4px_4px_0_0_black] dark:shadow-[4px_4px_0_0_#f5f5f5] hover:-translate-y-0.5 hover:translate-x-0.5">
              Learn More
            </Button>
          </div>
          <div className="w-full md:w-1/2">
            <img
              src={STOCK_PHOTOS.hero}
              alt={PRODUCT_DATA.name}
              className="w-full h-auto border-4 border-black dark:border-neutral-50 shadow-[4px_4px_0_0_black] dark:shadow-[4px_4px_0_0_#f5f5f5]"
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="grid md:grid-cols-3 gap-6">
        {PRODUCT_DATA.features.slice(0, 3).map((feature, index) => (
          <Card
            key={index}
            className="border-4 border-black dark:border-neutral-50 shadow-[8px_8px_0_0_black] dark:shadow-[8px_8px_0_0_#f5f5f5] transition-transform hover:-translate-y-1 hover:translate-x-1"
          >
            <CardContent className="p-6 space-y-2">
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">
                {feature}
              </h3>
              <p className="text-neutral-700 dark:text-neutral-300">
                Experience the difference with our medical-grade solution.
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Testimonials */}
      <section className="border-4 border-black dark:border-neutral-50 rounded-lg shadow-[8px_8px_0_0_black] dark:shadow-[8px_8px_0_0_#f5f5f5] p-8 space-y-8 transition-transform hover:-translate-y-1 hover:translate-x-1">
        <h2 className="text-3xl font-bold text-center text-neutral-900 dark:text-neutral-50">
          Customer Stories
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {PRODUCT_DATA.testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="border-4 border-black dark:border-neutral-50 shadow-[8px_8px_0_0_black] dark:shadow-[8px_8px_0_0_#f5f5f5] transition-transform hover:-translate-y-1 hover:translate-x-1"
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="italic text-neutral-700 dark:text-neutral-300">
                  {testimonial.text}
                </p>
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {testimonial.name}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
