"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Construction } from "lucide-react";

export default function GuidesPage() {
  return (
    <div className="container mx-auto p-4 flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Construction className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Coming Soon!</CardTitle>
          <CardDescription className="mt-2">
            We are working hard to bring you exclusive digital fitness and
            nutrition guides. Stay tuned for the launch!
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
