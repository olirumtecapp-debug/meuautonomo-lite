// server/email.ts — Envio de e-mail transacional oficial via Gmail SMTP + Fallback Resend
//
// Prioridade 1: Gmail SMTP via Nodemailer (100% gratuito, oficial contatocreativeam@gmail.com)
// Prioridade 2: Fallback Resend API via HTTPS fetch
// Prioridade 3: Modo simulação no console para testes locais
import nodemailer from "nodemailer";

const RESEND_API_URL = "https://api.resend.com/emails";

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_PASS = process.env.GMAIL_PASS;

let _transporter: any = null;
function getTransporter() {
  if (!_transporter && GMAIL_USER && GMAIL_PASS) {
    _transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASS,
      },
    });
  }
  return _transporter;
}

export function isEmailConfigured(): boolean {
  return Boolean(
    (GMAIL_USER && GMAIL_PASS) ||
    (process.env.RESEND_API_KEY && process.env.EMAIL_REMETENTE)
  );
}

export interface EnviarEmailOptions {
  para: string;
  assunto: string;
  texto?: string;
  html?: string;
  replyTo?: string;
}

export async function enviarEmail({ para, assunto, texto, html, replyTo }: EnviarEmailOptions): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!para || !String(para).includes("@")) {
    console.warn("[Email] Destinatário inválido:", para);
    return { ok: false, error: "Destinatário de e-mail inválido." };
  }

  // 1. Envio Direto via Gmail Oficial (Nodemailer)
  const transporter = getTransporter();
  if (transporter) {
    try {
      const remetenteNome = process.env.EMAIL_REMETENTE_NOME || "MeuAutônomo";
      const info = await transporter.sendMail({
        from: `"${remetenteNome}" <${GMAIL_USER}>`,
        to: para,
        subject: assunto,
        replyTo: replyTo || GMAIL_USER || undefined,
        text: texto || "",
        html: html || undefined,
        headers: {
          "X-Entity-Ref-ID": `quote-${Date.now()}`,
          "X-Auto-Response-Suppress": "OOF, AutoReply",
        },
      });

      console.log(`[Email Gmail] ✅ E-mail enviado com sucesso para ${para} (ID: ${info.messageId})`);
      return { ok: true, id: info.messageId };
    } catch (err: any) {
      console.error("[Email Gmail] Falha no envio via Gmail SMTP, tentando fallback:", err?.message);
    }
  }

  // 2. Fallback via Resend se configurado
  const chave = process.env.RESEND_API_KEY;
  const remetente = process.env.EMAIL_REMETENTE || "MeuAutônomo <onboarding@resend.dev>";
  if (chave) {
    try {
      const resposta = await fetch(RESEND_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${chave}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: remetente,
          to: [para],
          subject: assunto,
          reply_to: replyTo || process.env.EMAIL_RESPOSTA || undefined,
          text: texto || "",
          html: html || undefined,
        }),
      });

      const corpo = await resposta.text();
      if (!resposta.ok) {
        console.error("[Email Resend] Falha no envio:", resposta.status, corpo.slice(0, 300));
        return { ok: false, error: `Falha ao enviar e-mail: ${resposta.statusText}` };
      }

      let id: string | undefined;
      try {
        id = JSON.parse(corpo).id;
      } catch {
        id = undefined;
      }

      console.log(`[Email Resend] ✅ E-mail enviado com sucesso para ${para} (ID: ${id})`);
      return { ok: true, id };
    } catch (err: any) {
      console.error("[Email Resend] Erro de rede ao enviar:", err?.message);
      return { ok: false, error: "Erro de conexão ao enviar e-mail." };
    }
  }

  // 3. Modo Simulação se nada estiver configurado
  console.log("=============================================================================");
  console.log("📨 [E-MAIL SIMULADO] (Configure GMAIL_PASS ou RESEND_API_KEY no .env)");
  console.log(`👉 Para: ${para}`);
  console.log(`📌 Assunto: ${assunto}`);
  console.log(`📄 Conteúdo:\n${texto || "(HTML enviado)"}`);
  console.log("=============================================================================");
  return { ok: true, id: "simulated-" + Date.now() };
}

export interface ModeloOrcamentoAprovadoParams {
  clienteNome: string;
  clienteEmail: string;
  profissionalNome: string;
  profissionalProfissao?: string;
  profissionalWhatsapp?: string;
  orcamentoId: number;
  totalCents: number;
  paymentTerms?: string;
  notes?: string;
  items: Array<{ description: string; quantity: number; unitPriceCents: number; totalCents: number }>;
  linkProposta: string;
}

