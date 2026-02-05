"use client";

import Link from "next/link";
import { Navbar } from "@/components/marketing/navbar";
import { FooterSection } from "@/components/marketing/footer-section";
import { Logo } from "@/components/marketing/logo";
import {
  Shield,
  Mail,
  Globe,
  Clock,
  Building2,
  CheckCircle2,
  Lock,
  Share2,
  Trash2,
  UserCircle,
  AlertCircle,
} from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-24 lg:pt-32 pb-16">
        <div className="mx-auto px-6 max-w-4xl">
          {/* Hero Section of the Page */}
          <div className="mb-16 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Shield className="size-4" />
              <span>Transparência e Confiança</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-foreground animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              Política de Privacidade
            </h1>
            <div className="flex items-center justify-center gap-4 text-muted-foreground text-sm animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="size-4 text-primary" />
                Última atualização: 02 de fevereiro de 2026
              </span>
            </div>
          </div>

          {/* Table of Contents / Summary Card */}
          <div className="mb-16 p-8 rounded-3xl border border-dashed bg-muted/30 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-background border shadow-xs">
                    <Building2 className="size-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">ACT Digital</h3>
                    <p className="text-xs text-muted-foreground">
                      CNPJ: 13.576.747/0001-34
                    </p>
                  </div>
                </div>
                <p className="text-sm text-balance">
                  Responsável pelo <strong>Comments App</strong>, garantindo a
                  proteção e o uso ético dos seus dados em conformidade com a
                  LGPD e Políticas da Meta.
                </p>
              </div>
              <div className="flex flex-col justify-center space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="size-4 text-green-500" />
                  <span>Conforme com a LGPD</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="size-4 text-green-500" />
                  <span>Criptografia de Ponta a Ponta</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="size-4 text-green-500" />
                  <span>Segurança Certificada Meta</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Sections */}
          <div className="space-y-16 text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-400">
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-border" />
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-3 shrink-0">
                  <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary text-sm">01</span>
                  </div>
                  Sobre o App
                </h2>
                <div className="h-px flex-1 bg-border" />
              </div>
              <p>
                O <strong>Comments App</strong> é uma plataforma que permite ao
                usuário automatizar e gerenciar interações no Instagram de forma
                inteligente.
              </p>
              <ul className="grid gap-3 sm:grid-cols-2">
                {[
                  "Autenticação segura via Google",
                  "Integração oficial OAuth 2.0",
                  "Automação por palavras-chave",
                  "Gestão simplificada de posts",
                  "Respostas automáticas no Direct",
                  "Monitoramento em tempo real",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm bg-muted/20 p-3 rounded-xl border border-transparent hover:border-border transition-colors"
                  >
                    <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-border" />
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-3 shrink-0">
                  <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary text-sm">02</span>
                  </div>
                  Dados Coletados
                </h2>
                <div className="h-px flex-1 bg-border" />
              </div>

              <div className="grid gap-6">
                <div className="p-6 rounded-2xl border bg-card/50">
                  <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                    <UserCircle className="size-5 text-primary" />
                    Fornecidos por você
                  </h3>
                  <p className="text-sm mb-4">
                    Informações essenciais para o funcionamento básico da conta:
                  </p>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    <li>Nome e endereço de e-mail;</li>
                    <li>Credenciais de login (armazenadas com hash seguro);</li>
                    <li>Configurações de automação e textos de resposta;</li>
                    <li>Palavras-chave definidas para filtros.</li>
                  </ul>
                </div>

                <div className="p-6 rounded-2xl border bg-card/50">
                  <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                    <Globe className="size-5 text-primary" />
                    Integração com Instagram (Meta)
                  </h3>
                  <p className="text-sm mb-4">
                    Coletamos apenas após seu consentimento explícito:
                  </p>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    <li>Identificadores da conta authorize;</li>
                    <li>Lista de posts autorizados para automação;</li>
                    <li>Eventos de comentários e mensagens (via Webhooks);</li>
                    <li>
                      <strong>Token de acesso do Instagram</strong> (armazenado
                      com alta segurança).
                    </li>
                  </ul>
                  <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs flex gap-2">
                    <AlertCircle className="size-4 shrink-0" />
                    <span>
                      Não acessamos dados além das permissões concedidas e
                      aprovadas pela Meta.
                    </span>
                  </div>
                </div>

                <div className="p-6 rounded-2xl border bg-card/50">
                  <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                    <Clock className="size-5 text-primary" />
                    Coleta Automática
                  </h3>
                  <p className="text-sm mb-4">
                    Para segurança e melhoria da experiência:
                  </p>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    <li>Endereço IP e informações do dispositivo;</li>
                    <li>Logs de uso e eventos do sistema;</li>
                    <li>Cookies para funcionamento e autenticação.</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-border" />
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-3 shrink-0">
                  <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary text-sm">03</span>
                  </div>
                  Uso dos Dados
                </h2>
                <div className="h-px flex-1 bg-border" />
              </div>
              <p>Processamos seus dados estritamente para:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Gerenciar contas",
                  "Executar automações",
                  "Monitorar palavras-chave",
                  "Cumprir obrigações legais",
                  "Prevenir fraudes",
                  "Melhorar performance",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-lg bg-background border text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-border" />
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-3 shrink-0">
                  <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary text-sm">04</span>
                  </div>
                  Segurança e Retenção
                </h2>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="flex gap-4 p-6 rounded-2xl bg-primary text-primary-foreground min-h-full">
                  <Lock className="size-8 shrink-0 opacity-40" />
                  <div className="space-y-2">
                    <h4 className="font-bold">Segurança</h4>
                    <p className="text-xs leading-relaxed opacity-90">
                      Criptografia de dados sensíveis e hashes robustos. O
                      acesso aos tokens é restrito e monitorado continuamente.
                    </p>
                  </div>
                </div>
                <div className="p-6 rounded-2xl border bg-card/50">
                  <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
                    <Clock className="size-4 text-primary" />
                    Período de Retenção
                  </h4>
                  <p className="text-xs">
                    Os dados são mantidos enquanto a conta estiver ativa, forem
                    necessários para obrigações legais ou para prevenção de
                    fraudes.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-border" />
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-3 shrink-0">
                  <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary text-sm">05</span>
                  </div>
                  Transferência e Menores
                </h2>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Globe className="size-5 text-primary" />
                    Internacional
                  </h3>
                  <p className="text-sm">
                    Dados podem ser processados em servidores no exterior,
                    garantindo sempre os padrões brasileiros de proteção (LGPD).
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <AlertCircle className="size-5 text-primary" />
                    Menores de Idade
                  </h3>
                  <p className="text-sm">
                    O Comments App{" "}
                    <strong>não é destinado a menores de 13 anos</strong>. Não
                    coletamos intencionalmente dados de crianças.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-border" />
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-3 shrink-0">
                  <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary text-sm">06</span>
                  </div>
                  Alterações e Direitos
                </h2>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Share2 className="size-5 text-primary" />
                    Compartilhamento
                  </h3>
                  <p className="text-sm">
                    <strong>Não vendemos seus dados.</strong> Compartilhamos
                    apenas com Meta, infraestrutura de nuvem ou via ordens
                    judiciais.
                  </p>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Trash2 className="size-5 text-primary" />
                    Seus Direitos
                  </h3>
                  <p className="text-sm">
                    Você pode acessar, corrigir ou excluir seus dados a qualquer
                    momento via painel ou suporte oficial.
                  </p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-muted/30 border border-dashed text-xs italic">
                Esta política pode ser atualizada periodicamente. Alterações
                relevantes serão comunicadas via app ou site oficial.
              </div>
            </section>

            <section className="p-8 rounded-3xl border bg-card text-center space-y-6">
              <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Mail className="size-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                Dúvidas e Solicitações
              </h2>
              <p className="text-sm max-w-md mx-auto">
                Para suporte, dúvidas sobre privacidade ou exclusão permanente
                de dados, entre em contato:
              </p>
              <div className="flex flex-col gap-4 items-center">
                <a
                  href="mailto:suportetecniconasa@gmail.com"
                  className="text-xl font-bold text-primary hover:underline underline-offset-8 transition-all"
                >
                  suportetecniconasa@gmail.com
                </a>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>
                    <strong>Empresa:</strong> ACT Digital
                  </p>
                  <p>
                    <strong>Site:</strong> comments.nasaex.com
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className="mt-20 pt-8 border-t text-center text-xs text-muted-foreground flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Logo />
              <span>© 2026 ACT Digital. Todos os direitos reservados.</span>
            </div>
            <div className="flex gap-6">
              <Link
                href="/terms"
                className="hover:text-primary transition-colors"
              >
                Termos de Uso
              </Link>
              <Link
                href="/privacy-policy"
                className="hover:text-primary transition-colors font-bold text-foreground"
              >
                Privacidade
              </Link>
            </div>
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
