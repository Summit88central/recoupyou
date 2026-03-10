"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Loader2, ShieldCheck, Users } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  ACTIVITY_LABELS,
  ACTIVITY_OPTIONS,
  CHALLENGE_CONFIG,
  CHALLENGE_FULL_TERMS_TEXT,
  DIETARY_LABELS,
  DIETARY_OPTIONS,
  GOAL_LABELS,
  GOAL_OPTIONS,
  PAYMENT_OPTION_LABELS,
  getBaseChallengeAmount,
  getDiscountedAmount,
  getDiscountValue,
  normalizePromoCode,
  type ChallengeActivityLevel,
  type ChallengeDietaryPreference,
  type ChallengeGoal,
  type ChallengePaymentOption,
} from "@/lib/challenge";

const PaystackButton = dynamic(
  () => import("react-paystack").then((mod) => mod.PaystackButton),
  { ssr: false }
);

type ChallengeStatus = {
  maxParticipants: number;
  participantsSignedUp: number;
  spotsRemaining: number;
  isSoldOut: boolean;
  discountCode: string;
  discountMaxUses: number;
  discountUses: number;
  discountRemaining: number;
};

type ChallengeFormState = {
  fullName: string;
  whatsappNumber: string;
  email: string;
  age: string;
  paymentOption: ChallengePaymentOption;
  emergencyContactName: string;
  emergencyContactNumber: string;
  challengeGoal: ChallengeGoal;
  dietaryPreferences: ChallengeDietaryPreference[];
  foodsDisliked: string;
  medicalConditions: string;
  activityLevel: ChallengeActivityLevel;
  alcoholFrequency: string;
  instagramHandle: string;
  promoCode: string;
  termsAccepted: boolean;
  liabilityAccepted: boolean;
  agreementSignature: string;
  agreementDate: string;
};

const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
  }).format(value);

const today = new Date().toISOString().split("T")[0];

const initialFormState: ChallengeFormState = {
  fullName: "",
  whatsappNumber: "",
  email: "",
  age: "",
  paymentOption: "member",
  emergencyContactName: "",
  emergencyContactNumber: "",
  challengeGoal: "lose_body_fat",
  dietaryPreferences: [],
  foodsDisliked: "",
  medicalConditions: "",
  activityLevel: "sedentary",
  alcoholFrequency: "",
  instagramHandle: "",
  promoCode: "",
  termsAccepted: false,
  liabilityAccepted: false,
  agreementSignature: "",
  agreementDate: today,
};

