const CHALLENGE_REFERRER_PATH = "/6-week-challenge";

type PaystackCustomer = {
  email?: string | null;
};

type PaystackTransaction = {
  status?: string | null;
  reference?: string | null;
  amount?: number | null;
  currency?: string | null;
  paid_at?: string | null;
  metadata?: {
    referrer?: string | null;
  } | null;
  customer?: PaystackCustomer | null;
};

type PaystackVerifyResponse = {
  status: boolean;
  message?: string;
  data?: PaystackTransaction;
};

export type VerifiedChallengePayment = {
  reference: string;
  amount: number;
  email: string | null;
  paidAt: string | null;
};

function getPaystackSecretKey(): string {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    throw new Error("PAYSTACK_SECRET_KEY is missing.");
  }

  return secretKey;
}

export function isChallengePaymentReferrer(referrer: string | null | undefined) {
  return typeof referrer === "string" && referrer.includes(CHALLENGE_REFERRER_PATH);
}

export async function verifyChallengePayment(
  reference: string
): Promise<VerifiedChallengePayment> {
  const trimmedReference = reference.trim();
  if (!trimmedReference) {
    throw new Error("Payment reference is required.");
  }

  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(
      trimmedReference
    )}`,
    {
      headers: {
        Authorization: `Bearer ${getPaystackSecretKey()}`,
        "Cache-Control": "no-cache",
      },
      cache: "no-store",
    }
  );

  const payload = (await response.json().catch(() => null)) as
    | PaystackVerifyResponse
    | null;

  if (!response.ok || !payload?.status || !payload.data) {
    throw new Error(payload?.message || "Unable to verify payment reference.");
  }

  const transaction = payload.data;
  const amount = typeof transaction.amount === "number" ? transaction.amount / 100 : NaN;

  if (
    transaction.status !== "success" ||
    transaction.currency !== "ZAR" ||
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    throw new Error("Payment reference is not a successful challenge payment.");
  }

  if (!isChallengePaymentReferrer(transaction.metadata?.referrer)) {
    throw new Error("Payment reference does not belong to the challenge form.");
  }

  return {
    reference: trimmedReference,
    amount,
    email: transaction.customer?.email?.trim().toLowerCase() || null,
    paidAt: transaction.paid_at || null,
  };
}
