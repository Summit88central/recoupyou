"use client";

import type React from "react";
import Link from "next/link";

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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Users, Loader2 } from "lucide-react";
import { sendMembershipEmail } from "@/lib/emailjs";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function MembershipApplicationPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    address: "",
    phone: "",
    email: "",
    emergencyName: "",
    emergencyPhone: "",
    emergencyRelationship: "",
    medicalConditions: "",
    membershipPlan: "",
    additionalServices: [] as string[],
    startDate: "",
    hearAbout: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [membershipPlanError, setMembershipPlanError] = useState(false);
  const [additionalServicesError, setAdditionalServicesError] = useState(false);
  const [hearAboutError, setHearAboutError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let hasError = false;

    // Validate membership plan (RadioGroup doesn't support native required)
    if (!formData.membershipPlan) {
      setMembershipPlanError(true);
      if (!hasError) {
        document.getElementById("membership-plan-group")?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      hasError = true;
    } else {
      setMembershipPlanError(false);
    }

    if (formData.additionalServices.length === 0) {
      setAdditionalServicesError(true);
      if (!hasError) {
        document.getElementById("additional-services-group")?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      hasError = true;
    } else {
      setAdditionalServicesError(false);
    }

    if (!formData.hearAbout) {
      setHearAboutError(true);
      if (!hasError) {
        document.getElementById("hear-about-group")?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      hasError = true;
    } else {
      setHearAboutError(false);
    }

    if (hasError) return;

    setIsSubmitting(true);

    try {
      // Insert into Supabase
      const { data: insertData, error: insertError } = await supabase
        .from("membership_applications")
        .insert({
          full_name: formData.fullName,
          date_of_birth: formData.dateOfBirth,
          address: formData.address,
          phone: formData.phone,
          email: formData.email,
          emergency_name: formData.emergencyName,
          emergency_phone: formData.emergencyPhone,
          emergency_relationship: formData.emergencyRelationship,
          medical_conditions: formData.medicalConditions,
          membership_plan: formData.membershipPlan,
          additional_services: formData.additionalServices,
          start_date: formData.startDate || null,
          hear_about: formData.hearAbout,
        });

      if (insertError) throw insertError;

      // Send email
      const emailResult = await sendMembershipEmail(formData);

      if (!emailResult.success) {
        throw new Error("Email sending failed");
      }

      setIsSubmitted(true);
      // Reset form
      setFormData({
        fullName: "",
        dateOfBirth: "",
        address: "",
        phone: "",
        email: "",
        emergencyName: "",
        emergencyPhone: "",
        emergencyRelationship: "",
        medicalConditions: "",
        membershipPlan: "",
        additionalServices: [],
        startDate: "",
        hearAbout: "",
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

  const handleServiceChange = (service: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      additionalServices: checked
        ? [...prev.additionalServices, service]
        : prev.additionalServices.filter((s) => s !== service),
    }));
  };

  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <Card className="shadow-md border-[#fc9dca]/30">
              <CardContent className="p-10">
                <div className="text-6xl mb-4">🌸</div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Thank You!
                </h1>
                <p className="text-gray-600 mb-6">
                  Your gym membership application has been submitted
                  successfully. We'll be in touch soon to complete your
                  registration!
                </p>
                <p className="text-sm text-gray-500">
                  Welcome to the RecoupYou Ladies Only Fitness Studio community!
                </p>
                <Link href="/" className="inline-block mt-8">
                  <Button
                    variant="outline"
                    className="border-[#fc9dca] text-[#fc9dca] hover:bg-[#fc9dca] hover:text-white transition-colors"
                  >
                    Back to Home
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
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <Badge className="mb-4 bg-[#fc9dca]/10 text-[#fc9dca] border-[#fc9dca]/20">
              Gym Membership
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
              Membership Application
            </h1>
            <p className="text-lg text-gray-600">
              Join our exclusive ladies-only fitness community
            </p>
          </div>

          {/* Studio Info */}
          <div className="grid md:grid-cols-3 gap-5 mb-10">
            <Card className="border-gray-200 shadow-sm hover:shadow-md transition">
              <CardContent className="flex items-center gap-3 p-5">
                <Clock className="w-8 h-8 text-[#fc9dca]" />
                <div>
                  <p className="font-semibold text-gray-900">Operating Hours</p>
                  <p className="text-sm text-gray-600">Mon–Fri: 5am–7pm</p>
                  <p className="text-sm text-gray-600">Sat: 6am–12pm</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-gray-200 shadow-sm hover:shadow-md transition">
              <CardContent className="flex items-center gap-3 p-5">
                <Users className="w-8 h-8 text-[#fc9dca]" />
                <div>
                  <p className="font-semibold text-gray-900">Ladies Only</p>
                  <p className="text-sm text-gray-600">
                    Exclusive women’s fitness space
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-gray-200 shadow-sm hover:shadow-md transition">
              <CardContent className="flex items-center gap-3 p-5">
                <MapPin className="w-8 h-8 text-[#fc9dca]" />
                <div>
                  <p className="font-semibold text-gray-900">Location</p>
                  <p className="text-sm text-gray-600">72 Kleineberg Street</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Form */}
          <Card className="border-gray-200 shadow-md">
            <CardHeader>
              <CardTitle className="text-gray-900">
                Gym Registration Form
              </CardTitle>
              <CardDescription>
                All information is kept confidential. You must be at least 16
                years old to register.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Information */}
                <section className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#fc9dca]">
                    Personal Information
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full name *</Label>
                    <Input
                      id="fullName"
                      placeholder="Enter your full legal name"
                      value={formData.fullName}
                      onChange={(e) =>
                        handleInputChange("fullName", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) =>
                        handleInputChange("dateOfBirth", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Physical address *</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone number *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>
                </section>

                {/* Emergency Contact */}
                <section className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#fc9dca]">
                    Emergency Contact
                  </h3>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="emergencyName">Full name *</Label>
                      <Input
                        id="emergencyName"
                        value={formData.emergencyName}
                        onChange={(e) =>
                          handleInputChange("emergencyName", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyPhone">Phone number *</Label>
                      <Input
                        id="emergencyPhone"
                        value={formData.emergencyPhone}
                        onChange={(e) =>
                          handleInputChange("emergencyPhone", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyRelationship">
                      Relationship *
                    </Label>
                    <Input
                      id="emergencyRelationship"
                      value={formData.emergencyRelationship}
                      onChange={(e) =>
                        handleInputChange(
                          "emergencyRelationship",
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>
                </section>

                {/* Health */}
                <section className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#fc9dca]">
                    Health & Fitness Information
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="medicalConditions">
                      Do you have any medical conditions or injuries we should
                      know about?
                    </Label>
                    <Textarea
                      id="medicalConditions"
                      placeholder="If yes, please explain"
                      value={formData.medicalConditions}
                      onChange={(e) =>
                        handleInputChange("medicalConditions", e.target.value)
                      }
                    />
                  </div>
                </section>

                {/* Membership Options */}
                <section className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#fc9dca]">
                    Membership Options
                  </h3>

                  <div className="space-y-3" id="membership-plan-group">
                    <Label>
                      Select your preferred membership plan{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <RadioGroup
                      value={formData.membershipPlan}
                      onValueChange={(value) => {
                        handleInputChange("membershipPlan", value);
                        setMembershipPlanError(false);
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="Month to Month – R500 + R150 joining fee"
                          id="monthly-membership"
                        />
                        <Label htmlFor="monthly-membership">
                          Month to Month – R500 + R150 joining fee
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="6 months contract – R450/month + R120 joining fee"
                          id="6month-membership"
                        />
                        <Label htmlFor="6month-membership">
                          6 months contract – R450/month + R120 joining fee
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="12 months contract – R400/month + R100 joining fee"
                          id="12month-membership"
                        />
                        <Label htmlFor="12month-membership">
                          12 months contract – R400/month + R100 joining fee
                        </Label>
                      </div>
                    </RadioGroup>
                    {membershipPlanError && (
                      <p className="text-sm text-red-500 font-medium">
                        Please select a membership plan to continue.
                      </p>
                    )}
                  </div>

                  <div className="space-y-3" id="additional-services-group">
                    <Label>Would you like to purchase any of these? *</Label>
                    <div className="space-y-2">
                      {[
                        {
                          id: "training-plan",
                          label: "Training plan (R450 once off)",
                        },
                        {
                          id: "eating-guide",
                          label: "Eating guide (R450 once off)",
                        },
                        {
                          id: "both-guides",
                          label: "Both of the above (R750)",
                        },
                        { id: "none", label: "None of the above" },
                      ].map((service) => (
                        <div
                          key={service.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={service.id}
                            checked={formData.additionalServices.includes(
                              service.id
                            )}
                            onCheckedChange={(checked) => {
                              handleServiceChange(
                                service.id,
                                checked as boolean
                              );
                              setAdditionalServicesError(false);
                            }}
                          />
                          <Label htmlFor={service.id}>{service.label}</Label>
                        </div>
                      ))}
                    </div>
                    {additionalServicesError && (
                      <p className="text-sm text-red-500 font-medium">
                        Please select at least one option.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startDate">
                      When would you like to start? *
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        handleInputChange("startDate", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="space-y-3" id="hear-about-group">
                    <Label>How did you hear about our gym? *</Label>
                    <RadioGroup
                      value={formData.hearAbout}
                      onValueChange={(value) => {
                        handleInputChange("hearAbout", value);
                        setHearAboutError(false);
                      }}
                    >
                      {[
                        "Online Search",
                        "Social media",
                        "Friend/family referral",
                        "Online advertisement",
                        "Physical advert",
                        "Other",
                      ].map((option) => (
                        <div
                          key={option}
                          className="flex items-center space-x-2"
                        >
                          <RadioGroupItem
                            value={option
                              .toLowerCase()
                              .replace(/[^a-z0-9]/g, "-")}
                            id={option.toLowerCase().replace(/[^a-z0-9]/g, "-")}
                          />
                          <Label
                            htmlFor={option
                              .toLowerCase()
                              .replace(/[^a-z0-9]/g, "-")}
                          >
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                    {hearAboutError && (
                      <p className="text-sm text-red-500 font-medium">
                        Please tell us how you heard about us.
                      </p>
                    )}
                  </div>
                </section>

                <Button
                  type="submit"
                  className="w-full bg-[#fc9dca] hover:bg-[#fc9dca]/90 text-white font-semibold py-6 text-lg transition"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
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
