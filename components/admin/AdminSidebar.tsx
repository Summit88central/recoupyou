"use client";

import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  UserCheck,
  CreditCard,
  Dumbbell,
  BookOpen,
  Package,
  Trophy,
  BarChart3,
  LogOut,
  Menu,
  X,
  Loader2
} from 'lucide-react';

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
  stats: {
    rsvps: number;
    coaching: number;
    memberships: number;
    personalTraining: number;
    challenges: number;
    guides: number;
    bundles: number;
  };
  isMobileOpen: boolean;
  onMobileToggle: () => void;
  isLoggingOut?: boolean;
}

const sidebarItems = [
  {
    id: 'overview',
    label: 'Overview',
    icon: BarChart3,
    description: 'Dashboard overview'
  },
  {
    id: 'rsvps',
    label: 'Wednesday RSVPs',
    icon: Calendar,
    description: 'Class attendees',
    statKey: 'rsvps' as const
  },
  {
    id: 'coaching',
    label: 'Online Coaching',
    icon: UserCheck,
    description: 'Coaching applications',
    statKey: 'coaching' as const
  },
  {
    id: 'memberships',
    label: 'Memberships',
    icon: CreditCard,
    description: 'Gym memberships',
    statKey: 'memberships' as const
  },
  {
    id: 'training',
    label: 'Personal Training',
    icon: Dumbbell,
    description: 'Training applications',
    statKey: 'personalTraining' as const
  },
  {
    id: 'challenges',
    label: 'Challenges',
    icon: Trophy,
    description: 'Paid challenge signups',
    statKey: 'challenges' as const
  },
  {
    id: 'guides',
    label: 'Guides',
    icon: BookOpen,
    description: 'Fitness guides',
    statKey: 'guides' as const
  },
  {
    id: 'bundles',
    label: 'Bundles',
    icon: Package,
    description: 'Guide bundles',
    statKey: 'bundles' as const
  }
];

export function AdminSidebar({
  activeSection,
  onSectionChange,
  onLogout,
  stats,
  isMobileOpen,
  onMobileToggle,
  isLoggingOut = false
}: AdminSidebarProps) {
  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen) {
        onMobileToggle();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobileOpen, onMobileToggle]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileOpen]);

  return (
    <>
      {/* Mobile Overlay - Only show on mobile screens when menu is open */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-white/10 backdrop-blur-sm z-40 lg:hidden"
          onClick={onMobileToggle}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "bg-white border-r border-gray-200 transition-all duration-300 flex flex-col",
        // Desktop: Always visible, fixed width, full height
        "lg:flex lg:w-64 lg:h-full lg:relative",
        // Mobile: Hidden by default, overlay when open
        "fixed inset-y-0 left-0 z-50 w-64 h-full",
        // Show/hide logic
        isMobileOpen ? "flex lg:flex" : "hidden lg:flex"
      )}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl font-bold text-pink-600">RY</div>
              <Badge variant="secondary">Admin</Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onMobileToggle}
              className="p-2 lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            const count = item.statKey ? stats[item.statKey] : undefined;

            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start h-auto p-3",
                  isActive && "bg-pink-600 hover:bg-pink-700 text-white",
                  !isActive && "hover:bg-gray-100"
                )}
                onClick={() => {
                  onSectionChange(item.id);
                  // Close mobile menu when item is selected
                  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                    onMobileToggle();
                  }
                }}
              >
                <Icon className="h-5 w-5 mr-3" />
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{item.label}</span>
                    {count !== undefined && count > 0 && (
                      <Badge 
                        variant={isActive ? "secondary" : "outline"}
                        className={cn(
                          "ml-2",
                          isActive && "bg-white/20 text-white border-white/30"
                        )}
                      >
                        {count}
                      </Badge>
                    )}
                  </div>
                  <div className={cn(
                    "text-xs mt-1",
                    isActive ? "text-white/80" : "text-gray-500"
                  )}>
                    {item.description}
                  </div>
                </div>
              </Button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onLogout}
            className="w-full justify-start"
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4 mr-2" />
            )}
            {isLoggingOut ? "Logging out..." : "Logout"}
          </Button>
        </div>
      </div>
    </>
  );
}
