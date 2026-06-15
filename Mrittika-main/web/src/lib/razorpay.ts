import Razorpay from "razorpay";
import crypto from "crypto";

export function getRazorpayInstance(): Razorpay {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error(
      `[RAZORPAY] Missing credentials — hasKeyId: ${!!keyId}, hasKeySecret: ${!!keySecret}`
    );
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export async function refundRazorpayPayment(
  paymentId: string,
  amountInRupees: number,
  reason: string
): Promise<{ success: boolean; refundId?: string; message: string }> {
  try {
    console.log('[RAZORPAY] Initiating refund for payment:', paymentId, 'amount:', amountInRupees);

    const razorpay = getRazorpayInstance();
    const refund = await razorpay.payments.refund(paymentId, {
      amount: Math.round(amountInRupees * 100),
      speed: 'normal',
      notes: {
        reason: reason,
        refunded_via: 'Mrittika website cancellation',
      },
    });

    console.log('[RAZORPAY] Refund created:', refund.id, 'status:', refund.status);

    return {
      success: true,
      refundId: refund.id as string,
      message: `Refund of ₹${amountInRupees} initiated. Status: ${refund.status}`,
    };
  } catch (err: any) {
    console.error('[RAZORPAY] Refund failed:', err);
    return {
      success: false,
      message: err.error?.description || err.message || 'Refund initiation failed',
    };
  }
}

export function verifyRazorpaySignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keySecret) {
    console.error("[RAZORPAY] RAZORPAY_KEY_SECRET is not set — cannot verify signature");
    return false;
  }

  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  return expected === razorpaySignature;
}
