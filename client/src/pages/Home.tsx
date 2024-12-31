import { PRODUCT_DATA } from "@/lib/constants";
import ProductCard from "@/components/ProductCard";
import { TestimonialCarousel } from "@/components/TestimonialCarousel";

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="relative py-12 px-4 border-4 border-black bg-white shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
        <div className="max-w-4xl mx-auto">
          <h1 className="mb-6 text-3xl font-bold uppercase text-center tracking-wider">
            Featured Product
          </h1>
          <ProductCard product={PRODUCT_DATA} />
        </div>
      </section>

      <section className="relative py-12 px-4 border-4 border-black bg-white shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
        <div className="max-w-4xl mx-auto">
          <h2 className="mb-6 text-3xl font-bold uppercase text-center tracking-wider">
            Patient Success Stories
          </h2>
          <TestimonialCarousel />
        </div>
      </section>
    </div>
  );
}
