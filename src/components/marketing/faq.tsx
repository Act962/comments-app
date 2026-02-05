import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Funciona para perfis pequenos?",
    answer:
      "Sim! O Comments funciona para perfis de qualquer tamanho. Na verdade, começar cedo permite que você escale de forma organizada desde o início, sem perder leads ou oportunidades de venda.",
  },
  {
    question: "A automação deixa o atendimento robótico?",
    answer:
      "Não. Nossa IA foi treinada para manter conversas naturais e humanizadas. Você pode personalizar o tom de voz e as respostas para combinar com a identidade da sua marca.",
  },
  {
    question: "Preciso saber programação?",
    answer:
      "Absolutamente não. O Comments foi desenvolvido para ser usado por qualquer pessoa. A configuração é visual, intuitiva e pode ser feita em poucos minutos.",
  },
  {
    question: "Tem risco para minha conta do Instagram?",
    answer:
      "Não. Utilizamos a API oficial do Instagram/Meta, seguindo todas as diretrizes da plataforma. Sua conta está 100% segura.",
  },
  {
    question: "Funciona para vendas ou só engajamento?",
    answer:
      "Funciona para ambos! Você pode configurar fluxos focados em engajamento, qualificação de leads ou conversão direta em vendas. O Comments se adapta à sua estratégia.",
  },
  {
    question: "O CRM faz parte da plataforma?",
    answer:
      "O CRM integrado está em desenvolvimento e será lançado em breve. Por enquanto, você pode exportar seus leads e integrar com ferramentas externas via webhooks.",
  },
];

export function FAQ() {
  return (
    <section className="py-24 md:py-32 relative bg-gradient-to-b from-transparent via-secondary/30 to-transparent">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="max-w-3xl mx-auto">
          <div className="text-center space-y-6 mb-16">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">
              FAQ
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mt-4">
              Perguntas <span className="text-gradient">frequentes</span>
            </h2>
          </div>

          <Accordion
            type="single"
            collapsible
            className="space-y-4 bg-none border-none"
          >
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border/50 rounded-xl px-6 border-none data-[state=open]:border-primary/30"
              >
                <AccordionTrigger className="text-left hover:no-underline py-6 text-foreground font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
