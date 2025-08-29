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
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Users } from "lucide-react";
import Link from "next/link";

export default function WednesdayRSVPPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/wednesday-rsvp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit RSVP");
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error("RSVP submission error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to submit RSVP. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="container mx-auto px-4">
          <Card className="max-w-md mx-auto text-center border-2 border-[#fc9dca]/20">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-[#fc9dca]/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-[#fc9dca]" />
              </div>
              <CardTitle className="text-2xl text-gray-900">
                You're In!
              </CardTitle>
              <CardDescription>
                Your RSVP for Wednesday's class has been confirmed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Next Class:</strong> Wednesday at 5:00 PM
                  <br />
                  <strong>Location:</strong> RecoupYou Gym
                  <br />
                  <strong>What to bring:</strong> Water bottle & towel
                </p>
              </div>
              <Link href="/">
                <Button className="w-full bg-[#fc9dca] hover:bg-[#fc9dca]/90 text-white">
                  Back to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Badge className="bg-[#fc9dca] text-white mb-4">FREE CLASS</Badge>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              RSVP for Wednesday Class
            </h1>
            <p className="text-gray-600">
              Reserve your spot for this week's group fitness session with Coach
              Dee.
            </p>
          </div>

          {/* Class Info */}
          <Card className="mb-8 border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#fc9dca]" />
                This Week's Class
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Date:</span> This Wednesday
                </div>
                <div>
                  <span className="font-medium">Time:</span> 5:00 PM
                </div>
                <div>
                  <span className="font-medium">Duration:</span> 45 minutes
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">Spots Available</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* RSVP Form */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Reserve Your Spot</CardTitle>
              <CardDescription>
                RSVP closes every Tuesday at 8:30 PM. Don't miss out!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="border-gray-300 focus:border-[#fc9dca] focus:ring-[#fc9dca]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="border-gray-300 focus:border-[#fc9dca] focus:ring-[#fc9dca]"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Before you RSVP:
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Please arrive 10 minutes early</li>
                    <li>• Bring water and a towel</li>
                    <li>• Suitable for all fitness levels</li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#fc9dca] hover:bg-[#fc9dca]/90 text-white py-3"
                >
                  {isSubmitting ? "Submitting..." : "Confirm My RSVP"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <Link
              href="/wednesday-class"
              className="text-[#fc9dca] hover:underline"
            >
              ← Back to Class Info
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
