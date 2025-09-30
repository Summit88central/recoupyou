"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, Loader2 } from "lucide-react";

interface DashboardHeaderProps {
  onLogout: () => void;
  isLoggingOut?: boolean;
}

export function DashboardHeader({ onLogout, isLoggingOut = false }: DashboardHeaderProps) {
  return (
    <header className="border-b bg-card shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-primary">RY</h1>
            <Badge variant="secondary">Dashboard</Badge>
          </div>
          <Button
            variant="outline"
            onClick={onLogout}
            className="flex items-center space-x-2 bg-transparent"
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
