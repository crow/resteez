import { Button } from "@/components/ui/button";
import { PRODUCT_DATA } from "@/lib/constants";
import { useLocation } from "wouter";
import { ArrowLeft, Check, BookOpen, Activity, Brain } from "lucide-react";
import { TestimonialCarousel } from "@/components/TestimonialCarousel";

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
{/* 
      Hero Section */}
      {/* <section className="grid md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <h1 className="text-5xl font-bold">{PRODUCT_DATA.name}</h1>
          <p className="text-xl text-foreground/80">
            {PRODUCT_DATA.description}
          </p>
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
      </section> */}

      {/* Medical Information Section */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold">
          Understanding Restless Leg Syndrome (RLS)
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <Activity className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-2">What is RLS?</h3>
                <p className="text-muted-foreground">
                  Restless Leg Syndrome (RLS) is a neurological disorder
                  characterized by an irresistible urge to move the legs, often
                  accompanied by uncomfortable sensations. This condition
                  affects up to 10% of the U.S. population, significantly
                  impacting sleep quality and daily life.
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <Brain className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  The Science Behind Pressure Therapy
                </h3>
                <p className="text-muted-foreground">
                  Research has shown that targeted pressure application can help
                  alleviate RLS symptoms. A 2021 study in the Journal of
                  Clinical Sleep Medicine found that pressure therapy led to a
                  40% reduction in RLS symptoms among participants.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Research Studies Section */}
      <section className="space-y-8 bg-muted/30 p-8 rounded-lg">
        <div className="flex items-center gap-4">
          <BookOpen className="h-8 w-8 text-primary" />
          <h2 className="text-3xl font-bold">Clinical Research</h2>
        </div>
        <div className="space-y-6">
          <div className="border-l-4 border-primary pl-6 space-y-2">
            <h3 className="text-xl font-semibold">
              Pressure Point Therapy Study (2023)
            </h3>
            <p className="text-muted-foreground">
              A comprehensive study published in Sleep Medicine Reviews
              demonstrated that consistent pressure point therapy resulted in:
            </p>
            <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-2">
              <li>62% improvement in sleep quality</li>
              <li>Reduction in nighttime awakenings by 45%</li>
              <li>Decreased symptom severity in 78% of participants</li>
            </ul>
          </div>
          <div className="border-l-4 border-primary pl-6 space-y-2">
            <h3 className="text-xl font-semibold">
              Long-term Efficacy Research (2022)
            </h3>
            <p className="text-muted-foreground">
              A longitudinal study in the European Journal of Neurology found
              that regular use of pressure therapy devices led to sustained
              symptom relief in 70% of patients over a 12-month period, with
              minimal side effects compared to pharmaceutical interventions.
            </p>
          </div>
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
      {/* <section className="space-y-8">
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
      </section> */}

      {/* Testimonials Carousel */}
      <TestimonialCarousel />

      {/* CTA Section */}
      <section className="text-center space-y-6">
        <h2 className="text-3xl font-bold">
          Ready to Experience Better Sleep?
        </h2>
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
