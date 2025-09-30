"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Trash2, Info, RefreshCw } from 'lucide-react';

interface MembershipsSectionProps {
  memberships: any[];
  onView: (item: any, type: string) => void;
  onDelete: (id: string, name: string, type: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function MembershipsSection({ memberships, onView, onDelete, onRefresh, isRefreshing }: MembershipsSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="h-6 w-6" />
            Gym Memberships
          </h1>
          <p className="text-gray-600 mt-1">Manage gym membership applications and payments</p>
        </div>
        <Button
          onClick={onRefresh}
          disabled={isRefreshing}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Memberships ({memberships.length})</span>
          </CardTitle>
          <CardDescription>
            People who have applied for gym memberships.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {memberships.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No memberships yet</h3>
              <p className="text-gray-500">Gym membership applications will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {memberships.map((membership, index) => (
                <div
                  key={membership.id}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-colors hover:bg-gray-50 ${
                    index % 2 === 0 ? "bg-gray-50/50" : ""
                  }`}
                >
                  <div className="min-w-0 flex-1 mr-4">
                    <h3 className="font-semibold truncate text-gray-900">
                      {membership.full_name}
                    </h3>
                    <p className="truncate text-sm text-gray-600">
                      {membership.email}
                    </p>
                    <p className="truncate text-sm text-gray-500">
                      Phone: {membership.phone || 'Not provided'}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-gray-500">
                        Plan: {membership.membership_type || 'Not specified'}
                      </span>
                      <span className="text-xs text-gray-500">
                        Duration: {membership.duration || 'Not specified'}
                      </span>
                      {membership.amount && (
                        <span className="text-xs font-medium text-green-600">
                          R{membership.amount.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Applied: {new Date(membership.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onView(membership, "membership")}
                      className="flex items-center gap-1"
                    >
                      <Info className="h-4 w-4" />
                      <span className="hidden sm:inline">View</span>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(membership.id, membership.full_name, "membership")}
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