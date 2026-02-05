import {
  Bot,
  Infinity,
  Hash,
  MessageCircle,
  Send,
  Link2,
  Layers,
  Clock,
  Database,
} from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "Agente de IA",
    description:
      "Qualificação e ofertas automáticas com inteligência artificial",
    highlight: true,
  },
  {
    icon: Infinity,
    title: "Interações ilimitadas",
    description: "Sem limite de contatos ou mensagens enviadas",
  },
  {
    icon: Hash,
    title: "Gatilhos por palavra-chave",
    description: "Configure respostas personalizadas para cada situação",
  },
  {
    icon: MessageCircle,
    title: "Resposta a comentários",
    description: "Responda comentários automaticamente 24/7",
  },
  {
    icon: Send,
    title: "Resposta a DMs",
    description: "Nunca deixe uma mensagem sem resposta",
  },
  {
    icon: Link2,
    title: "Envio de links",
    description: "Links automáticos para produtos, páginas e ofertas",
  },
  {
    icon: Layers,
    title: "Multicanal",
    description: "Instagram, Messenger, WhatsApp, SMS e E-mail",
  },
  {
    icon: Clock,
    title: "TikTok",
    description: "Em breve disponível para TikTok",
    soon: true,
  },
  {
    icon: Database,
    title: "CRM integrado",
    description: "Gestão e qualificação de leads em um só lugar",
    soon: true,
  },
];

export function Features() {
  return (
    <section
      id="features"
      className="py-24 md:py-32 relative bg-gradient-to-b from-transparent via-secondary/30 to-transparent"
    >
      <div className="container px-4 md:px-6 mx-auto">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-6 mb-16">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">
              Funcionalidades
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Tudo que você precisa para{" "}
              <span className="text-gradient">escalar suas vendas</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`bg-card border border-border/50 rounded-xl p-6 hover:border-primary/30 transition-all relative ${
                  feature.highlight ? "border-primary/30 glow-primary" : ""
                }`}
              >
                {feature.soon && (
                  <span className="absolute top-4 right-4 text-xs bg-accent text-primary px-2 py-1 rounded-full">
                    Em breve
                  </span>
                )}
                <div className="space-y-4">
                  <div className="feature-icon group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
