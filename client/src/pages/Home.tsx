import { PRODUCT_DATA } from "@/lib/constants";
import ProductCard from "@/components/ProductCard";
import { Card } from "@/components/ui/card";

export default function Home() {
  const patientStories = [
    {
      title: "Life-Changing Recovery",
      story: "After using RestEaze for my post-surgery recovery, I experienced remarkable improvement in my sleep quality and overall healing process.",
      patient: "Sarah M., Hip Replacement Patient"
    },
    {
      title: "Exceptional Comfort",
      story: "RestEaze provided the perfect support during my recovery. The adjustable features made a significant difference in managing my comfort levels.",
      patient: "James R., Knee Surgery Patient"
    },
    {
      title: "Professional Care Excellence",
      story: "As a healthcare provider, I've seen numerous patients benefit from RestEaze. It's become an essential part of our post-operative care recommendations.",
      patient: "Dr. Emily Chen, Orthopedic Specialist"
    }
  ];

  return (
    <div className="space-y-12">
      {/* Main Product Section */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <ProductCard product={PRODUCT_DATA} />
        </div>
      </section>

      {/* Patient Success Stories Section */}
      <section className="py-12 px-4 bg-muted">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Patient Success Stories</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {patientStories.map((story, index) => (
              <Card key={index} className="p-6">
                <h3 className="text-xl font-semibold mb-3">{story.title}</h3>
                <p className="text-muted-foreground mb-4">{story.story}</p>
                <p className="text-sm font-medium">- {story.patient}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}