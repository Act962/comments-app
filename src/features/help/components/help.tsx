"use client";

import { EntityContainer, EntityHeader } from "@/components/entity-components";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { MailIcon, PhoneIcon, MessageCircleIcon } from "lucide-react";

const FAQ_ITEMS = [
  {
    question: "Como funcionam os planos e assinaturas?",
    answer:
      "Oferecemos planos mensais e anuais que se adaptam ao tamanho da sua operação. Você pode fazer o upgrade ou downgrade a qualquer momento através das configurações de faturamento.",
  },
  {
    question: "Como posso configurar minhas notificações?",
    answer:
      "Acesse a página de Configurações e clique na aba 'Notificações'. Lá você poderá escolher quais alertas deseja receber por e-mail ou via push.",
  },
  {
    question: "É possível cancelar a assinatura a qualquer momento?",
    answer:
      "Sim, não temos fidelidade. Você pode cancelar sua assinatura quando desejar diretamente pelo painel administrativo, sem taxas ocultas.",
  },
  {
    question: "Quais são as formas de pagamento aceitas?",
    answer:
      "Aceitamos todos os principais cartões de crédito, Pix e boleto bancário para planos anuais. Nossos pagamentos são processados com total segurança.",
  },
  {
    question: "Como altero meus dados de perfil?",
    answer:
      "Basta ir no menu de Perfil, localizado no canto superior direito, e selecionar 'Configurações de Conta'.",
  },
];

export const HelpHeader = () => {
  return (
    <EntityHeader
      title="Central de Ajuda"
      description="Encontre respostas para suas dúvidas ou entre em contato conosco"
    />
  );
};

export const HelpContainer = () => {
  return (
    <EntityContainer header={<HelpHeader />}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
        <div className="lg:col-span-2 space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-4">Dúvidas Frequentes</h2>
            <Accordion type="single" collapsible className="w-full">
              {FAQ_ITEMS.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger>{item.question}</AccordionTrigger>
                  <AccordionContent>{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle>Não encontrou o que procurava?</CardTitle>
              <CardDescription>
                Nossa equipe está à disposição para ajudar você com qualquer
                outra questão.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <FieldGroup>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="name">Nome</FieldLabel>
                      <Input id="name" placeholder="Seu nome completo" />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="email">E-mail</FieldLabel>
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                      />
                    </Field>
                  </div>
                  <Field>
                    <FieldLabel htmlFor="subject">Assunto</FieldLabel>
                    <Input
                      id="subject"
                      placeholder="Sobre o que você deseja falar?"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="message">Mensagem</FieldLabel>
                    <Textarea
                      id="message"
                      placeholder="Descreva sua dúvida ou problema detalhadamente..."
                      rows={4}
                    />
                  </Field>
                </FieldGroup>
                <Button className="w-full md:w-auto">Enviar Solicitação</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold mb-4">Canais de Contato</h2>
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <MailIcon size={20} />
                </div>
                <div>
                  <h3 className="font-medium">E-mail</h3>
                  <p className="text-sm text-muted-foreground">
                    suporte@empresa.com.br
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Resposta em até 24h úteis
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <PhoneIcon size={20} />
                </div>
                <div>
                  <h3 className="font-medium">Telefone</h3>
                  <p className="text-sm text-muted-foreground">
                    +55 (11) 4002-8922
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Seg a Sex, das 9h às 18h
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <MessageCircleIcon size={20} />
                </div>
                <div>
                  <h3 className="font-medium">WhatsApp</h3>
                  <p className="text-sm text-muted-foreground">
                    +55 (11) 99999-9999
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Atendimento imediato
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/50 border-none">
            <CardHeader>
              <CardTitle className="text-sm">Horário de Atendimento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Segunda à Sexta: 08:00 - 18:00</p>
                <p>Sábado: 09:00 - 13:00</p>
                <p>Domingo e Feriados: Fechado</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </EntityContainer>
  );
};
