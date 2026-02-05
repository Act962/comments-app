import { Hash, Brain, MessageSquare, DollarSign } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Hash,
    title: "Defina palavras-chave",
    description: "Configure gatilhos para comentários e mensagens específicas",
  },
  {
    number: "02",
    icon: Brain,
    title: "IA identifica intenção",
    description: "Nossa inteligência artificial entende o que o usuário quer",
  },
  {
    number: "03",
    icon: MessageSquare,
    title: "Sistema responde",
    description: "Responde, conversa e envia links automaticamente",
  },
  {
    number: "04",
    icon: DollarSign,
    title: "Você vende",
    description: "Transforme cada interação em oportunidade de venda",
  },
];

export function HowItWorks() {
  return (
    <section id="solution" className="py-24 md:py-32 relative">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="max-w-5xl mx-auto">
          <div className="text-center space-y-6 mb-16">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">
              Como funciona
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              4 passos para{" "}
              <span className="text-primary">
                vender <br /> no automático
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="relative group">
                {/* Connection line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-px bg-gradient-to-r from-primary/50 to-transparent z-0" />
                )}

                <div className="bg-card border border-border/50 rounded-xl p-6 h-full relative z-10 hover:border-primary/30 transition-all hover:-translate-y-1">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-4xl font-bold text-primary/20">
                        {step.number}
                      </span>
                      <div className="size-10 rounded-xl flex items-center justify-center">
                        <step.icon className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
