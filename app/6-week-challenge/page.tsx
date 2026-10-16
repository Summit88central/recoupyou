"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CalendarDays,
  Clock3,
  Loader2,
  MapPin,
  ShieldCheck,
  Tag,
  Users,
  X,
} from "lucide-react";
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
  CHALLENGE_REGISTRATION,
  DIETARY_LABELS,
  DIETARY_OPTIONS,
  GOAL_LABELS,
  GOAL_OPTIONS,
  PAYMENT_OPTION_LABELS,
  getBaseChallengeAmount,
  type ChallengeActivityLevel,
  type ChallengeDietaryPreference,
  type ChallengeGoal,
  type ChallengePaymentOption,
} from "@/lib/challenge";

// ─── Types ────────────────────────────────────────────────────────────────────

type ChallengeStatus = {
  maxParticipants: number;
  participantsSignedUp: number;
  spotsRemaining: number;
  isSoldOut: boolean;
  isRegistrationOpen: boolean;
  closedMessage: string | null;
  earlyBirdLabel: string;
  earlyBirdPercent: number;
  earlyBirdMaxUses: number;
  earlyBirdUses: number;
  earlyBirdRemaining: number;
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
  termsAccepted: boolean;
  liabilityAccepted: boolean;
  agreementSignature: string;
  agreementDate: string;
};


// ─── Helpers ──────────────────────────────────────────────────────────────────

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
  termsAccepted: false,
  liabilityAccepted: false,
  agreementSignature: "",
  agreementDate: today,
};

