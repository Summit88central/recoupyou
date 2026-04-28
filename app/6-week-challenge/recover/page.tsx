"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
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
  type ChallengeActivityLevel,
  type ChallengeDietaryPreference,
  type ChallengeGoal,
  type ChallengePaymentOption,
} from "@/lib/challenge";

type ChallengeStatus = {
  maxParticipants: number;
  participantsSignedUp: number;
  spotsRemaining: number;
  isSoldOut: boolean;
  isRegistrationOpen: boolean;
  closedMessage: string | null;
  discountLabel: string;
  discountMaxUses: number;
  discountUses: number;
  discountRemaining: number;
};

type ChallengeFormState = {
  paymentReference: string;
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

const today = new Date().toISOString().split("T")[0];

const initialFormState: ChallengeFormState = {
  paymentReference: "",
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

export default function RecoverChallengeRegistrationPage() {
  const [formData, setFormData] = useState<ChallengeFormState>(initialFormState);
  const [isReferenceLocked, setIsReferenceLocked] = useState(false);
  const isPaymentOptionLocked = true;
  const [status, setStatus] = useState<ChallengeStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [registeredReference, setRegisteredReference] = useState("");
  const [recoveredStatus, setRecoveredStatus] = useState<
    "idle" | "processing" | "paid" | "waitlist"
  >("idle");

  useEffect(() => {
    const loadStatus = async () => {
      setIsLoadingStatus(true);
      setStatusError(null);

      try {
        const response = await fetch("/api/challenge");
        const payload = await response.json();
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

    void loadStatus();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference")?.trim();
    const email = params.get("email")?.trim();
    const paymentOptionParam = params.get("paymentOption")?.trim().toLowerCase();

    if (reference || email) {
      setFormData((prev) => ({
        ...prev,
        ...(reference ? { paymentReference: reference } : {}),
        ...(email ? { email } : {}),
        ...((paymentOptionParam === "member" ||
        paymentOptionParam === "non_member")
          ? { paymentOption: paymentOptionParam }
          : { paymentOption: "member" }),
      }));
    }

    if (reference) {
      setIsReferenceLocked(true);
    }
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
      !formData.paymentReference.trim() ||
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isFormValid()) {
      toast.error("Please complete all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        age: ageNumber,
        paymentReference: formData.paymentReference.trim(),
      };

      const response = await fetch("/api/challenge/recover", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(
          result.error ||
            "Recovery details could not be saved. Please check the payment reference and details."
        );
      }

      setRegisteredReference(formData.paymentReference.trim());
      setRecoveredStatus(result.paymentStatus || "paid");
      setIsSubmitted(true);
      setFormData(initialFormState);
      setStatus(result.status);
      toast.success("Challenge recovery completed successfully.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Recovery failed. Please contact support with your payment reference.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const outcomeTitle =
    recoveredStatus === "waitlist"
      ? "On the Waitlist"
      : "Registration Recovered";
  const outcomeMessage =
    recoveredStatus === "waitlist"
      ? "Registration details were restored and placed on the waitlist."
      : "Registration details were restored and synced to the dashboard.";

  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <Card className="border-[#fc9dca]/30 shadow-md">
            <CardContent className="p-8 text-center space-y-4">
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
              <h1 className="text-3xl font-bold text-gray-900">
                {outcomeTitle}
              </h1>
              <p className="text-gray-600">{outcomeMessage}</p>
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
              {isRegistrationOpen ? "Recovery Form" : "Registration Closed"}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
              Challenge Recovery
            </h1>
            {!isRegistrationOpen && (
              <p className="mx-auto max-w-2xl text-sm text-gray-600">
                {registrationClosedMessage}
              </p>
            )}
          </div>

        <div className="mx-auto w-full max-w-4xl">
          <form
            onSubmit={handleSubmit}
            className="space-y-8"
            aria-label="Challenge recovery form"
          >
            <Card className="border-gray-200 shadow-md">
              <CardHeader>
                <CardTitle className="text-gray-900">Recovery Form</CardTitle>
                <CardDescription>
                  {isRegistrationOpen
                    ? "Fill in the same details as your challenge registration."
                    : registrationClosedMessage}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <section className="space-y-4">
                  <h2 className="text-lg font-semibold text-[#fc9dca]">
                    Payment details
                  </h2>
                  <div className="space-y-2">
                    <Label htmlFor="paymentReference">Paystack reference *</Label>
                    <Input
                      id="paymentReference"
                      value={formData.paymentReference}
                      onChange={(e) =>
                        updateField("paymentReference", e.target.value)
                      }
                      placeholder="T1234567890"
                      readOnly={isReferenceLocked}
                      className={
                        isReferenceLocked
                          ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                          : ""
                      }
                      required
                    />
                  </div>
                </section>

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
                    disabled={isPaymentOptionLocked}
                    onValueChange={() => updateField("paymentOption", "member")}
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
                      <Label htmlFor="instagramHandle">Instagram name (if any)</Label>
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
                  <div className="max-h-[280px] space-y-5 overflow-y-auto rounded-md border border-gray-200 p-4 text-sm text-gray-700">
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

                <div className="pt-2">
                  {!isRegistrationOpen && (
                    <p className="mb-4 text-center text-sm font-medium text-red-600">
                      {registrationClosedMessage}
                    </p>
                  )}
                  <div className="flex justify-center">
                    <Button
                      type="submit"
                      className="rounded-md bg-[#fc9dca] px-16 py-3 text-sm font-medium text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={
                        !isRegistrationOpen || isSubmitting || isLoadingStatus
                      }
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : !isRegistrationOpen ? (
                        "Registration Closed"
                      ) : (
                        "Save"
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>

        </div>
      </div>
    </main>
  );
}
