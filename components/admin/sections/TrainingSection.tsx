"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dumbbell, Trash2, Info, RefreshCw } from 'lucide-react';

interface TrainingSectionProps {
  training: any[];
  onView: (item: any, type: string) => void;
  onDelete: (id: string, name: string, type: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function TrainingSection({ training, onView, onDelete, onRefresh, isRefreshing }: TrainingSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Dumbbell className="h-6 w-6" />
            Personal Training
          </h1>
          <p className="text-gray-600 mt-1">Manage personal training applications and sessions</p>
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
            <span>Training Applications ({training.length})</span>
          </CardTitle>
          <CardDescription>
            People who have applied for personal training sessions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {training.length === 0 ? (
            <div className="text-center py-12">
              <Dumbbell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
              <p className="text-gray-500">Personal training applications will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {training.map((app, index) => (
                <div
                  key={app.id}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-colors hover:bg-gray-50 ${
                    index % 2 === 0 ? "bg-gray-50/50" : ""
                  }`}
                >
                  <div className="min-w-0 flex-1 mr-4">
                    <h3 className="font-semibold truncate text-gray-900">
                      {app.full_name}
                    </h3>
                    <p className="truncate text-sm text-gray-500">
                      WhatsApp: {app.whatsapp || 'Not provided'}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                      <span className="text-xs text-gray-500">
                        Age: {app.age || 'Not specified'}
                      </span>
                      <span className="text-xs text-gray-500">
                        Package: {app.package || 'Not specified'}
                      </span>
                      <span className="text-xs text-gray-500">
                        Goals: {app.goals || 'Not specified'}
                      </span>
                      <span className="text-xs text-gray-500">
                        Start: {(() => {
                          const info = app.additional_info || '';
                          const match = info.match(/Preferred start date:\s*([^\n]+)/i);
                          const parsed = match ? match[1] : (app.start_date || null);
                          return parsed || 'Not specified';
                        })()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Applied: {new Date(app.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onView(app, "training")}
                      className="flex items-center gap-1"
                    >
                      <Info className="h-4 w-4" />
                      <span className="hidden sm:inline">View</span>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(app.id, app.full_name, "training")}
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