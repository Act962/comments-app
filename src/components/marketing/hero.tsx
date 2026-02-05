import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Navbar } from "./navbar";
import Link from "next/link";

export function Hero() {
  return (
    <>
      <Navbar />
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] opacity-50" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] opacity-30" />

        <div className="container relative z-10 px-4 md:px-6">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 animate-fade-up mt-8">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                Automação inteligente para Instagram
              </span>
            </div>

            {/* Headline */}
            <h1
              className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight animate-fade-up"
              style={{ animationDelay: "0.1s" }}
            >
              Seu Instagram ficou{" "}
              <span className="text-gradient">mais inteligente.</span>
            </h1>

            {/* Subheadline */}
            <p
              className="text-lg md:text-xl text-muted-foreground max-w-2xl animate-fade-up"
              style={{ animationDelay: "0.2s" }}
            >
              Envie links, responda perguntas, colete leads e feche vendas
              automaticamente — sem transformar engajamento em trabalho em tempo
              integral.
            </p>

            {/* CTA Buttons */}
            <div
              className="flex flex-col sm:flex-row items-center gap-4 animate-fade-up"
              style={{ animationDelay: "0.3s" }}
            >
              <Button asChild>
                <Link href="/register">
                  Começar agora gratuitamente
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>

            {/* Trust text */}
            <p
              className="text-sm text-muted-foreground animate-fade-up"
              style={{ animationDelay: "0.4s" }}
            >
              Sem cartão • Configuração em minutos
            </p>

            {/* Hero visual mockup */}
            <div
              className="relative w-full max-w-3xl mt-12 animate-fade-up"
              style={{ animationDelay: "0.5s" }}
            >
              <div className="card-elevated p-4 md:p-6 glow-primary">
                <div className="aspect-video rounded-xl bg-gradient-to-br from-secondary to-muted flex items-center justify-center overflow-hidden">
                  <div className="grid grid-cols-2 gap-4 p-6 w-full">
                    {/* Mock DM interface */}
                    <div className="bg-background/50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/30" />
                        <div className="space-y-1">
                          <div className="w-20 h-3 bg-muted-foreground/30 rounded" />
                          <div className="w-14 h-2 bg-muted-foreground/20 rounded" />
                        </div>
                      </div>
                      <div className="bg-muted rounded-lg p-2 text-xs text-muted-foreground">
                        Oi! Qual o link do produto?
                      </div>
                      <div className="bg-primary/20 rounded-lg p-2 text-xs text-primary ml-auto max-w-[80%]">
                        Aqui está o link: example.com/produto 🚀
                      </div>
                    </div>

                    {/* Mock stats */}
                    <div className="bg-card/50 rounded-lg p-4 space-y-4">
                      <div className="text-xs text-muted-foreground">
                        Métricas de hoje
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Mensagens</span>
                          <span className="text-primary font-semibold">
                            247
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Leads</span>
                          <span className="text-muted-foreground font-semibold">
                            89
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Conversões</span>
                          <span className="font-semibold text-primary">23</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
