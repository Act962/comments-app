import { X, Check } from "lucide-react";

const manualItems = [
  "Resposta lenta",
  "Leads perdidos",
  "Equipe sobrecarregada",
  "Atendimento improvisado",
];

const autoItems = [
  "Resposta instantânea",
  "Leads qualificados",
  "Escala automática",
  "Processo inteligente",
];

export function Comparison() {
  return (
    <section className="py-24 md:py-32 relative bg-gradient-to-b from-transparent via-destructive/5 to-transparent">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-6 mb-16">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">
              Comparativo
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Manual vs <span className="text-gradient">Automático</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Manual */}
            <div className="bg-card border border-border/50 rounded-xl p-6 md:p-8 border-destructive/20">
              <div className="space-y-6">
                <div className="text-center pb-4 border-b border-border">
                  <h3 className="text-xl font-bold text-muted-foreground">
                    Modo Manual
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Como a maioria faz
                  </p>
                </div>
                <ul className="space-y-4">
                  {manualItems.map((item, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center shrink-0">
                        <X className="w-4 h-4 text-destructive" />
                      </div>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Automatic */}
            <div className="bg-card border border-border/50 rounded-xl p-6 md:p-8 border-primary/30 glow-primary">
              <div className="space-y-6">
                <div className="text-center pb-4 border-b border-border">
                  <h3 className="text-xl font-bold text-gradient">
                    Com Comments
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Automação inteligente
                  </p>
                </div>
                <ul className="space-y-4">
                  {autoItems.map((item, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
