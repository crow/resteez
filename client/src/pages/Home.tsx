import { PRODUCT_DATA } from "@/lib/constants";
import ProductCard from "@/components/ProductCard";

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <ProductCard product={PRODUCT_DATA} />
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 px-4 bg-muted">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">What Our Customers Say</h2>
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
        </div>
      </section>
    </div>
  );
}