import { Bot, Link, MessageCircle, TrendingUp, Users } from "lucide-react";

const benefits = [
  { icon: MessageCircle, text: "Respostas automáticas em comentários e DMs" },
  { icon: Link, text: "Envio inteligente de links" },
  { icon: Bot, text: "Qualificação de leads com IA" },
  { icon: TrendingUp, text: "Conversas direcionadas para vendas" },
  { icon: Users, text: "Escala sem contratar mais pessoas" },
];

export function Transformation() {
  return (
    <section className="py-24 md:py-32 relative bg-linear-to-b from-transparent via-primary/5 to-transparent">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="max-w-5xl mx-auto">
          <div className="text-center space-y-6 mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Coloque o crescimento do seu Instagram{" "}
              <span className="text-gradient">no piloto automático.</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Lidar com todo mundo que quer um pouco do seu tempo? Veja como
              facilitamos o engajamento em grande escala, sem perder o toque
              humano.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-card border border-border/50 rounded-xl p-6 flex items-start gap-4 hover:border-primary/30 transition-all hover:scale-[1.02] group"
              >
                <div className="size-10 rounded-xl flex items-center justify-center bg-[linear-gradient(135deg,hsl(var(--primary)/0.2),hsl(var(--primary)/0.2))] shrink-0 group-hover:scale-110 transition-transform">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
                <span className="text-foreground font-medium">
                  {benefit.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
