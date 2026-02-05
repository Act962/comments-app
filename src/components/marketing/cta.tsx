import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";
import Link from "next/link";

export function CTA() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 rounded-full blur-[120px] opacity-50" />

      <div className="container px-4 md:px-6 relative z-10 mx-auto">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              Comece em minutos
            </span>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Comece a crescer no Instagram{" "}
            <span className="text-gradient">hoje mesmo.</span>
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
            Você já tem muita coisa para se preocupar. Por isso, criamos o
            Comments extremamente fácil de usar. A maioria das pessoas começa em
            minutos.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button asChild>
              <Link href="/register">
                Criar minha conta agora
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Sem cartão de crédito • Cancele quando quiser
          </p>
        </div>
      </div>
    </section>
  );
}
