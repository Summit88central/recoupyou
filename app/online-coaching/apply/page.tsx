"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { sendOnlineCoachingEmail } from "@/lib/emailjs"

export default function ApplyOnlineCoachingPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    whatsapp: "",
    instagram: "",
    age: "",
    fitnessLevel: "",
    goals: "",
    gymAccess: "",
    dietaryRestrictions: "",
    package: "",
    startDate: "",
    additionalInfo: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const result = await sendOnlineCoachingEmail(formData)

      if (result.success) {
        setIsSubmitted(true)
        // Reset form
        setFormData({
          fullName: "",
          email: "",
          whatsapp: "",
          instagram: "",
          age: "",
          fitnessLevel: "",
          goals: "",
          gymAccess: "",
          dietaryRestrictions: "",
          package: "",
          startDate: "",
          additionalInfo: "",
        })
      } else {
        alert("There was an error sending your application. Please try again or contact us directly.")
      }
    } catch (error) {
      console.error("Form submission error:", error)
      alert("There was an error sending your application. Please try again or contact us directly.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <Card>
              <CardContent className="p-8">
                <div className="text-6xl mb-4">🌸</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Thank You!</h1>
                <p className="text-gray-600 mb-6">
                  Your online coaching application has been submitted successfully. I will get in touch within the next
                  48 hours to get you started!
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <p>Feel free to reach out via Instagram DM if you have any questions about coaching.</p>
                </div>
                <Link href="/online-coaching" className="inline-block mt-6">
                  <Button
                    variant="outline"
                    className="border-[#fc9dca] text-[#fc9dca] hover:bg-[#fc9dca] hover:text-white bg-transparent"
                  >
                    Back to Online Coaching
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <Link
            href="/online-coaching"
            className="inline-flex items-center gap-2 text-[#fc9dca] hover:text-[#fc9dca]/80 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Online Coaching
          </Link>

          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">Online 1:1 Coaching Application</CardTitle>
              <CardDescription>
                For women looking for online 1:1 coaching to start or enhance their fitness journey. Please provide
                accurate information to help us understand your goals and needs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">What is your full name? *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">What is your email address? *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp number *</Label>
                  <Input
                    id="whatsapp"
                    placeholder="E.g +27 72 932 4503 - start with state code"
                    value={formData.whatsapp}
                    onChange={(e) => handleInputChange("whatsapp", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagram">What's your Instagram handle? *</Label>
                  <Input
                    id="instagram"
                    placeholder="In case your number isn't on WhatsApp"
                    value={formData.instagram}
                    onChange={(e) => handleInputChange("instagram", e.target.value)}
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

                <div className="space-y-3">
                  <Label>What is your current fitness level? *</Label>
                  <RadioGroup
                    value={formData.fitnessLevel}
                    onValueChange={(value) => handleInputChange("fitnessLevel", value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="beginner" id="beginner" />
                      <Label htmlFor="beginner">Beginner</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="intermediate" id="intermediate" />
                      <Label htmlFor="intermediate">Intermediate</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="advanced" id="advanced" />
                      <Label htmlFor="advanced">Advanced</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goals">What are your main fitness goals? *</Label>
                  <Textarea
                    id="goals"
                    placeholder="e.g. get stronger, weight loss, muscle building, fat loss, improve general fitness & physique goals etc"
                    value={formData.goals}
                    onChange={(e) => handleInputChange("goals", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label>Do you have access to a gym? *</Label>
                  <RadioGroup
                    value={formData.gymAccess}
                    onValueChange={(value) => handleInputChange("gymAccess", value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="gym-yes" />
                      <Label htmlFor="gym-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="gym-no" />
                      <Label htmlFor="gym-no">No</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="willing" id="gym-willing" />
                      <Label htmlFor="gym-willing">I'm willing to get a gym membership</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dietaryRestrictions">Do you have any dietary restrictions? *</Label>
                  <Input
                    id="dietaryRestrictions"
                    placeholder="e.g vegetarian, vegan etc"
                    value={formData.dietaryRestrictions}
                    onChange={(e) => handleInputChange("dietaryRestrictions", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label>Choose package *</Label>
                  <p className="text-sm text-gray-600">
                    Please check the internet for conversions if you're using a different currency
                  </p>
                  <RadioGroup value={formData.package} onValueChange={(value) => handleInputChange("package", value)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="monthly" id="monthly-online" />
                      <Label htmlFor="monthly-online">R800/month</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="bundle-online" id="bundle-online" />
                      <Label htmlFor="bundle-online">R2,100 once off payment (3 months 1:1 coaching)</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">When exactly would you like to get started?</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalInfo">Is there anything else you would like us to know?</Label>
                  <Textarea
                    id="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={(e) => handleInputChange("additionalInfo", e.target.value)}
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

                <div className="text-center text-sm text-gray-600 mt-6">
                  <p className="font-semibold">THANK YOU!</p>
                  <p>I will get in touch in the next 48h on how to get started. 🌸</p>
                  <p className="mt-2">Feel free to reach out via Instagram DM or drop any questions about coaching</p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
