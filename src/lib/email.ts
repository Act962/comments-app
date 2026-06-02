import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const defaultFrom =
  process.env.BETTER_AUTH_EMAIL ?? "Comments <noreply@notifications.nasaex.com>";

if (!apiKey) {
  // Não jogamos throw aqui: em ambientes de build/migrate o módulo pode ser
  // importado sem a key. Quem chamar `sendEmail` recebe o erro no momento certo.
  console.warn("[email] RESEND_API_KEY ausente — envios serão no-op em dev");
}

const resend = apiKey ? new Resend(apiKey) : null;

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  /** Tag opcional pra rastrear envios no painel do Resend (e.g. "reset-password"). */
  tag?: string;
};

/**
 * Wrapper único pra envio transacional. Loga e propaga erros do Resend.
 *
 * Não bloqueia o fluxo do usuário em fallbacks de dev sem `RESEND_API_KEY`
 * — apenas loga e retorna `{ id: null }`.
 */
export async function sendEmail(input: SendEmailInput) {
  if (!resend) {
    console.warn("[email] no-op (RESEND_API_KEY ausente)", {
      to: input.to,
      subject: input.subject,
      tag: input.tag,
    });
    return { id: null as string | null };
  }

  const { data, error } = await resend.emails.send({
    from: input.from ?? defaultFrom,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
    replyTo: input.replyTo,
    tags: input.tag ? [{ name: "category", value: input.tag }] : undefined,
  });

  if (error) {
    console.error("[email] erro Resend", {
      to: input.to,
      subject: input.subject,
      tag: input.tag,
      error,
    });
    throw new Error(error.message ?? "Falha ao enviar email");
  }

  return { id: data?.id ?? null };
}

// ────────────────────────────────────────────────────────────────────────────
// Templates HTML inline. Mantidos simples e auto-contidos — sem dependência de
// React Email pra esta primeira versão. Se a base de templates crescer, vale
// migrar pra @react-email/components.
// ────────────────────────────────────────────────────────────────────────────

const baseStyles = `
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: #111827;
  line-height: 1.6;
  max-width: 560px;
  margin: 0 auto;
  padding: 24px;
`;

const buttonStyles = `
  display: inline-block;
  padding: 12px 20px;
  background: #111827;
  color: #ffffff !important;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
`;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function resetPasswordEmail(args: { name?: string | null; url: string }) {
  const greeting = args.name
    ? `Olá, ${escapeHtml(args.name)}!`
    : "Olá!";
  return {
    subject: "Redefina sua senha",
    html: `
      <div style="${baseStyles}">
        <h1 style="font-size: 20px; margin: 0 0 16px;">${greeting}</h1>
        <p>Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo para criar uma nova senha. O link expira em 1 hora.</p>
        <p style="margin: 24px 0;"><a href="${escapeHtml(args.url)}" style="${buttonStyles}">Redefinir senha</a></p>
        <p style="color:#6b7280; font-size: 13px;">Se você não fez essa solicitação, ignore este e-mail — sua senha continua a mesma.</p>
        <p style="color:#6b7280; font-size: 13px;">Ou copie e cole esta URL: <br/><span style="word-break: break-all;">${escapeHtml(args.url)}</span></p>
      </div>
    `,
    text: `Redefina sua senha\n\nClique para redefinir: ${args.url}\n\nSe você não fez essa solicitação, ignore este e-mail.`,
  };
}

export function verifyEmail(args: { name?: string | null; url: string }) {
  const greeting = args.name
    ? `Olá, ${escapeHtml(args.name)}!`
    : "Bem-vindo!";
  return {
    subject: "Confirme seu e-mail",
    html: `
      <div style="${baseStyles}">
        <h1 style="font-size: 20px; margin: 0 0 16px;">${greeting}</h1>
        <p>Para começar a usar o Comments, confirme que este é o seu e-mail.</p>
        <p style="margin: 24px 0;"><a href="${escapeHtml(args.url)}" style="${buttonStyles}">Confirmar e-mail</a></p>
        <p style="color:#6b7280; font-size: 13px;">Se você não criou esta conta, pode ignorar este e-mail.</p>
        <p style="color:#6b7280; font-size: 13px;">Ou copie e cole esta URL: <br/><span style="word-break: break-all;">${escapeHtml(args.url)}</span></p>
      </div>
    `,
    text: `Confirme seu e-mail\n\nClique para confirmar: ${args.url}`,
  };
}

export function invitationEmail(args: {
  organizationName: string;
  inviterName?: string | null;
  inviterEmail: string;
  role: string;
  url: string;
}) {
  const roleLabel =
    args.role === "owner"
      ? "Dono"
      : args.role === "admin"
        ? "Administrador"
        : "Membro";
  const inviter =
    args.inviterName?.trim() ||
    args.inviterEmail ||
    "Um membro";
  return {
    subject: `Você foi convidado para a empresa ${args.organizationName}`,
    html: `
      <div style="${baseStyles}">
        <h1 style="font-size: 20px; margin: 0 0 16px;">Você foi convidado</h1>
        <p><strong>${escapeHtml(inviter)}</strong> convidou você para a empresa <strong>${escapeHtml(args.organizationName)}</strong> como <strong>${escapeHtml(roleLabel)}</strong>.</p>
        <p style="margin: 24px 0;"><a href="${escapeHtml(args.url)}" style="${buttonStyles}">Aceitar convite</a></p>
        <p style="color:#6b7280; font-size: 13px;">Se você não esperava este convite, pode ignorar este e-mail.</p>
        <p style="color:#6b7280; font-size: 13px;">Ou copie e cole esta URL: <br/><span style="word-break: break-all;">${escapeHtml(args.url)}</span></p>
      </div>
    `,
    text: `Você foi convidado para ${args.organizationName} como ${roleLabel}.\n\nAceitar: ${args.url}`,
  };
}
