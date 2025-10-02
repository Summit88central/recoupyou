import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Users, Calendar } from "lucide-react";

export default function WednesdayClassPage() {
  return (
    <div className="min-h-screen bg-white mt-6">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge className="bg-[#fc9dca] text-white mb-4">FREE CLASS</Badge>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Must be based in Polokwane.
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join Coach Dee every Wednesday for a HIIT group workout.
            </p>
          </div>

          {/* Class Details */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[#fc9dca]" />
                  Class Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>Every Wednesday at 5:00 AM</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>RecoupYou Gym</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span>Free for everyone</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle>What to Expect</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• 45-minute high-intensity workout</li>
                  <li>• Strength and conditioning exercises</li>
                  <li>• Suitable for all fitness levels</li>
                  <li>• Wear comfortable workout attire</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* RSVP Section */}
          <Card className="border-2 border-[#fc9dca]/20 bg-gradient-to-r from-[#fc9dca]/5 to-transparent">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Reserve Your Spot</CardTitle>
              <CardDescription>
                RSVP closes every Tuesday at 8:30 PM. Secure your spot for this
                week's class!
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/wednesday-class/rsvp">
                <Button
                  size="lg"
                  className="bg-[#fc9dca] hover:bg-[#fc9dca]/90 text-white px-8 py-3"
                >
                  RSVP for This Wednesday
                </Button>
              </Link>
              <p className="text-sm text-gray-500 mt-4">Free for everyone</p>
            </CardContent>
          </Card>

          {/* Important Notes */}
          <div className="mt-12 p-6 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">
              Important Notes:
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• RSVP deadline: Every Tuesday at 8:30 PM</li>
              <li>• Please arrive 5 - 10 minutes early for check-in</li>
              <li>• Contact us on Whatsapp or Instagram for any questions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