export function modeloOrcamentoAprovado(params: ModeloOrcamentoAprovadoParams) {
  const totalFormatado = (params.totalCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const assunto = `Comprovante: Proposta #${params.orcamentoId} Aprovada — ${params.profissionalNome}`;

  const itensTexto = params.items
    .map(it => `• ${it.description} (${it.quantity}x de R$ ${(it.unitPriceCents / 100).toFixed(2)}) = R$ ${(it.totalCents / 100).toFixed(2)}`)
    .join("\n");

  const texto = [
    `Olá, ${params.clienteNome}!`,
    "",
    `Seu aceite na proposta de orçamento #${params.orcamentoId} com ${params.profissionalNome} foi confirmado com sucesso.`,
    "",
    "--- RESUMO DA PROPOSTA ---",
    `Profissional: ${params.profissionalNome} ${params.profissionalProfissao ? `(${params.profissionalProfissao})` : ""}`,
    `Total Aprovado: ${totalFormatado}`,
    params.paymentTerms ? `Forma de pagamento: ${params.paymentTerms}` : "",
    params.notes ? `Observações: ${params.notes}` : "",
    "",
    "Itens do serviço:",
    itensTexto,
    "",
    `Você pode consultar esta proposta a qualquer momento pelo link:`,
    params.linkProposta,
    "",
    "Informações Importantes:",
    "O pagamento deste serviço será combinado e realizado diretamente com o profissional.",
    params.profissionalWhatsapp ? `WhatsApp do profissional: ${params.profissionalWhatsapp}` : "",
    "",
    "Atenciosamente,",
    "MeuAutônomo — Gestão simples para quem trabalha por conta própria.",
  ].filter(Boolean).join("\n");

  const itensHtml = params.items
    .map(
      it => `
      <tr style="border-bottom: 1px solid #edf1eb;">
        <td style="padding: 10px 8px; color: #284b42; font-weight: 500;">${it.description}</td>
        <td style="padding: 10px 8px; text-align: center; color: #71867f;">${it.quantity}</td>
        <td style="padding: 10px 8px; text-align: right; color: #173a34; font-weight: 600;">
          R$ ${(it.totalCents / 100).toFixed(2).replace(".", ",")}
        </td>
      </tr>`
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>${assunto}</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #f5f8f2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #284b42;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(19,42,39,0.06); border: 1px solid #e5ede3;">
          <!-- Topo -->
          <tr>
            <td style="background-color: #173a34; padding: 28px 32px; text-align: left;">
              <span style="display: inline-block; background-color: #d9f56a; color: #173a34; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; padding: 4px 10px; border-radius: 8px;">
                MeuAutônomo
              </span>
              <h1 style="color: #ffffff; font-size: 22px; margin: 12px 0 0 0; font-weight: 700;">
                Orçamento Aprovado com Sucesso! 🎉
              </h1>
              <p style="color: rgba(255,255,255,0.75); font-size: 13px; margin: 4px 0 0 0;">
                Comprovante oficial da proposta digital #${params.orcamentoId}
              </p>
            </td>
          </tr>

          <!-- Corpo -->
          <tr>
            <td style="padding: 32px;">
              <p style="font-size: 15px; line-height: 1.6; margin: 0 0 20px 0; color: #3a574f;">
                Olá, <strong>${params.clienteNome}</strong>!
              </p>
              <p style="font-size: 14px; line-height: 1.6; margin: 0 0 24px 0; color: #526d64;">
                Confirmamos que você aprovou o orçamento de <strong>${params.profissionalNome}</strong>${params.profissionalProfissao ? ` (${params.profissionalProfissao})` : ""}. Abaixo você encontra os detalhes do serviço contratado:
              </p>

              <!-- Card Total -->
              <div style="background-color: #f4f8ed; border-radius: 16px; padding: 18px 20px; margin-bottom: 24px; border: 1px solid #dce8d5;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td>
                      <span style="font-size: 12px; color: #71867f; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Total da Proposta</span>
                      <div style="font-size: 26px; font-weight: 800; color: #173a34; margin-top: 2px;">
                        ${totalFormatado}
                      </div>
                    </td>
                    <td align="right">
                      <span style="display: inline-block; background-color: #e3f3e8; color: #2e6e4a; font-size: 12px; font-weight: 700; padding: 6px 12px; border-radius: 999px;">
                        ✓ Aceito
                      </span>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Tabela de Itens -->
              <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.08em; color: #71867f; margin: 0 0 12px 0;">
                Itens e Serviços Aprovados
              </h3>
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px; font-size: 13px;">
                <thead>
                  <tr style="border-bottom: 2px solid #e5ede3; color: #71867f;">
                    <th align="left" style="padding: 8px;">Descrição</th>
                    <th align="center" style="padding: 8px;">Qtd</th>
                    <th align="right" style="padding: 8px;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itensHtml}
                </tbody>
              </table>

              ${
                params.paymentTerms
                  ? `
              <div style="background-color: #f8faf7; border-radius: 14px; padding: 14px 16px; margin-bottom: 16px; border: 1px solid #e1ebe0;">
                <strong style="font-size: 12px; color: #284b42; display: block; margin-bottom: 4px;">Formas e Condições de Pagamento:</strong>
                <p style="font-size: 13px; color: #4c6960; margin: 0; line-height: 1.5;">${params.paymentTerms}</p>
              </div>`
                  : ""
              }

              ${
                params.notes
                  ? `
              <div style="background-color: #fff9ed; border-radius: 14px; padding: 14px 16px; margin-bottom: 24px; border: 1px solid #f2e3c6;">
                <strong style="font-size: 12px; color: #7c6023; display: block; margin-bottom: 4px;">Observações e Garantias:</strong>
                <p style="font-size: 13px; color: #6e5828; margin: 0; line-height: 1.5;">${params.notes}</p>
              </div>`
                  : ""
              }

              <!-- Botão de Acesso Online -->
              <div style="text-align: center; margin: 28px 0 20px 0;">
                <a href="${params.linkProposta}" target="_blank" style="display: inline-block; background-color: #173a34; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 14px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 12px rgba(23,58,52,0.2);">
                  Visualizar Proposta Online
                </a>
              </div>

              <!-- Aviso Legal -->
              <p style="font-size: 11px; line-height: 1.5; color: #8fa099; background-color: #f7f9f6; padding: 12px 14px; border-radius: 12px; margin: 24px 0 0 0;">
                🔒 <strong>Pagamento Direto:</strong> O pagamento será realizado diretamente entre você e o profissional (${params.profissionalNome}). A plataforma MeuAutônomo fornece a tecnologia de envio da proposta e não retém valores.
              </p>
            </td>
          </tr>

          <!-- Rodapé -->
          <tr>
            <td style="background-color: #f9fbf8; padding: 20px 32px; border-top: 1px solid #edf1eb; text-align: center; font-size: 12px; color: #8fa099;">
              Enviado por <strong>${params.profissionalNome}</strong> através do <strong>MeuAutônomo</strong>.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return { assunto, texto, html };
}

export function modeloRecuperacaoSenha(params: {
  nome: string;
  email: string;
  codigo: string;
}): { assunto: string; texto: string; html: string } {
  const assunto = `Código de Recuperação de Senha: ${params.codigo} — MeuAutônomo`;
  const texto = `Olá, ${params.nome}!\n\nRecebemos uma solicitação para redefinir a senha da sua conta no MeuAutônomo.\n\nSeu código de verificação é: ${params.codigo}\n\nEste código é válido por 20 minutos. Se você não solicitou esta alteração, ignore este e-mail.\n\nEquipe MeuAutônomo • CreativeAM`;

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Recuperação de Senha — MeuAutônomo</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f7f1; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #173a34;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f7f1; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 40px rgba(23,58,52,0.08); border: 1px solid #dce5dc;">
          <tr>
            <td style="background-color: #173a34; padding: 28px 32px; text-align: center;">
              <span style="display: inline-block; background-color: #d9f56a; color: #173a34; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; padding: 4px 10px; border-radius: 8px;">
                MeuAutônomo
              </span>
              <h1 style="color: #ffffff; font-size: 20px; margin: 12px 0 0 0; font-weight: 700;">
                Recuperação de Senha
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px; text-align: left;">
              <p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px 0; color: #3a574f;">
                Olá, <strong>${params.nome}</strong>!
              </p>
              <p style="font-size: 14px; line-height: 1.6; margin: 0 0 24px 0; color: #526d64;">
                Recebemos um pedido para redefinir a senha de acesso à sua conta vinculada ao e-mail <strong>${params.email}</strong>.
              </p>

              <div style="background-color: #f4f8ed; border-radius: 16px; padding: 20px; text-align: center; margin: 24px 0; border: 1px solid #dce8d5;">
                <span style="font-size: 12px; color: #71867f; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600; display: block; margin-bottom: 6px;">
                  Seu Código de Confirmação
                </span>
                <div style="font-size: 32px; font-weight: 900; letter-spacing: 0.25em; color: #173a34; font-family: monospace;">
                  ${params.codigo}
                </div>
                <span style="font-size: 11px; color: #8aa500; font-weight: 600; display: block; margin-top: 6px;">
                  Válido por 20 minutos
                </span>
              </div>

              <p style="font-size: 13px; line-height: 1.6; margin: 0 0 16px 0; color: #698279;">
                Insira este código na tela do MeuAutônomo para cadastrar sua nova senha.
              </p>

              <p style="font-size: 11px; line-height: 1.5; color: #8fa099; background-color: #f7f9f6; padding: 12px 14px; border-radius: 12px; margin: 20px 0 0 0;">
                🔒 Se você não solicitou a redefinição da sua senha, fique tranquilo: sua conta permanece segura e você pode ignorar esta mensagem.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fbf8; padding: 18px 32px; border-top: 1px solid #edf1eb; text-align: center; font-size: 11px; color: #8fa099;">
              Desenvolvido com excelência por <strong>CreativeAM</strong> • MeuAutônomo
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return { assunto, texto, html };
}
