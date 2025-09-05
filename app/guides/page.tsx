import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Heart, Utensils } from "lucide-react";

export default function GuidesPage() {
  const guides = [
    {
      id: "nutrition-guide",
      title: "Complete Nutrition Guide",
      description:
        "Comprehensive eating plan with meal prep ideas, portion control, and healthy recipes.",
      price: "R500",
      icon: <Utensils className="w-8 h-8 text-green-600" />,
      features: [
        "Meal planning templates",
        "Healthy recipes",
        "Portion control guide",
        "Shopping lists",
      ],
    },
    {
      id: "workout-plan",
      title: "Personalized Workout Plan",
      description:
        "Customized training program designed for your fitness level and goals.",
      price: "R500",
      icon: <Heart className="w-8 h-8 text-pink-600" />,
      features: [
        "Progressive training plan",
        "Exercise demonstrations",
        "Weekly schedules",
        "Progress tracking",
      ],
    },
    {
      id: "complete-bundle",
      title: "Complete Fitness Bundle",
      description:
        "Both nutrition guide and workout plan at a discounted price.",
      price: "R800",
      originalPrice: "R1000",
      icon: <FileText className="w-8 h-8 text-purple-600" />,
      features: [
        "Everything from both guides",
        "Bonus meal prep tips",
        "Exercise video links",
        "Priority support",
      ],
      popular: true,
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-green-100 text-green-800 hover:bg-green-200">
              Digital Guides
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Downloadable Fitness Guides
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get instant access to professional fitness and nutrition guides
              designed to accelerate your results.
            </p>
          </div>

          {/* Guides Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {guides.map((guide) => (
              <Card
                key={guide.id}
                className={`relative ${
                  guide.popular ? "border-2 border-purple-200 shadow-lg" : ""
                }`}
              >
                {guide.popular && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-purple-600">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4">{guide.icon}</div>
                  <CardTitle className="text-xl">{guide.title}</CardTitle>
                  <CardDescription>{guide.description}</CardDescription>
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <span className="text-3xl font-bold text-gray-900">
                      {guide.price}
                    </span>
                    {guide.originalPrice && (
                      <span className="text-lg text-gray-500 line-through">
                        {guide.originalPrice}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {guide.features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-sm"
                      >
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={guide.popular ? "default" : "outline"}
                    disabled
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Info Section */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Professional Guides Coming Soon
              </h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Our comprehensive fitness and nutrition guides are currently
                being finalized by our expert team. These digital resources will
                provide you with everything you need to succeed on your fitness
                journey.
              </p>
              <div className="grid md:grid-cols-3 gap-6 text-sm">
                <div className="flex items-center justify-center gap-2">
                  <Download className="w-5 h-5 text-blue-600" />
                  <span>Instant Download</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span>PDF Format</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Heart className="w-5 h-5 text-blue-600" />
                  <span>Expert Created</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
