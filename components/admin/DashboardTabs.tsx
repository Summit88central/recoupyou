"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  UserCheck,
  CreditCard,
  Dumbbell,
  Trash2,
  Info,
} from "lucide-react";
import {
  RSVP,
  OnlineCoaching,
  Membership,
  PersonalTraining,
  DashboardItem,
} from "./types";

// Props for the entire component
interface DashboardTabsProps {
  rsvps: RSVP[];
  onlineCoaching: OnlineCoaching[];
  memberships: Membership[];
  personalTraining: PersonalTraining[];
  onViewMore: (item: DashboardItem, type: string) => void;
  onDelete: (id: number, name: string, type: string) => void;
}

export function DashboardTabs({
  rsvps,
  onlineCoaching,
  memberships,
  personalTraining,
  onViewMore,
  onDelete,
}: DashboardTabsProps) {
  return (
    <Tabs defaultValue="rsvps" className="space-y-6">
      <div className="w-full overflow-x-auto pb-2">
        <TabsList className="grid w-max grid-cols-4">
          <TabsTrigger value="rsvps" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Wednesday RSVPs</span>
          </TabsTrigger>
          <TabsTrigger value="coaching" className="flex items-center space-x-2">
            <UserCheck className="h-4 w-4" />
            <span>Online Coaching</span>
          </TabsTrigger>
          <TabsTrigger
            value="memberships"
            className="flex items-center space-x-2"
          >
            <CreditCard className="h-4 w-4" />
            <span>Memberships</span>
          </TabsTrigger>
          <TabsTrigger value="training" className="flex items-center space-x-2">
            <Dumbbell className="h-4 w-4" />
            <span>Personal Training</span>
          </TabsTrigger>
        </TabsList>
      </div>

      {/* Wednesday RSVPs Tab */}
      <TabsContent value="rsvps">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" /> Wednesday Class RSVPs
            </CardTitle>
            <CardDescription>
              Manage attendees for this week's class.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {rsvps.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No RSVPs yet.
              </p>
            ) : (
              <div className="space-y-4">
                {rsvps.map((rsvp, index) => (
                  <div
                    key={rsvp.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      index % 2 === 0 ? "bg-muted/50" : ""
                    }`}
                  >
                    <div className="flex-1 mr-4">
                      <h3 className="font-semibold">
                        {rsvp.first_name} {rsvp.last_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {rsvp.phone_number}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewMore(rsvp, "rsvp")}
                        className="flex items-center gap-1"
                      >
                        <Info className="h-4 w-4" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          onDelete(
                            rsvp.id,
                            `${rsvp.first_name} ${rsvp.last_name}`,
                            "rsvp"
                          )
                        }
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
      </TabsContent>

      {/* Online Coaching Tab */}
      <TabsContent value="coaching">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" /> Online Coaching Applications
            </CardTitle>
            <CardDescription>
              Manage 1:1 online coaching applications.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {onlineCoaching.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No applications yet.
              </p>
            ) : (
              <div className="space-y-4">
                {onlineCoaching.map((app, index) => (
                  <div
                    key={app.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      index % 2 === 0 ? "bg-muted/50" : ""
                    }`}
                  >
                    <div className="flex-1 mr-4">
                      <h3 className="font-semibold">{app.full_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {app.email}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewMore(app, "coaching")}
                        className="flex items-center gap-1"
                      >
                        <Info className="h-4 w-4" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          onDelete(app.id, app.full_name, "coaching")
                        }
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
      </TabsContent>

      {/* ✨ START: Added Missing Memberships Tab */}
      <TabsContent value="memberships">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" /> Gym Membership Applications
            </CardTitle>
            <CardDescription>Manage new member applications.</CardDescription>
          </CardHeader>
          <CardContent>
            {memberships.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No membership applications yet.
              </p>
            ) : (
              <div className="space-y-4">
                {memberships.map((membership, index) => (
                  <div
                    key={membership.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      index % 2 === 0 ? "bg-muted/50" : ""
                    }`}
                  >
                    <div className="flex-1 mr-4">
                      <h3 className="font-semibold">{membership.full_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {membership.email}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewMore(membership, "membership")}
                        className="flex items-center gap-1"
                      >
                        <Info className="h-4 w-4" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          onDelete(
                            membership.id,
                            membership.full_name,
                            "membership"
                          )
                        }
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
      </TabsContent>
      {/* ✨ END: Added Missing Memberships Tab */}

      {/* ✨ START: Added Missing Personal Training Tab */}
      <TabsContent value="training">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5" /> Personal Training Inquiries
            </CardTitle>
            <CardDescription>
              Manage new client inquiries for personal training.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {personalTraining.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No personal training inquiries yet.
              </p>
            ) : (
              <div className="space-y-4">
                {personalTraining.map((training, index) => (
                  <div
                    key={training.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      index % 2 === 0 ? "bg-muted/50" : ""
                    }`}
                  >
                    <div className="flex-1 mr-4">
                      <h3 className="font-semibold">{training.full_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {training.whatsapp}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewMore(training, "training")}
                        className="flex items-center gap-1"
                      >
                        <Info className="h-4 w-4" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          onDelete(training.id, training.full_name, "training")
                        }
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
      </TabsContent>
      {/* ✨ END: Added Missing Personal Training Tab */}
    </Tabs>
  );
}
