"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Trash2, Info, RefreshCw } from "lucide-react";

interface ChallengesSectionProps {
  challenges: any[];
  onView: (item: any, type: string) => void;
  onDelete: (id: string, name: string, type: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

const formatCurrency = (amount: number | null | undefined) =>
  typeof amount === "number"
    ? new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(amount)
    : "N/A";

export function ChallengesSection({
  challenges,
  onView,
  onDelete,
  onRefresh,
  isRefreshing,
}: ChallengesSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="h-6 w-6" />
            6-Week Challenge Signups
          </h1>
          <p className="text-gray-600 mt-1">
            Manage paid challenge entries and payment references.
          </p>
        </div>
        <Button
          onClick={onRefresh}
          disabled={isRefreshing}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Challenge Entries ({challenges.length})</span>
          </CardTitle>
          <CardDescription>
            Participants who paid and signed up for the 6-week challenge.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {challenges.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No challenge signups yet</h3>
              <p className="text-gray-500">Paid challenge entries will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {challenges.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-colors hover:bg-gray-50 ${
                    index % 2 === 0 ? "bg-gray-50/50" : ""
                  }`}
                >
                  <div className="min-w-0 flex-1 mr-4">
                    <h3 className="font-semibold truncate text-gray-900">
                      {entry.full_name}
                    </h3>
                    <p className="truncate text-sm text-gray-600">{entry.email}</p>
                    <p className="truncate text-sm text-gray-500">
                      WhatsApp: {entry.whatsapp_number || "Not provided"}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge variant="secondary">
                        {entry.payment_option === "member" ? "Member" : "Non-member"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={
                          entry.payment_status === "paid"
                            ? "text-green-700 border-green-300 bg-green-50"
                            : ""
                        }
                      >
                        {entry.payment_status || "unknown"}
                      </Badge>
                      <Badge variant="outline">
                        {formatCurrency(entry.amount_paid)}
                      </Badge>
                      {entry.discount_applied && (
                        <Badge variant="outline" className="text-pink-700 border-pink-300 bg-pink-50">
                          Discount
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-gray-400 mt-1">
                      Ref: {entry.payment_reference || "N/A"}
                    </p>
                    <p className="text-xs text-gray-400">
                      Signed up:{" "}
                      {entry.created_at
                        ? new Date(entry.created_at).toLocaleDateString("en-ZA")
                        : "N/A"}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onView(entry, "challenge")}
                      className="flex items-center gap-1"
                    >
                      <Info className="h-4 w-4" />
                      <span className="hidden sm:inline">View</span>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(entry.id, entry.full_name, "challenge")}
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="hidden sm:inline">Delete</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
