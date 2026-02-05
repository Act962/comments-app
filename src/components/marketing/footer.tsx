import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { AppLogo } from "../app-logo";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="py-16 md:py-24 border-t border-border">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="lg:col-span-2 space-y-6">
              <div className="w-[200px]">
                <AppLogo />
              </div>

              <p className="text-muted-foreground max-w-sm">
                O problema não é falta de engajamento. É falta de método para
                transformar atenção em venda.
              </p>
              <Button variant="default" asChild>
                <Link href="/register">
                  Criar minha conta
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>

            {/* Links */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Produto</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Funcionalidades
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Preços
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Integrações
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Suporte</h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Central de ajuda
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Termos de uso
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Privacidade
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 Comments. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-6">
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Instagram
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                LinkedIn
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                YouTube
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
