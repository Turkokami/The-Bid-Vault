import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.ALERT_FROM_EMAIL ?? "alerts@thebidvault.com";

export type AlertEmailOpportunity = {
  title: string;
  agency: string;
  dueDate: string;
  location: string;
  sourceUrl?: string;
  source: "federal" | "state-local";
};

function opportunityRows(opps: AlertEmailOpportunity[]) {
  return opps
    .map(
      (o) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #1e293b;">
        <p style="margin:0;font-size:14px;font-weight:600;color:#f1f5f9;">${o.title}</p>
        <p style="margin:4px 0 0;font-size:12px;color:#94a3b8;">${o.agency} · ${o.location}</p>
        ${o.dueDate ? `<p style="margin:4px 0 0;font-size:12px;color:#6ee7b7;">Due: ${o.dueDate}</p>` : ""}
        ${o.sourceUrl ? `<p style="margin:6px 0 0;"><a href="${o.sourceUrl}" style="font-size:12px;color:#34d399;">View opportunity →</a></p>` : ""}
      </td>
    </tr>`,
    )
    .join("");
}

export async function sendAlertDigestEmail({
  toEmail,
  industry,
  stateCode,
  opportunities,
  unsubscribeId,
}: {
  toEmail: string;
  industry: string;
  stateCode: string;
  opportunities: AlertEmailOpportunity[];
  unsubscribeId: string;
}) {
  const federalOpps = opportunities.filter((o) => o.source === "federal");
  const stateOpps = opportunities.filter((o) => o.source === "state-local");

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0b1324;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0b1324;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#050816,#0d1f3c);border:1px solid rgba(52,211,153,0.2);border-radius:16px;padding:28px 32px;margin-bottom:24px;">
            <p style="margin:0;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#6ee7b7;">The Bid Vault</p>
            <h1 style="margin:12px 0 0;font-size:24px;font-weight:700;color:#f1f5f9;line-height:1.3;">
              New contracts matched your alert
            </h1>
            <p style="margin:10px 0 0;font-size:14px;color:#94a3b8;">
              Industry: <strong style="color:#e2e8f0;">${industry}</strong> · State: <strong style="color:#e2e8f0;">${stateCode}</strong>
            </p>
          </td>
        </tr>

        <tr><td style="height:20px;"></td></tr>

        ${federalOpps.length > 0 ? `
        <!-- Federal section -->
        <tr>
          <td style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:24px 28px;">
            <p style="margin:0 0 16px;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#6ee7b7;">Federal contracts (SAM.gov)</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${opportunityRows(federalOpps)}
            </table>
          </td>
        </tr>
        <tr><td style="height:16px;"></td></tr>
        ` : ""}

        ${stateOpps.length > 0 ? `
        <!-- State & local section -->
        <tr>
          <td style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:24px 28px;">
            <p style="margin:0 0 16px;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#6ee7b7;">State & local contracts</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${opportunityRows(stateOpps)}
            </table>
          </td>
        </tr>
        <tr><td style="height:16px;"></td></tr>
        ` : ""}

        <!-- CTA -->
        <tr>
          <td align="center" style="padding:8px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://thebidvault.com"}/sam-search"
               style="display:inline-block;background:#059669;color:#fff;font-size:14px;font-weight:600;text-decoration:none;padding:14px 28px;border-radius:999px;">
              Open The Bid Vault →
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:24px 0 0;text-align:center;">
            <p style="margin:0;font-size:12px;color:#475569;">
              You're receiving this because you set up a contract alert on The Bid Vault.
              <br>
              <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://thebidvault.com"}/api/alerts/unsubscribe?id=${unsubscribeId}"
                 style="color:#6ee7b7;">Unsubscribe from this alert</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const { error } = await resend.emails.send({
    from: FROM,
    to: toEmail,
    subject: `${opportunities.length} new contract${opportunities.length === 1 ? "" : "s"} matched your alert — ${industry} in ${stateCode}`,
    html,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
}
