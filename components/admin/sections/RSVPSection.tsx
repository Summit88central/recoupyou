"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Trash2, Info, RefreshCw } from 'lucide-react';

interface RSVPSectionProps {
  rsvps: any[];
  onView: (item: any, type: string) => void;
  onDelete: (id: string, name: string, type: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function RSVPSection({ rsvps, onView, onDelete, onRefresh, isRefreshing }: RSVPSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Wednesday Class RSVPs
          </h1>
          <p className="text-gray-600 mt-1">Manage attendees for this week's class</p>
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
            <span>RSVPs ({rsvps.length})</span>
          </CardTitle>
          <CardDescription>
            People who have confirmed their attendance for the Wednesday class.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rsvps.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No RSVPs yet</h3>
              <p className="text-gray-500">RSVPs will appear here when people sign up for the class.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rsvps.map((rsvp, index) => (
                <div
                  key={rsvp.id}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-colors hover:bg-gray-50 ${
                    index % 2 === 0 ? "bg-gray-50/50" : ""
                  }`}
                >
                  <div className="min-w-0 flex-1 mr-4">
                    <h3 className="font-semibold truncate text-gray-900">
                      {rsvp.first_name} {rsvp.last_name}
                    </h3>
                    <p className="truncate text-sm text-gray-600">
                      {rsvp.email}
                    </p>
                    <p className="truncate text-sm text-gray-500">
                      Phone: {rsvp.whatsapp || 'Not provided'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Registered: {new Date(rsvp.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onView(rsvp, "rsvp")}
                      className="flex items-center gap-1"
                    >
                      <Info className="h-4 w-4" />
                      <span className="hidden sm:inline">View</span>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(rsvp.id, `${rsvp.first_name} ${rsvp.last_name}`, "rsvp")}
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