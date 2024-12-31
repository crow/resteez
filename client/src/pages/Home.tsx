import { PRODUCT_DATA } from "@/lib/constants";
import ProductCard from "@/components/ProductCard";
import { TestimonialCarousel } from "@/components/TestimonialCarousel";

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Main Product Section */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <ProductCard product={PRODUCT_DATA} />
        </div>
      </section>

      {/* Patient Success Stories Carousel */}
      <TestimonialCarousel />
    </div>
  );
}