const challengeHighlightItems = [
  {
    icon: CalendarDays,
    label: "Starting date",
    value: CHALLENGE_CONFIG.kickoff.startDate,
  },
  {
    icon: Clock3,
    label: "Time",
    value: CHALLENGE_CONFIG.kickoff.time,
  },
  {
    icon: MapPin,
    label: "Location",
    value: CHALLENGE_CONFIG.kickoff.location,
  },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export default function SixWeekChallengePage() {
  const [formData, setFormData] = useState<ChallengeFormState>(initialFormState);
  const [status, setStatus] = useState<ChallengeStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSubmitted, setRegistrationSubmitted] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // ── Parse JSON response safely ─────────────────────────────────────────────
  async function parseJsonResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get("content-type") || "";
    const body = await response.text();
    if (!contentType.includes("application/json")) {
      throw new Error(
        `Invalid response from ${response.url}. Status ${response.status}: ${body.slice(0, 180)}`
      );
    }
    try {
      return JSON.parse(body) as T;
    } catch {
      throw new Error(
        `Invalid JSON from ${response.url}. Status ${response.status}: ${body.slice(0, 180)}`
      );
    }
  }

  // ── Load challenge status ──────────────────────────────────────────────────
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
      setStatusError(
        error instanceof Error ? error.message : "Unable to load challenge availability."
      );
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    void loadStatus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Form field updater ─────────────────────────────────────────────────────
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

  // ── Derived values ─────────────────────────────────────────────────────────
  const ageNumber = Number(formData.age);
  const baseAmount = getBaseChallengeAmount(formData.paymentOption);
  // Early bird discount is automatic — applied server-side when spots remain.
  // Show it on the frontend only when the API confirms slots are available.
  const earlyBirdRemaining = status?.earlyBirdRemaining ?? 0;
  const earlyBirdPercent = status?.earlyBirdPercent ?? CHALLENGE_CONFIG.discount.percent;
  const earlyBirdActive = earlyBirdRemaining > 0;
  const discountPercent = earlyBirdActive ? earlyBirdPercent : 0;
  const discountAmount = discountPercent
    ? Math.round(baseAmount * (discountPercent / 100))
    : 0;
  const finalAmount = baseAmount - discountAmount;

  const spotsRemaining = status?.spotsRemaining ?? CHALLENGE_CONFIG.maxParticipants;
  const isRegistrationOpen =
    status?.isRegistrationOpen ?? CHALLENGE_REGISTRATION.isOpen;
  const isSoldOut = status?.isSoldOut ?? false;
  const registrationClosedMessage =
    status?.closedMessage ?? CHALLENGE_REGISTRATION.closedMessage;

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

  // ── Handle registration submission ────────────────────────────────────────
  const handleSubmit = async () => {
    if (!isFormValid()) {
      toast.error("Please complete all required fields before continuing.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        fullName: formData.fullName.trim(),
        whatsappNumber: formData.whatsappNumber.trim(),
        email: formData.email.trim().toLowerCase(),
        age: ageNumber,
        paymentOption: formData.paymentOption,
        emergencyContactName: formData.emergencyContactName.trim(),
        emergencyContactNumber: formData.emergencyContactNumber.trim(),
        challengeGoal: formData.challengeGoal,
        dietaryPreferences: formData.dietaryPreferences,
        foodsDisliked: formData.foodsDisliked,
        medicalConditions: formData.medicalConditions,
        activityLevel: formData.activityLevel,
        alcoholFrequency: formData.alcoholFrequency.trim(),
        instagramHandle: formData.instagramHandle,
        termsAccepted: formData.termsAccepted,
        liabilityAccepted: formData.liabilityAccepted,
        agreementSignature: formData.agreementSignature.trim(),
        agreementDate: formData.agreementDate,
        promoCode: null,
      };

      const response = await fetch("/api/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await parseJsonResponse<{
        submitted?: boolean;
        reference?: string;
        error?: string;
      }>(response);

      if (!response.ok || !result.submitted) {
        throw new Error(result.error || "Failed to submit your application. Please try again.");
      }

      setRegistrationSubmitted(true);
      setShowPaymentModal(true);
      toast.success("Your application has been submitted.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong. Please try again.";
      toast.error(message);
      setIsSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-white pt-20">

      {/* Payment details modal — auto-opens after form submission */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowPaymentModal(false)}
          />
          {/* Modal card */}
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 z-10">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">💳</div>
              <h2 className="text-lg font-bold text-gray-900">Payment Details</h2>
              <p className="text-sm text-gray-500 mt-1">
                Please complete your EFT payment to secure your spot.
              </p>
            </div>
            <div className="rounded-lg border border-[#fc9dca]/40 bg-[#fff0f8] p-4 space-y-1 text-sm text-gray-700">
              <p><span className="font-medium">Payment method:</span> EFT</p>
              <p><span className="font-medium">Bank:</span> FNB</p>
              <p><span className="font-medium">Account type:</span> Cheque account</p>
              <p><span className="font-medium">Account number:</span> 63131752643</p>
              <p><span className="font-medium">Account holder:</span> RecoupYou</p>
              <p className="text-xs text-gray-500 pt-2">
                Please use your <span className="font-semibold text-gray-700">full name</span> as the payment reference. All payments are non-refundable.
              </p>
              <div className="pt-2 border-t border-[#fc9dca]/20 text-xs text-gray-700">
                <p>
                  Please send proof of payment to this number:{" "}
                  <span className="font-semibold text-gray-900">+27 72 581 7797</span>
                </p>
              </div>
            </div>
            {/* WhatsApp proof of payment */}
            <a
              href="https://wa.me/27725817797"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 mt-4 w-full rounded-lg bg-[#25D366] hover:bg-[#1ebe5d] text-white text-sm font-medium py-2.5 px-4 transition-colors shadow-sm"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white shrink-0" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.115.554 4.1 1.524 5.823L.057 23.428a.75.75 0 0 0 .915.915l5.605-1.467A11.942 11.942 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.726 9.726 0 0 1-4.953-1.355l-.355-.21-3.328.871.887-3.24-.23-.374A9.718 9.718 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
              </svg>
              <span>Send proof of payment: +27 72 581 7797</span>
            </a>
            <Button
              onClick={() => setShowPaymentModal(false)}
              className="w-full mt-4 bg-[#fc9dca] hover:bg-[#fc9dca]/90 text-white"
            >
              Got it!
            </Button>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <Badge className="mb-4 bg-[#fc9dca]/10 text-[#fc9dca] border-[#fc9dca]/20">
            {isRegistrationOpen
              ? `Limited to ${CHALLENGE_CONFIG.maxParticipants} Participants`
              : "Registration Closed"}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            {CHALLENGE_CONFIG.title}
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            {isRegistrationOpen
              ? "Complete your form, review and sign the terms, then pay securely to lock your place."
              : registrationClosedMessage}
          </p>
        </div>

        {/* Challenge highlight bar */}
        <div className="mb-8">
          <div className="mx-auto max-w-5xl rounded-[32px] border border-[#fc9dca]/20 bg-white/90 px-4 py-3 shadow-[0_16px_40px_rgba(17,24,39,0.12)] backdrop-blur-xl sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4">
              {challengeHighlightItems.map(({ icon: Icon, label, value }, index) => (
                <div
                  key={label}
                  className={`flex items-start gap-3 ${
                    index > 0 ? "sm:border-l sm:border-gray-200 sm:pl-4" : ""
                  }`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fc9dca]/12">
                    <Icon className="h-4 w-4 text-[#fc9dca]" />
                  </span>
                  <div className="text-left">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                      {label}
                    </p>
                    <p className="text-sm font-semibold leading-snug text-gray-900">
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* ── Form card ─────────────────────────────────────────────────── */}
          <Card className="border-gray-200 shadow-md">
            <CardHeader>
              <CardTitle className="text-gray-900">Challenge Form</CardTitle>
              <CardDescription>
                Fill in your details exactly as requested for registration and payment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">

              {/* Personal Information */}
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
                      onChange={(e) => updateField("whatsappNumber", e.target.value)}
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

              {/* Payment Option */}
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
                  {(Object.keys(PAYMENT_OPTION_LABELS) as ChallengePaymentOption[]).map(
                    (option) => (
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
                              Challenge fee only. Membership fee continues as usual.
                            </p>
                          ) : (
                            <p className="text-sm text-gray-500 mt-1">
                              Challenge fee only. Gym access only on challenge training
                              days and times.
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </RadioGroup>
              </section>

              {/* Emergency Contact */}
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

              {/* Nutrition */}
              <section className="space-y-4">
                <h2 className="text-lg font-semibold text-[#fc9dca]">Nutrition</h2>
                <div className="rounded-md border border-[#fc9dca]/30 bg-[#fc9dca]/5 p-3 text-sm text-gray-700">
                  Challenge Goal — NOTE: Results take time, consistency and commitment. We do not promise specific results within one month, as every woman’s body and progress are different. Our approach is to take things one step at a time, focusing on building sustainable habits and making progress month by month. The goal is to help you stay consistent, trust the process and keep working towards your goals. Remember, this is a journey, not a quick fix.
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
                    onChange={(e) => updateField("medicalConditions", e.target.value)}
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

              {/* Terms, Conditions and Signature */}
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
                      I have read and agree to the full 4 weeks coaching terms and
                      conditions.
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
                      I understand training carries risk and I accept the liability and
                      indemnity terms stated above.
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

          {/* ── Sidebar — Spots, Promo & Payment ──────────────────────────── */}
          <div className="space-y-6">
            <Card className="border-gray-200 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#fc9dca]" />
                  Spots and Payment
                </CardTitle>
                <CardDescription>Submit your form, then pay by bank transfer.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">

                {/* Kickoff details */}
                <div className="rounded-2xl border border-[#fc9dca]/20 bg-[#fc9dca]/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#fc9dca]">
                    Kickoff details
                  </p>
                  <div className="mt-3 space-y-3">
                    {challengeHighlightItems.map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-start gap-3 text-sm text-gray-700">
                        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#fc9dca]" />
                        <div>
                          <p className="font-medium text-gray-900">{label}</p>
                          <p>{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Availability */}
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
                    {isSoldOut && (
                      <p className="text-sm font-medium text-red-600">
                        {registrationClosedMessage ||
                          "This challenge is currently unavailable."}
                      </p>
                    )}
                  </div>
                )}

                <Separator />

                {/* Early bird discount banner */}
                {!isLoadingStatus && !statusError && (
                  earlyBirdActive ? (
                    <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2">
                      <Tag className="h-4 w-4 text-green-600 shrink-0" />
                      <p className="text-sm font-medium text-green-800">
                        🎉 Early bird — {earlyBirdPercent}% off automatically applied!{" "}
                        <span className="font-normal text-green-700">
                          ({earlyBirdRemaining} of {status?.earlyBirdMaxUses} spots left)
                        </span>
                      </p>
                    </div>
                  ) : (
                    CHALLENGE_CONFIG.discount.maxUses > 0 && (
                      <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
                        <Tag className="h-4 w-4 text-gray-400 shrink-0" />
                        <p className="text-sm text-gray-500">
                          Early bird discount has been claimed.
                        </p>
                      </div>
                    )
                  )
                )}

                <Separator />

                {/* Pricing breakdown */}
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-center justify-between">
                    <span>Base price</span>
                    <span>{formatPrice(baseAmount)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex items-center justify-between text-green-700">
                      <span>
                        Early bird discount ({discountPercent}%)
                      </span>
                      <span>- {formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-base font-semibold text-gray-900 border-t border-gray-100 pt-2 mt-1">
                    <span>Total due</span>
                    <span>{formatPrice(finalAmount)}</span>
                  </div>
                </div>

                <div className="rounded-md border border-[#fc9dca]/20 bg-[#fc9dca]/5 p-3 text-xs text-gray-700">
                  Members pay the challenge fee only and keep normal membership
                  billing. Non-members pay for challenge access only on scheduled
                  challenge training days and times.
                </div>

                {registrationSubmitted && (
                  <div className="space-y-3">
                    <div className="space-y-2 rounded-md border border-[#fc9dca]/30 bg-[#fc9dca]/5 p-4 text-sm text-gray-800">
                      <p className="font-semibold">💳 Payment method: EFT</p>
                      <p>Bank: FNB</p>
                      <p>Account type: Cheque account</p>
                      <p>Account number: 63131752643</p>
                      <p>Account holder: RecoupYou</p>
                      <p className="pt-1 font-medium">Please use your full name as the payment reference. All payments are non-refundable.</p>
                      <p className="pt-1 text-xs text-gray-700">Please send proof of payment to this number: <span className="font-semibold text-gray-900">+27 72 581 7797</span></p>
                    </div>
                    <a
                      href="https://wa.me/27725817797"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full rounded-md bg-[#25D366] hover:bg-[#1ebe5d] text-white text-sm font-medium py-2.5 px-4 transition-colors shadow-sm"
                    >
                      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white shrink-0" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.115.554 4.1 1.524 5.823L.057 23.428a.75.75 0 0 0 .915.915l5.605-1.467A11.942 11.942 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.726 9.726 0 0 1-4.953-1.355l-.355-.21-3.328.871.887-3.24-.23-.374A9.718 9.718 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
                      </svg>
                      <span>Send proof of payment: +27 72 581 7797</span>
                    </a>
                    <Button
                      variant="outline"
                      className="w-full border-[#fc9dca] text-[#fc9dca] hover:bg-[#fc9dca] hover:text-white bg-transparent"
                      onClick={() => setShowPaymentModal(true)}
                    >
                      View Payment Details
                    </Button>
                  </div>
                )}

                {/* Submit form */}
                <Button
                id="challenge-registration-submit"
                  className="w-full bg-[#fc9dca] hover:bg-rose-400 text-white"
                  onClick={() => void handleSubmit()}
                  disabled={
                    isSubmitting || registrationSubmitted ||
                    isSoldOut ||
                    !isRegistrationOpen ||
                    isLoadingStatus ||
                    !!statusError ||
                    !isFormValid()
                  }
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting your form...
                    </>
                  ) : registrationSubmitted ? (
                    "Form Submitted"
                  ) : isSoldOut ? (
                    isRegistrationOpen ? "Sold Out" : "Registration Closed"
                  ) : !isRegistrationOpen ? (
                    "Registration Closed"
                  ) : !isFormValid() ? (
                    "Complete Required Fields to Continue"
                  ) : (
                    "Submit Form →"
                  )}
                </Button>

                <div className="flex items-start gap-2 rounded-md border border-gray-200 p-3 text-xs text-gray-600">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#fc9dca]" />
                  <p>
                    Submit your completed form first. Bank transfer details will appear here; your place is confirmed once payment is received.
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
