import { AlertTriangle, Clock, MessageSquare, Users } from "lucide-react";

const problems = [
  { icon: MessageSquare, text: "Comentários sem resposta" },
  { icon: Clock, text: "Tempo perdido em DMs" },
  { icon: Users, text: "Leads que escapam" },
  { icon: AlertTriangle, text: "Vendas travadas" },
];

export function Problem() {
  return (
    <section className="py-24 md:py-32 relative">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            O engajamento cresce.{" "}
            <span className="text-muted-foreground">O tempo some.</span>{" "}
            <span className="text-destructive/80">As vendas travam.</span>
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Comentários, mensagens diretas, pedidos de link, perguntas
            repetidas. Quando o perfil cresce, o caos começa.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-12">
            {problems.map((problem, index) => (
              <div
                key={index}
                className="bg-card border border-border/50 rounded-xl p-6 flex flex-col items-center gap-4 hover:border-destructive/30 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:bg-destructive/10 transition-colors">
                  <problem.icon className="w-6 h-6 text-muted-foreground group-hover:text-destructive/80 transition-colors" />
                </div>
                <span className="text-sm text-muted-foreground text-center">
                  {problem.text}
                </span>
              </div>
            ))}
          </div>

          <div className="bg-card border border-border/50 rounded-xl p-6 md:p-8 mt-8">
            <p className="text-lg md:text-xl text-foreground">
              O problema não é falta de engajamento.{" "}
              <span className="text-primary font-semibold">
                É falta de automação com inteligência.
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
