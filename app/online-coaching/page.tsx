import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Smartphone, Calendar, Heart } from "lucide-react";
import Link from "next/link";

export default function OnlineCoachingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-purple-100 text-purple-800 hover:bg-purple-200">
              Online Coaching
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Online 1:1 Coaching
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              For women looking to start or enhance their fitness journey with
              personalized online coaching.
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="text-center">
                <Smartphone className="w-12 h-12 text-purple-600 mx-auto mb-2" />
                <CardTitle>Flexible Training</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 text-center">
                  Train anywhere, anytime with personalized workout plans
                  designed just for you.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Calendar className="w-12 h-12 text-purple-600 mx-auto mb-2" />
                <CardTitle>Personal Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 text-center">
                  Get 1:1 coaching support and guidance throughout your fitness
                  journey.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Heart className="w-12 h-12 text-purple-600 mx-auto mb-2" />
                <CardTitle>Women-Focused</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 text-center">
                  Specifically designed for women at all fitness levels, from
                  beginner to advanced.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* All Plans Include */}
          <Card className="mb-8 bg-purple-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-purple-800">
                1:1 Coaching Includes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-purple-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Personalised workout plan with technique video attached to
                  each exercise
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Personalised meal plan in accordance with your goals
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Weekly Check-Ins
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  1:1 Form Check Video Calls (scheduled)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Direct Chat with me for support
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Fortnight physique update pictures
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Pricing */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="border-2 border-purple-200">
              <CardHeader className="text-center">
                <CardTitle>Monthly Coaching</CardTitle>
                <div className="text-3xl font-bold text-purple-600">R900</div>
                <CardDescription>Per month</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Personalized workout plans and eating guides
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    1:1 coaching support
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Progress tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Flexible scheduling
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-pink-200 relative">
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-pink-600">
                Best Value
              </Badge>
              <CardHeader className="text-center">
                <CardTitle>3-Month Package</CardTitle>
                <div className="text-3xl font-bold text-pink-600">R2,250</div>
                <CardDescription>Save R450!</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Everything in monthly
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Requirements */}
          <Card className="mb-8 bg-purple-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-purple-800">
                Before You Apply
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-purple-700 mb-4">
                Only fill in the form if you're ready to commit to the program
                for a minimum of 3 months.
              </p>
              <ul className="space-y-2 text-sm text-purple-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Must be willing to commit for minimum 3 months
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Suitable for all fitness levels (beginner to advanced)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Access to gym recommended but not required
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center">
            <Link href="/online-coaching/apply">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                Apply for Online Coaching
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
