import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Quote } from "lucide-react";

// Sample testimonial data
const testimonials = [
  {
    id: 1,
    name: "Sarah M.",
    location: "California",
    rating: 5,
    verified: true,
    text: "After struggling with restless leg syndrome for years, the RestEaze pressure device has been a game-changer. I can finally get a full night's sleep without disruption.",
    date: "2024-11-15"
  },
  {
    id: 2,
    name: "Michael R.",
    location: "Texas",
    rating: 5,
    verified: true,
    text: "The targeted pressure points really make a difference. It's amazing how such a simple solution can provide such significant relief from RLS symptoms.",
    date: "2024-11-20"
  },
  {
    id: 3,
    name: "Jennifer K.",
    location: "New York",
    rating: 5,
    verified: true,
    text: "As a healthcare professional, I was skeptical at first. But after trying RestEaze, I now recommend it to my patients with RLS. The results speak for themselves.",
    date: "2024-12-01"
  },
  {
    id: 4,
    name: "David L.",
    location: "Florida",
    rating: 4,
    verified: true,
    text: "I've tried many solutions for my restless legs, but this is the only one that's provided consistent relief. The quality of the device is excellent.",
    date: "2024-12-10"
  }
];

export function TestimonialCarousel() {
  return (
    <section className="py-12 bg-muted/30">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">Patient Success Stories</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Read verified testimonials from patients who have found relief with RestEaze
          </p>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {testimonials.map((testimonial) => (
              <CarouselItem key={testimonial.id} className="md:basis-1/2 lg:basis-1/3 pl-4">
                <Card className="border-none shadow-md">
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex gap-0.5">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="h-5 w-5 fill-primary text-primary"
                          />
                        ))}
                      </div>
                      {testimonial.verified && (
                        <Badge variant="secondary" className="ml-2">
                          Verified Patient
                        </Badge>
                      )}
                    </div>

                    <Quote className="h-8 w-8 text-primary/20 mb-2" />
                    <p className="text-muted-foreground mb-4">
                      {testimonial.text}
                    </p>

                    <div className="mt-4 pt-4 border-t">
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.location}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center mt-4">
            <CarouselPrevious className="relative static translate-y-0 mr-2" />
            <CarouselNext className="relative static translate-y-0 ml-2" />
          </div>
        </Carousel>
      </div>
    </section>
  );
}