export default function SixWeekChallengePage() {
  const [formData, setFormData] = useState<ChallengeFormState>(initialFormState);
  const [status, setStatus] = useState<ChallengeStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [registeredReference, setRegisteredReference] = useState("");

  useEffect(() => {
    setIsClient(true);
  }, []);

  const parseJsonResponse = async <T>(response: Response): Promise<T> => {
    const contentType = response.headers.get("content-type") || "";
    const body = await response.text();

    if (!contentType.includes("application/json")) {
      throw new Error(
        `Invalid response from ${response.url}. Status ${response.status}: ${body.slice(
          0,
          180
        )}`
      );
    }

    try {
      return JSON.parse(body) as T;
    } catch (error) {
      throw new Error(
        `Invalid JSON from ${response.url}. Status ${response.status}: ${body.slice(
          0,
          180
        )}`
      );
    }
  };

  const loadStatus = async () => {
    setIsLoadingStatus(true);
    setStatusError(null);
    try {
      const response = await fetch("/api/challenge");
      const payload = await parseJsonResponse<{
        status: ChallengeStatus;
        error?: string;
      }>(response);
      if (!response.ok) {
        throw new Error(payload.error || "Unable to load challenge availability.");
      }
      setStatus(payload.status);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to load challenge availability.";
      setStatusError(message);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    void loadStatus();
  }, []);

  const updateField = <K extends keyof ChallengeFormState>(
    field: K,
    value: ChallengeFormState[K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "fullName" && !prev.agreementSignature
        ? { agreementSignature: String(value) }
        : {}),
    }));
  };

  const toggleDietaryPreference = (
    preference: ChallengeDietaryPreference,
    checked: boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      dietaryPreferences: checked
        ? [...prev.dietaryPreferences, preference]
        : prev.dietaryPreferences.filter((item) => item !== preference),
    }));
  };

  const ageNumber = Number(formData.age);
  const baseAmount = getBaseChallengeAmount(formData.paymentOption);
  const normalizedPromoCode = normalizePromoCode(formData.promoCode);
  const promoMatches = normalizedPromoCode === CHALLENGE_CONFIG.discount.code;
  const discountRemaining =
    status?.discountRemaining ?? CHALLENGE_CONFIG.discount.maxUses;
  const discountCanBeApplied = promoMatches && discountRemaining > 0;
  const discountedAmount = getDiscountedAmount(baseAmount);
  const discountValue = getDiscountValue(baseAmount);
  const finalAmount = discountCanBeApplied ? discountedAmount : baseAmount;
  const spotsRemaining = status?.spotsRemaining ?? CHALLENGE_CONFIG.maxParticipants;
  const isSoldOut = status?.isSoldOut ?? false;
  const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "";

  const isEmailValid = useMemo(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(formData.email.trim());
  }, [formData.email]);

  const isFormValid = () => {
    if (
      !formData.fullName.trim() ||
      !formData.whatsappNumber.trim() ||
      !isEmailValid ||
      !formData.age.trim() ||
      !Number.isFinite(ageNumber) ||
      ageNumber < 16 ||
      ageNumber > 100 ||
      !formData.emergencyContactName.trim() ||
      !formData.emergencyContactNumber.trim() ||
      !formData.alcoholFrequency.trim() ||
      !formData.agreementSignature.trim() ||
      !formData.termsAccepted ||
      !formData.liabilityAccepted
    ) {
      return false;
    }

    return true;
  };

  const handlePaymentSuccess = async (reference: { reference: string }) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        age: ageNumber,
        paymentReference: reference.reference,
        amountPaid: finalAmount,
        promoCode: normalizedPromoCode || "",
      };

      const response = await fetch("/api/challenge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await parseJsonResponse<{
        status: ChallengeStatus;
        error?: string;
        discountApplied?: boolean;
      }>(response);

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Payment completed, but registration could not be finalized."
        );
      }

      setRegisteredReference(reference.reference);
      setIsSubmitted(true);
      setFormData(initialFormState);
      setStatus(result.status);
      toast.success("Challenge registration completed successfully.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Registration failed after payment. Please contact support with your payment reference.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentClose = () => {
    toast.info("Payment window closed.");
  };

  const paystackConfig = {
    reference: `challenge_${Date.now()}`,
    email: formData.email.trim(),
    amount: Math.round(finalAmount * 100),
    currency: "ZAR",
    publicKey: paystackKey,
    text: "Pay and Register",
    onSuccess: handlePaymentSuccess,
    onClose: handlePaymentClose,
  };

  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <Card className="border-[#fc9dca]/30 shadow-md">
            <CardContent className="p-8 text-center space-y-4">
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
              <h1 className="text-3xl font-bold text-gray-900">You Are In</h1>
              <p className="text-gray-600">
                Your payment and challenge application were received successfully.
              </p>
              <p className="text-sm text-gray-500">
                Payment reference:{" "}
                <span className="font-semibold text-gray-700">
                  {registeredReference}
                </span>
              </p>
              <div className="pt-3">
                <Link href="/">
                  <Button
                    variant="outline"
                    className="border-[#fc9dca] text-[#fc9dca] hover:bg-[#fc9dca] hover:text-white"
                  >
                    Back to Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white pt-20">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 text-center">
          <Badge className="mb-4 bg-[#fc9dca]/10 text-[#fc9dca] border-[#fc9dca]/20">
            Limited to 10 Participants
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            {CHALLENGE_CONFIG.title}
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Complete your form, review and sign the terms, then pay securely to
            lock your place.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="border-gray-200 shadow-md">
            <CardHeader>
              <CardTitle className="text-gray-900">Challenge Form</CardTitle>
              <CardDescription>
                Fill in your details exactly as requested for registration and
                payment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <section className="space-y-4">
                <h2 className="text-lg font-semibold text-[#fc9dca]">
                  Personal Information
                </h2>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full names *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    placeholder="Enter your full names"
                    required
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp number *</Label>
                    <Input
                      id="whatsapp"
                      value={formData.whatsappNumber}
                      onChange={(e) =>
                        updateField("whatsappNumber", e.target.value)
                      }
                      placeholder="Enter your WhatsApp number"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="Enter your email address"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    min={16}
                    max={100}
                    value={formData.age}
                    onChange={(e) => updateField("age", e.target.value)}
                    required
                  />
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-lg font-semibold text-[#fc9dca]">
                  Payment Option
                </h2>
                <RadioGroup
                  value={formData.paymentOption}
                  onValueChange={(value) =>
                    updateField("paymentOption", value as ChallengePaymentOption)
                  }
                >
                  {(
                    Object.keys(PAYMENT_OPTION_LABELS) as ChallengePaymentOption[]
                  ).map((option) => (
                    <div
                      key={option}
                      className="flex items-start gap-3 rounded-md border border-gray-200 p-3"
                    >
                      <RadioGroupItem value={option} id={`payment-${option}`} />
                      <div>
                        <Label
                          htmlFor={`payment-${option}`}
                          className="font-medium cursor-pointer"
                        >
                          {PAYMENT_OPTION_LABELS[option]}
                        </Label>
                        {option === "member" ? (
                          <p className="text-sm text-gray-500 mt-1">
                            Challenge fee only. Membership fee continues as
                            usual.
                          </p>
                        ) : (
                          <p className="text-sm text-gray-500 mt-1">
                            Challenge fee only. Gym access only on challenge
                            training days and times.
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </section>

              <section className="space-y-4">
                <h2 className="text-lg font-semibold text-[#fc9dca]">
                  Emergency Contact
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactName">
                      Emergency contact name *
                    </Label>
                    <Input
                      id="emergencyContactName"
                      value={formData.emergencyContactName}
                      onChange={(e) =>
                        updateField("emergencyContactName", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactNumber">
                      Emergency contact number *
                    </Label>
                    <Input
                      id="emergencyContactNumber"
                      value={formData.emergencyContactNumber}
                      onChange={(e) =>
                        updateField("emergencyContactNumber", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-lg font-semibold text-[#fc9dca]">Nutrition</h2>
                <div className="rounded-md border border-[#fc9dca]/30 bg-[#fc9dca]/5 p-3 text-sm text-gray-700">
                  Challenge Goal - NOTE: It is extremely hard to build muscle and
                  lose body fat at the same time, especially over a 6 week period.
                  If you select build muscle, the overall focus is to gain muscle
                  and not lose fat, and if you select lose fat, the goal is to
                  drop body fat and maintain your muscle. Please only select one
                  goal for the challenge.
                </div>
                <div className="space-y-2">
                  <Label>Challenge goal *</Label>
                  <RadioGroup
                    value={formData.challengeGoal}
                    onValueChange={(value) =>
                      updateField("challengeGoal", value as ChallengeGoal)
                    }
                  >
                    {GOAL_OPTIONS.map((goal) => (
                      <div key={goal} className="flex items-center gap-3">
                        <RadioGroupItem value={goal} id={`goal-${goal}`} />
                        <Label htmlFor={`goal-${goal}`} className="cursor-pointer">
                          {GOAL_LABELS[goal]}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                <div className="space-y-2">
                  <Label>Do any of the following apply to you?</Label>
                  <div className="space-y-2">
                    {DIETARY_OPTIONS.map((option) => (
                      <div key={option} className="flex items-center gap-3">
                        <Checkbox
                          id={`diet-${option}`}
                          checked={formData.dietaryPreferences.includes(option)}
                          onCheckedChange={(checked) =>
                            toggleDietaryPreference(option, checked === true)
                          }
                        />
                        <Label htmlFor={`diet-${option}`} className="cursor-pointer">
                          {DIETARY_LABELS[option]}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="foodsDisliked">
                    Specific foods you dislike or will not eat
                  </Label>
                  <Textarea
                    id="foodsDisliked"
                    value={formData.foodsDisliked}
                    onChange={(e) => updateField("foodsDisliked", e.target.value)}
                    placeholder="List foods you avoid"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medicalConditions">
                    Medical conditions, surgeries/injuries, PCOS, etc.
                  </Label>
                  <Textarea
                    id="medicalConditions"
                    value={formData.medicalConditions}
                    onChange={(e) =>
                      updateField("medicalConditions", e.target.value)
                    }
                    placeholder="Share anything relevant for training safety"
                  />
                </div>
                <div className="space-y-2">
                  <Label>How active is your lifestyle? *</Label>
                  <RadioGroup
                    value={formData.activityLevel}
                    onValueChange={(value) =>
                      updateField("activityLevel", value as ChallengeActivityLevel)
                    }
                  >
                    {ACTIVITY_OPTIONS.map((option) => (
                      <div key={option} className="flex items-center gap-3">
                        <RadioGroupItem
                          value={option}
                          id={`activity-${option}`}
                        />
                        <Label
                          htmlFor={`activity-${option}`}
                          className="cursor-pointer"
                        >
                          {ACTIVITY_LABELS[option]}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="alcoholFrequency">
                      Do you drink alcohol? If yes, how often? *
                    </Label>
                    <Input
                      id="alcoholFrequency"
                      value={formData.alcoholFrequency}
                      onChange={(e) =>
                        updateField("alcoholFrequency", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagramHandle">
                      Instagram name (if any)
                    </Label>
                    <Input
                      id="instagramHandle"
                      value={formData.instagramHandle}
                      onChange={(e) =>
                        updateField("instagramHandle", e.target.value)
                      }
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-lg font-semibold text-[#fc9dca]">
                  Terms, Conditions and Signature
                </h2>
                <div className="max-h-[360px] space-y-5 overflow-y-auto rounded-md border border-gray-200 p-4 text-sm text-gray-700">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-6 text-gray-700">
                    {CHALLENGE_FULL_TERMS_TEXT}
                  </pre>
                </div>

                <div className="space-y-3 rounded-md border border-gray-200 p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="termsAccepted"
                      checked={formData.termsAccepted}
                      onCheckedChange={(checked) =>
                        updateField("termsAccepted", checked === true)
                      }
                    />
                    <Label htmlFor="termsAccepted" className="cursor-pointer">
                      I have read and agree to the full 6-week challenge terms
                      and conditions.
                    </Label>
                  </div>
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="liabilityAccepted"
                      checked={formData.liabilityAccepted}
                      onCheckedChange={(checked) =>
                        updateField("liabilityAccepted", checked === true)
                      }
                    />
                    <Label htmlFor="liabilityAccepted" className="cursor-pointer">
                      I understand training carries risk and I accept the
                      liability and indemnity terms stated above.
                    </Label>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="agreementSignature">Signature name *</Label>
                      <Input
                        id="agreementSignature"
                        value={formData.agreementSignature}
                        onChange={(e) =>
                          updateField("agreementSignature", e.target.value)
                        }
                        placeholder="Type your full name as signature"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="agreementDate">Date *</Label>
                      <Input
                        id="agreementDate"
                        type="date"
                        value={formData.agreementDate}
                        onChange={(e) =>
                          updateField("agreementDate", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>
                </div>
              </section>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-gray-200 shadow-md lg:sticky lg:top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#fc9dca]" />
                  Spots and Payment
                </CardTitle>
                <CardDescription>
                  Complete payment to secure your challenge spot.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingStatus ? (
                  <p className="text-sm text-gray-500">Loading availability...</p>
                ) : statusError ? (
                  <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {statusError}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700">
                      Spots remaining:{" "}
                      <span className="font-semibold text-gray-900">
                        {spotsRemaining} / {CHALLENGE_CONFIG.maxParticipants}
                      </span>
                    </p>
                    <p className="text-sm text-gray-700">
                      Discount: 20% (limited to first 5)
                    </p>
                    {isSoldOut && (
                      <p className="text-sm font-medium text-red-600">
                        This challenge is currently sold out.
                      </p>
                    )}
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="promoCode">20% (limited to first 5)</Label>
                  <Input
                    id="promoCode"
                    value={formData.promoCode}
                    onChange={(e) => updateField("promoCode", e.target.value)}
                    placeholder={`Use ${CHALLENGE_CONFIG.discount.code}`}
                  />
                  {formData.promoCode && (
                    <p
                      className={`text-sm ${
                        discountCanBeApplied ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {discountCanBeApplied
                        ? `Discount active: -${formatPrice(discountValue)} (${CHALLENGE_CONFIG.discount.percent}% off)`
                        : "Discount code is invalid or no discount spots remain."}
                    </p>
                  )}
                </div>

                <Separator />

                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-center justify-between">
                    <span>Base price</span>
                    <span>{formatPrice(baseAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Discount</span>
                    <span className="text-green-600">
                      {discountCanBeApplied
                        ? `- ${formatPrice(discountValue)}`
                        : formatPrice(0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-base font-semibold text-gray-900">
                    <span>Total due</span>
                    <span>{formatPrice(finalAmount)}</span>
                  </div>
                </div>

                <div className="rounded-md border border-[#fc9dca]/20 bg-[#fc9dca]/5 p-3 text-xs text-gray-700">
                  Members pay the challenge fee only and keep normal membership
                  billing. Non-members pay for challenge access only on scheduled
                  challenge training days and times.
                </div>

                {!paystackKey && (
                  <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    Paystack public key is missing. Add{" "}
                    <code>NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY</code> to enable
                    payment.
                  </div>
                )}

                <div>
                  {isClient &&
                  !isSoldOut &&
                  !isLoadingStatus &&
                  !statusError &&
                  isFormValid() &&
                  !!paystackKey ? (
                    <PaystackButton
                      {...paystackConfig}
                      className="w-full rounded-md bg-[#fc9dca] px-4 py-3 text-sm font-medium text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={isSubmitting}
                      text={isSubmitting ? "Finalizing..." : "Pay and Register"}
                    />
                  ) : (
                    <Button
                      className="w-full bg-[#fc9dca] hover:bg-rose-400"
                      disabled
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Finalizing...
                        </>
                      ) : isSoldOut ? (
                        "Sold Out"
                      ) : (
                        "Complete Required Fields to Continue"
                      )}
                    </Button>
                  )}
                </div>

                <div className="flex items-start gap-2 rounded-md border border-gray-200 p-3 text-xs text-gray-600">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#fc9dca]" />
                  <p>
                    Payment and registration are linked by payment reference for
                    verification.
                  </p>
                </div>
              </CardContent>
            </Card>

            {statusError && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>
                    Availability status could not be loaded. Ensure the challenge
                    registration table is created, then refresh this page.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
