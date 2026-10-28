/** Sofia's WhatsApp number: every contact button opens a chat with her. */
export const WHATSAPP_NUMBER = '50768548420'
export const waLink = (text: string) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`
