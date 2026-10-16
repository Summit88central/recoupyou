"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Loader2, Calendar as CalendarIcon, X } from "lucide-react";
import Link from "next/link";
import { sendPersonalTrainingEmail } from "@/lib/emailjs";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Reusable payment details content
function PaymentDetails() {
  return (
    <div className="text-left space-y-2 text-sm">
      <div className="text-gray-700 space-y-1">
        <p><span className="font-medium">Payment method:</span> EFT</p>
        <p><span className="font-medium">Bank:</span> FNB</p>
        <p><span className="font-medium">Account type:</span> Cheque account</p>
        <p><span className="font-medium">Account number:</span> 63131752643</p>
        <p><span className="font-medium">Account holder:</span> RecoupYou</p>
      </div>
      <p className="text-gray-500 text-xs pt-1">
        Please use your <span className="font-semibold text-gray-700">full name</span> as the payment reference. All payments are non-refundable.
      </p>
      <div className="pt-2 border-t border-[#fc9dca]/20 text-xs text-gray-700">
        <p>
          Please send proof of payment to this number:{" "}
          <span className="font-semibold text-gray-900">+27 72 581 7797</span>
        </p>
      </div>
    </div>
  );
}

// Payment details modal
function PaymentModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 z-10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">💳</div>
          <h2 className="text-lg font-bold text-gray-900">Payment Details</h2>
          <p className="text-sm text-gray-500 mt-1">
            Please complete your payment using the details below.
          </p>
        </div>
        <div className="rounded-lg border border-[#fc9dca]/40 bg-[#fff0f8] p-4">
          <PaymentDetails />
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
          onClick={onClose}
          className="w-full mt-4 bg-[#fc9dca] hover:bg-[#fc9dca]/90 text-white"
        >
          Got it!
        </Button>
      </div>
    </div>
  );
}

export default function BookPersonalTrainingPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    whatsapp: "",
    age: "",
    goals: "",
    package: "",
    additionalInfo: "",
    startDate: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Ensure start date is provided (defensive validation in addition to HTML required)
      if (!formData.startDate) {
        alert("Please select when you'd like to get started.");
        setIsSubmitting(false);
        return;
      }

      const combinedAdditionalInfo = `${formData.additionalInfo}${formData.startDate ? `\nPreferred start date: ${formData.startDate}` : ""}`.trim();

      // Insert into Supabase
      const { error: insertError } = await supabase
        .from("personal_training_applications")
        .insert({
          full_name: formData.fullName,
          whatsapp: formData.whatsapp,
          age: formData.age,
          goals: formData.goals,
          package: formData.package,
          additional_info: combinedAdditionalInfo,
        });

      if (insertError) throw insertError;

      // Mark as submitted immediately — don't block on email
      setIsSubmitted(true);
      setShowPaymentModal(true);

      // Reset form
      setFormData({
        fullName: "",
        whatsapp: "",
        age: "",
        goals: "",
        package: "",
        additionalInfo: "",
        startDate: "",
      });

      // Fire email in the background — best-effort, won't block UI
      sendPersonalTrainingEmail(formData).then((result) => {
        if (!result.success) {
          console.error("Personal training application email failed:", result.error);
        }
      });
    } catch (error) {
      console.error("Form submission error:", error);
      alert(
        "There was an error submitting your application. Please try again or contact us directly."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-white">
        {/* Payment popup */}
        {showPaymentModal && (
          <PaymentModal onClose={() => setShowPaymentModal(false)} />
        )}

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <Card>
              <CardContent className="p-8">
                <div className="text-6xl mb-4">🌸</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  Thank You!
                </h1>
                <p className="text-gray-600 mb-4">
                  Your personal training application has been submitted
                  successfully. Coach Dee will get in touch within the next 48
                  hours to get you started!
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Feel free to reach out via Instagram DM or WhatsApp if you
                  have any questions.
                </p>

                {/* Payment details always visible on thank you */}
                <div className="rounded-lg border border-[#fc9dca]/40 bg-[#fff0f8] p-4 mb-6 text-left">
                  <p className="font-semibold text-gray-800 mb-2 text-sm">💳 Payment Details</p>
                  <PaymentDetails />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => setShowPaymentModal(true)}
                    className="bg-[#fc9dca] hover:bg-[#fc9dca]/90 text-white"
                  >
                    View Payment Details
                  </Button>
                  <Link href="/personal-training" className="inline-block">
                    <Button
                      variant="outline"
                      className="w-full border-[#fc9dca] text-[#fc9dca] hover:bg-[#fc9dca] hover:text-white bg-transparent"
                    >
                      Back to Personal Training
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <Link
            href="/personal-training"
            className="inline-flex items-center gap-2 text-[#fc9dca] hover:text-[#fc9dca]/80 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Personal Training
          </Link>

          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">
                Train with Coach Dee
              </CardTitle>
              <CardDescription>
                Fill in the form below to get started. The Monthly Package
                requires a minimum 3-month contract.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full name? *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) =>
                      handleInputChange("fullName", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp number *</Label>
                  <Input
                    id="whatsapp"
                    placeholder="e.g. +27 72 932 4503"
                    value={formData.whatsapp}
                    onChange={(e) =>
                      handleInputChange("whatsapp", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">What's your current age? *</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goals">
                    What are your main fitness goals? *
                  </Label>
                  <Textarea
                    id="goals"
                    placeholder="e.g. get stronger, weight loss, muscle building, fat loss, improve general fitness & physique goals etc"
                    value={formData.goals}
                    onChange={(e) => handleInputChange("goals", e.target.value)}
                    className="min-h-32"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label>Choose package *</Label>
                  <RadioGroup
                    value={formData.package}
                    onValueChange={(value) =>
                      handleInputChange("package", value)
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="R2,400/monthly" id="monthly" />
                      <Label htmlFor="monthly">R2,400/monthly</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="R2,500/monthly (month to month - no contract)"
                        id="month-to-month"
                      />
                      <Label htmlFor="month-to-month">
                        R2,500/monthly (month to month - no contract)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="R6,500 once off payment (3 months bundle)"
                        id="bundle"
                      />
                      <Label htmlFor="bundle">
                        R6,500 once off payment (3 months bundle)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="R250/session" id="session" />
                      <Label htmlFor="session">R250/session</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">When would you like to get started? *</Label>
                  <div className="relative w-full max-w-full overflow-hidden">
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange("startDate", e.target.value)}
                      placeholder="yyyy-mm-dd"
                      className="pr-10 cursor-pointer w-full box-border"
                      required
                    />
                    <CalendarIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  <p className="text-xs text-gray-500">Tap the field to open the date picker.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalInfo">
                    Is there anything else you would like us to know?
                  </Label>
                  <Textarea
                    id="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={(e) =>
                      handleInputChange("additionalInfo", e.target.value)
                    }
                  />
                </div>

                {/* Payment Details — always visible on form */}
                <div className="rounded-lg border border-[#fc9dca]/40 bg-[#fff0f8] p-4 space-y-2 text-sm">
                  <p className="font-semibold text-gray-800">💳 Payment Details</p>
                  <PaymentDetails />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#fc9dca] hover:bg-[#fc9dca]/90 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending Application...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
