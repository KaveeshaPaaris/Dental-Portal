import twilio from 'twilio';
import { env } from '../config/env';

const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);

/**
 * Send a WhatsApp message via Twilio WhatsApp Business API.
 * @param to   E.164 number (without "whatsapp:" prefix) e.g. "+15551234567"
 * @param body Message text
 */
export async function sendWhatsApp(to: string, body: string): Promise<void> {
  const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

  await client.messages.create({
    from: env.TWILIO_WHATSAPP_NUMBER,
    to: formattedTo,
    body,
  });
}
