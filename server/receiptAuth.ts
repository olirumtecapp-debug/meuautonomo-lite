import crypto from "crypto";

export function generateReceiptAuthCode(
  type: "A" | "Q",
  id: number,
  profileId: number,
  amountCents: number
): string {
  const secretSalt = process.env.SESSION_SECRET || "meuautonomo-receipt-salt-2026";
  const hash = crypto
    .createHmac("sha256", secretSalt)
    .update(`${type}:${id}:${profileId}:${amountCents}`)
    .digest("hex")
    .slice(0, 6)
    .toUpperCase();
  return `MA-REC-${type}${id}-${hash}`;
}
