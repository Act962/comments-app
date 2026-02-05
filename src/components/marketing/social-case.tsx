import { Star } from "lucide-react";

const testimonials = [
  {
    quote: "Reduzimos 80% do tempo em DMs e aumentamos conversões.",
    author: "Marina S.",
    role: "Infoprodutora",
    rating: 5,
  },
  {
    quote: "Nunca mais perdemos leads por demora.",
    author: "Carlos R.",
    role: "E-commerce",
    rating: 5,
  },
  {
    quote: "O Instagram virou um canal real de vendas.",
    author: "Ana Paula M.",
    role: "Coach de negócios",
    rating: 5,
  },
];

const logos = ["Marca 1", "Marca 2", "Marca 3", "Marca 4", "Marca 5"];

export function SocialCase() {
  return (
    <section className="py-24 md:py-32 relative">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="max-w-5xl mx-auto">
          <div className="text-center space-y-6 mb-16">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">
              Prova social
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Empresas que decidiram{" "}
              <span className="text-gradient">parar de improvisar.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-card border border-border/50 rounded-xl p-6 hover:border-primary/30 transition-all group"
              >
                <div className="space-y-4">
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-primary text-primary"
                      />
                    ))}
                  </div>
                  <p className="text-foreground text-lg italic">
                    "{testimonial.quote}"
                  </p>
                  <div className="pt-4 border-t border-border">
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Logos */}
          {/* <div className="text-center space-y-8">
            <p className="text-sm text-muted-foreground uppercase tracking-wider">
              Empresas que confiam no Comments
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
              {logos.map((logo, index) => (
                <div
                  key={index}
                  className="w-24 h-12 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground text-sm font-medium hover:bg-muted transition-colors"
                >
                  {logo}
                </div>
              ))}
            </div>
          </div> */}
        </div>
      </div>
    </section>
  );
}
