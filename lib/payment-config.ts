import QRCode from "qrcode";

export const PAYMENT_CONFIG = {
  // Official Academy UPI ID (VPA)
  upiId: process.env.NEXT_PUBLIC_ACADEMY_UPI_ID || "charanorganicsoaps-1@okicici",
  // Academy UPI / GPay / PhonePe Mobile Number
  upiPhoneNumber: process.env.NEXT_PUBLIC_ACADEMY_UPI_NUMBER || "9603220663",
  // Direct Academy Helpline Phone for inquiries and fast verification
  supportPhone: process.env.NEXT_PUBLIC_ACADEMY_SUPPORT_PHONE || "8247838125",
  // WhatsApp Helpline Number
  supportWhatsapp: process.env.NEXT_PUBLIC_ACADEMY_SUPPORT_WHATSAPP || "918247838125",
  // Merchant Name
  merchantName: "Charan Organics",
};

export function getUpiPaymentUrl(amount: number, note = "Course Enrollment"): string {
  const upiId = PAYMENT_CONFIG.upiId;
  const name = encodeURIComponent(PAYMENT_CONFIG.merchantName);
  const encNote = encodeURIComponent(note);
  return `upi://pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR&tn=${encNote}`;
}

export async function generateQrDataUrl(amount: number, size = 300): Promise<string> {
  const upiUrl = getUpiPaymentUrl(amount);
  return QRCode.toDataURL(upiUrl, {
    width: size,
    margin: 1.5,
    color: {
      dark: "#0b2b1a",
      light: "#ffffff",
    },
  });
}

export function getInternalUpiQrUrl(amount: number): string {
  return `/api/upi/qr?amount=${amount}`;
}
