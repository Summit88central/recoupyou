# Paystack Webhook Setup

This document explains how to configure Paystack webhooks so that challenge registrations are saved correctly after payment.

---

## How it works

When a user pays, Paystack sends a `charge.success` event to your webhook URL. The webhook handler at `/api/challenge/webhook`:

1. Verifies the HMAC-SHA512 signature using your secret key
2. Checks for duplicate delivery (idempotency)
3. Verifies the payment via Paystack's API
4. Saves the registration to the database
**The registration is only saved via the webhook — never from the browser redirect.**

---

## Step 1 — Add the webhook URL in the Paystack dashboard

1. Log in to [dashboard.paystack.com](https://dashboard.paystack.com)
2. Go to **Settings → API Keys & Webhooks**
3. Under **Webhook URL**, enter:

   ```
   https://recoupyou.co.za/api/challenge/webhook
   ```

   For test mode, use your test-mode webhook setting and point it at your live or tunnelled URL.

4. Click **Save**

> **Important:** The URL must be publicly reachable. Paystack cannot deliver webhooks to `localhost`. Use a tunnelling tool (see below) for local testing.

---

## Step 2 — Secret key must match

The `PAYSTACK_SECRET_KEY` in your `.env.local` (and in Vercel's environment variables) **must be the same key** as the one in the Paystack dashboard for the environment you are using.

| Environment | Paystack key prefix | `.env.local` variable |
|-------------|--------------------|-----------------------|
| Test | `sk_test_...` | `PAYSTACK_SECRET_KEY` |
| Live | `sk_live_...` | `PAYSTACK_SECRET_KEY` |

The live keys are already commented out in `.env.local` — swap them in when going live:

```env
# Live keys (uncomment when ready)
PAYSTACK_SECRET_KEY=sk_live_d7c64564d9d2962983709874b98d648617b89d45
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_40991db5ef6e3f61a8e531db00378b2ea83b3b35
```

---

## Step 3 — Run the database migration

Run `scripts/007_challenge_promo_and_events.sql` in your **Supabase SQL editor** before going live. This migration:

- Creates the `promo_codes` table
- Creates the `payment_events` table (idempotency log)
- Creates the `reserve_promo_code()` and `preview_promo_code()` Postgres functions
- Adds `promo_code_used` and `status` columns to `challenge_registrations`

---

## Local testing with ngrok

To test the webhook locally:

```bash
# Install ngrok (once)
brew install ngrok

# Start your Next.js dev server
npm run dev

# In a second terminal, expose port 3000
ngrok http 3000
```

Copy the `https://xxxx.ngrok.io` URL and set it as your webhook URL in the Paystack test dashboard:

```
https://xxxx.ngrok.io/api/challenge/webhook
```

### Resending a webhook from the dashboard

After a test payment, go to **Paystack Dashboard → Transactions → [transaction] → Webhook Logs** and click **Resend** to re-deliver the event. This is the easiest way to verify your handler is working.

---

## Troubleshooting

### 401 Unauthorized (HMAC mismatch)

The server logs will print:

```
[webhook] HMAC mismatch. received_sig_prefix="abcd1234..." expected_sig_prefix="ef567890..."
```

This almost always means `PAYSTACK_SECRET_KEY` in your environment does not match the key in the Paystack dashboard. Double-check that you are using the correct test vs. live key, and that there are no extra spaces or newlines in the env variable.

### Registration not saved after payment

1. Check your Vercel function logs (or local console) for `[webhook]` log lines.
2. Confirm the webhook URL is registered in the Paystack dashboard.
3. Confirm migration `007` has been run in Supabase.
4. Use the Paystack dashboard **Resend** button to replay the webhook.

### Duplicate registrations

The `payment_events` table prevents this. If you see duplicates, check that the `payment_events` table exists and has the `UNIQUE` constraint on `paystack_reference` (created by migration `007`).
