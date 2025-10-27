import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Users, Utensils } from "lucide-react";
import Link from "next/link";

export default function PersonalTrainingPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-[#fc9dca] text-white hover:bg-[#f472b6]">
              In-Person Training
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Train with Coach Dee
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Must be based in Polokwane
            </p>
          </div>

          {/* What's Included */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                What's Included
              </CardTitle>
              <CardDescription>
                Comprehensive training package designed for your success
              </CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-[#fc9dca] mt-1" />
                  <div>
                    <h3 className="font-semibold">
                      4x Individual Training Sessions
                    </h3>
                    <p className="text-sm text-gray-600">
                      Per week, personalized to your goals
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#fc9dca] mt-1" />
                  <div>
                    <h3 className="font-semibold">1x Group Session</h3>
                    <p className="text-sm text-gray-600">
                      Every Wednesday at 5am
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Utensils className="w-5 h-5 text-[#fc9dca] mt-1" />
                  <div>
                    <h3 className="font-semibold">Personalized Eating Guide</h3>
                    <p className="text-sm text-gray-600">
                      Tailored nutrition plan
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#fc9dca] mt-1" />
                  <div>
                    <h3 className="font-semibold">Training Types</h3>
                    <p className="text-sm text-gray-600">
                      Strength, Conditioning & Group Training
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="border-2 border-[#fc9dca]/30">
              <CardHeader className="text-center">
                <CardTitle>Monthly Package</CardTitle>
                <div className="text-3xl font-bold text-[#fc9dca]">R2,400</div>
                <CardDescription>Per month</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    4x individual sessions/week
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    1x group session/week
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Eating guide included
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#fc9dca] relative">
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-[#fc9dca] text-white">
                Best Value
              </Badge>
              <CardHeader className="text-center">
                <CardTitle>3-Month Bundle</CardTitle>
                <div className="text-3xl font-bold text-[#fc9dca]">R6,500</div>
                <CardDescription>Save R700!</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Everything in monthly
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    3-month commitment
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Better results guaranteed
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200">
              <CardHeader className="text-center">
                <CardTitle>Per Session</CardTitle>
                <div className="text-3xl font-bold text-gray-600">R250</div>
                <CardDescription>Paid monthly</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Individual sessions only
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Flexible scheduling
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    No commitment required
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* CTA */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Minimum 3-months commitment required for package deals
            </p>
            <Link href="/personal-training/book">
              <Button
                size="lg"
                className="bg-[#fc9dca] hover:bg-[#f472b6] text-white"
              >
                Apply For Personal Training
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
