import { getAllConfig, maskSecret } from "@/lib/config";

export async function messagingConfig() {
  const cfg = await getAllConfig();
  const emailKey = cfg.email_api_key ?? "";
  const smsKey = cfg.sms_api_key ?? "";
  return {
    emailProvider: cfg.email_provider || "smtp",
    emailKeyMasked: maskSecret(emailKey),
    emailFrom: cfg.email_from || "",
    emailConfigured: emailKey.trim().length > 0,
    smsProvider: cfg.sms_provider || "twilio",
    smsKeyMasked: maskSecret(smsKey),
    smsSender: cfg.sms_sender || "",
    smsConfigured: smsKey.trim().length > 0,
  };
}
