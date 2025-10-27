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
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { sendPersonalTrainingEmail } from "@/lib/emailjs";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const combinedAdditionalInfo = `${formData.additionalInfo}${formData.startDate ? `\nPreferred start date: ${formData.startDate}` : ""}`.trim();
      // Insert into Supabase
      const { data: insertData, error: insertError } = await supabase
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

      // Send email
      const emailResult = await sendPersonalTrainingEmail(formData);

      if (!emailResult.success) {
        throw new Error("Email sending failed");
      }

      setIsSubmitted(true);
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
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <Card>
              <CardContent className="p-8">
                <div className="text-6xl mb-4">🌸</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  Thank You!
                </h1>
                <p className="text-gray-600 mb-6">
                  Your personal training application has been submitted
                  successfully. Coach Dee will get in touch within the next 48
                  hours to get you started!
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <p>
                    Feel free to reach out via Instagram DM or Whatsapp if you
                    have any questions.
                  </p>
                </div>
                <Link href="/personal-training" className="inline-block mt-6">
                  <Button
                    variant="outline"
                    className="border-[#fc9dca] text-[#fc9dca] hover:bg-[#fc9dca] hover:text-white bg-transparent"
                  >
                    Back to Personal Training
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
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
                Fill in the form below to get started. You must be comfortable
                with a minimum 3-month contract.
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
                  <Label htmlFor="startDate">When would you like to get started?</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                    required
                  />
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

                <div className="text-center text-sm text-gray-600">
                  <p className="font-semibold">THANK YOU!</p>
                  <p>
                    I will get in touch in the next 48h on how to get started.
                    🌸
                  </p>
                  <p className="mt-2">
                    Feel free to reach out via Instagram DM or drop any
                    questions about personal training below!
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
