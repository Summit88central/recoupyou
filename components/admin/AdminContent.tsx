"use client";

import React from 'react';
import { DashboardStats } from './DashboardStats';
import { RSVPSection } from './sections/RSVPSection';
import { CoachingSection } from './sections/CoachingSection';
import { MembershipsSection } from './sections/MembershipsSection';
import { TrainingSection } from './sections/TrainingSection';
import { GuidesSection } from './sections/GuidesSection';
import { BundlesSection } from './sections/BundlesSection';

interface AdminContentProps {
  activeSection: string;
  data: {
    rsvps: any[];
    onlineCoaching: any[];
    memberships: any[];
    personalTraining: any[];
    guides: any[];
    bundles: any[];
  };
  stats: {
    total: number;
    rsvps: number;
    coaching: number;
    memberships: number;
    personalTraining: number;
    guides: number;
    bundles: number;
  };
  onView: (item: any, type: string) => void;
  onDelete: (id: string, name: string, type: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function AdminContent({
  activeSection,
  data,
  stats,
  onView,
  onDelete,
  onRefresh,
  isRefreshing
}: AdminContentProps) {
  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
              <p className="text-gray-600">Welcome to your admin dashboard. Here's a summary of your business.</p>
            </div>
            <DashboardStats stats={stats} />
            
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Recent Activity</h3>
                <p className="text-sm text-gray-600 mb-4">Latest applications and RSVPs</p>
                <div className="space-y-2">
                  {data?.rsvps?.slice(0, 3).map((rsvp) => (
                    <div key={rsvp.id} className="text-sm">
                      <span className="font-medium">{rsvp.name}</span>
                      <span className="text-gray-500 ml-2">RSVP'd for Wednesday class</span>
                    </div>
                  )) || <p className="text-sm text-gray-500">No recent RSVPs</p>}
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Popular Guides</h3>
                <p className="text-sm text-gray-600 mb-4">Best selling fitness guides</p>
                <div className="space-y-2">
                  {Array.isArray(data?.guides) && data.guides.length > 0 ? (
                    data.guides.slice(0, 3).map((guide) => (
                      <div key={guide.id} className="text-sm">
                        <span className="font-medium">{guide.title}</span>
                        <span className="text-gray-500 ml-2">R{guide.price}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No guides available</p>
                  )}
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Quick Stats</h3>
                <p className="text-sm text-gray-600 mb-4">Key metrics at a glance</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Applications:</span>
                    <span className="font-medium">{stats.total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Available Guides:</span>
                    <span className="font-medium">{stats.guides}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Bundle Offers:</span>
                    <span className="font-medium">{stats.bundles}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'rsvps':
        return (
          <RSVPSection
            rsvps={data?.rsvps || []}
            onView={onView}
            onDelete={onDelete}
            onRefresh={onRefresh}
            isRefreshing={isRefreshing}
          />
        );

      case 'coaching':
        return (
          <CoachingSection
            coaching={data?.onlineCoaching || []}
            onView={onView}
            onDelete={onDelete}
            onRefresh={onRefresh}
            isRefreshing={isRefreshing}
          />
        );

      case 'memberships':
        return (
          <MembershipsSection
            memberships={data?.memberships || []}
            onView={onView}
            onDelete={onDelete}
            onRefresh={onRefresh}
            isRefreshing={isRefreshing}
          />
        );

      case 'training':
        return (
          <TrainingSection
            training={data?.personalTraining || []}
            onView={onView}
            onDelete={onDelete}
            onRefresh={onRefresh}
            isRefreshing={isRefreshing}
          />
        );

      case 'guides':
        return (
          <GuidesSection
            guides={data?.guides || []}
            onView={onView}
            onDelete={onDelete}
            onRefresh={onRefresh}
            isRefreshing={isRefreshing}
          />
        );

      case 'bundles':
        return (
          <BundlesSection
            bundles={data?.bundles || []}
            guides={data?.guides || []}
            onView={onView}
            onDelete={onDelete}
            onRefresh={onRefresh}
            isRefreshing={isRefreshing}
          />
        );

      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Section Not Found</h2>
            <p className="text-gray-600">The requested section could not be found.</p>
          </div>
        );
    }
  };

  return (
    <div className="w-full h-full p-4 lg:p-6 bg-gray-50 overflow-auto">
      {renderContent()}
    </div>
  );
}