"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Trash2,
  Users,
  Calendar,
  LogOut,
  UserCheck,
  Dumbbell,
  CreditCard,
} from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

interface RSVP {
  id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  week_of: string;
  created_at: string;
}

interface OnlineCoaching {
  id: number;
  fullName: string;
  email: string;
  whatsapp: string;
  instagram: string;
  age: string;
  fitnessLevel: string;
  goals: string;
  gymAccess: string;
  package: string;
  created_at: string;
}

interface Membership {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  membershipPlan: string;
  additionalServices: string[];
  startDate: string;
  created_at: string;
}

interface PersonalTraining {
  id: number;
  fullName: string;
  whatsapp: string;
  age: string;
  goals: string;
  package: string;
  created_at: string;
}

export function AdminDashboard() {
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [onlineCoaching, setOnlineCoaching] = useState<OnlineCoaching[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [personalTraining, setPersonalTraining] = useState<PersonalTraining[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Wednesday RSVPs
        const { data: rsvpData, error: rsvpError } = await supabase
          .from("wednesday_rsvps")
          .select("*")
          .order("created_at", { ascending: false });

        if (rsvpError) throw rsvpError;

        // Fetch Online Coaching Applications
        const { data: coachingData, error: coachingError } = await supabase
          .from("online_coaching_applications")
          .select("*")
          .order("created_at", { ascending: false });

        if (coachingError) throw coachingError;

        // Fetch Membership Applications
        const { data: membershipData, error: membershipError } = await supabase
          .from("membership_applications")
          .select("*")
          .order("created_at", { ascending: false });

        if (membershipError) throw membershipError;

        // Fetch Personal Training Inquiries
        const { data: trainingData, error: trainingError } = await supabase
          .from("personal_training_inquiries")
          .select("*")
          .order("created_at", { ascending: false });

        if (trainingError) throw trainingError;

        setRsvps(rsvpData || []);
        setOnlineCoaching(coachingData || []);
        setMemberships(membershipData || []);
        setPersonalTraining(trainingData || []);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error(
          "Failed to load data. Please check your database connection."
        );
        setIsLoading(false);
      }
    };

    fetchData();
  }, [supabase]);

  const handleDeleteRsvp = async (id: number, name: string) => {
    try {
      const { error } = await supabase
        .from("wednesday_rsvps")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setRsvps((prev) => prev.filter((rsvp) => rsvp.id !== id));
      toast.success(`${name}'s RSVP has been removed`);
    } catch (error) {
      console.error("Error deleting RSVP:", error);
      toast.error("Failed to delete RSVP");
    }
  };

  const handleDeleteOnlineCoaching = async (id: number, name: string) => {
    try {
      const { error } = await supabase
        .from("online_coaching_applications")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setOnlineCoaching((prev) => prev.filter((item) => item.id !== id));
      toast.success(`${name}'s application has been removed`);
    } catch (error) {
      console.error("Error deleting application:", error);
      toast.error("Failed to delete application");
    }
  };

  const handleDeleteMembership = async (id: number, name: string) => {
    try {
      const { error } = await supabase
        .from("membership_applications")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setMemberships((prev) => prev.filter((item) => item.id !== id));
      toast.success(`${name}'s application has been removed`);
    } catch (error) {
      console.error("Error deleting application:", error);
      toast.error("Failed to delete application");
    }
  };

  const handleDeletePersonalTraining = async (id: number, name: string) => {
    try {
      const { error } = await supabase
        .from("personal_training_inquiries")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setPersonalTraining((prev) => prev.filter((item) => item.id !== id));
      toast.success(`${name}'s inquiry has been removed`);
    } catch (error) {
      console.error("Error deleting inquiry:", error);
      toast.error("Failed to delete inquiry");
    }
  };

  const handleLogout = () => {
    document.cookie =
      "admin-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/login");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getServiceLabel = (serviceId: string) => {
    const serviceMap: { [key: string]: string } = {
      "training-plan": "Training Plan",
      "eating-guide": "Eating Guide",
      "both-guides": "Both Guides",
      "personal-training": "Personal Training",
      none: "None",
    };
    return serviceMap[serviceId] || serviceId;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const totalSignups =
    rsvps.length +
    onlineCoaching.length +
    memberships.length +
    personalTraining.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-primary">Fitness Admin</h1>
              <Badge variant="secondary">Dashboard</Badge>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-transparent"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Signups
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {totalSignups}
              </div>
              <p className="text-xs text-muted-foreground">
                All services combined
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Wednesday RSVPs
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {rsvps.length}
              </div>
              <p className="text-xs text-muted-foreground">This week's class</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Online Coaching
              </CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {onlineCoaching.length}
              </div>
              <p className="text-xs text-muted-foreground">Applications</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Memberships</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {memberships.length}
              </div>
              <p className="text-xs text-muted-foreground">Applications</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="rsvps" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="rsvps" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Wednesday RSVPs</span>
            </TabsTrigger>
            <TabsTrigger
              value="coaching"
              className="flex items-center space-x-2"
            >
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
            <TabsTrigger
              value="training"
              className="flex items-center space-x-2"
            >
              <Dumbbell className="h-4 w-4" />
              <span>Personal Training</span>
            </TabsTrigger>
          </TabsList>

          {/* Wednesday RSVPs Tab */}
          <TabsContent value="rsvps">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Wednesday Class RSVPs</span>
                </CardTitle>
                <CardDescription>
                  Manage attendees for this week's Wednesday fitness class
                </CardDescription>
              </CardHeader>
              <CardContent>
                {rsvps.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No RSVPs yet for this week
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {rsvps.map((rsvp, index) => (
                      <div
                        key={rsvp.id}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          index % 2 === 0 ? "bg-muted/50" : "bg-background"
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div>
                              <h3 className="font-semibold text-card-foreground">
                                {rsvp.first_name} {rsvp.last_name}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {rsvp.phone_number}
                              </p>
                            </div>
                            <div className="hidden sm:block">
                              <Badge variant="outline">
                                Week of {formatDate(rsvp.week_of)}
                              </Badge>
                            </div>
                            <div className="hidden md:block text-sm text-muted-foreground">
                              Registered: {formatTime(rsvp.created_at)}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            handleDeleteRsvp(
                              rsvp.id,
                              `${rsvp.first_name} ${rsvp.last_name}`
                            )
                          }
                          className="flex items-center space-x-1"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="hidden sm:inline">Delete</span>
                        </Button>
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
                <CardTitle className="flex items-center space-x-2">
                  <UserCheck className="h-5 w-5" />
                  <span>Online Coaching Applications</span>
                </CardTitle>
                <CardDescription>
                  Manage 1:1 online coaching applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {onlineCoaching.length === 0 ? (
                  <div className="text-center py-8">
                    <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No online coaching applications yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {onlineCoaching.map((application, index) => (
                      <div
                        key={application.id}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          index % 2 === 0 ? "bg-muted/50" : "bg-background"
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div>
                              <h3 className="font-semibold text-card-foreground">
                                {application.fullName}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {application.email}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {application.whatsapp}
                              </p>
                            </div>
                            <div className="hidden sm:block">
                              <Badge variant="outline">
                                {application.fitnessLevel}
                              </Badge>
                              <Badge variant="secondary" className="ml-2">
                                Age: {application.age}
                              </Badge>
                            </div>
                            <div className="hidden md:block">
                              <p className="text-sm font-medium text-primary">
                                {application.package}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Applied: {formatTime(application.created_at)}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2">
                            <p className="text-sm text-muted-foreground">
                              Goals: {application.goals}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            handleDeleteOnlineCoaching(
                              application.id,
                              application.fullName
                            )
                          }
                          className="flex items-center space-x-1"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="hidden sm:inline">Delete</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Memberships Tab */}
          <TabsContent value="memberships">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Gym Membership Applications</span>
                </CardTitle>
                <CardDescription>
                  Manage gym membership applications and registrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {memberships.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No membership applications yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {memberships.map((membership, index) => (
                      <div
                        key={membership.id}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          index % 2 === 0 ? "bg-muted/50" : "bg-background"
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div>
                              <h3 className="font-semibold text-card-foreground">
                                {membership.fullName}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {membership.email}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {membership.phone}
                              </p>
                            </div>
                            <div className="hidden sm:block">
                              <Badge variant="outline">
                                Start: {membership.startDate}
                              </Badge>
                            </div>
                            <div className="hidden md:block">
                              <p className="text-sm font-medium text-primary">
                                {membership.membershipPlan}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Applied: {formatTime(membership.created_at)}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2">
                            <p className="text-sm text-muted-foreground">
                              Services:{" "}
                              {membership.additionalServices
                                .map((service) => getServiceLabel(service))
                                .join(", ") || "None"}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            handleDeleteMembership(
                              membership.id,
                              membership.fullName
                            )
                          }
                          className="flex items-center space-x-1"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="hidden sm:inline">Delete</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Personal Training Tab */}
          <TabsContent value="training">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Dumbbell className="h-5 w-5" />
                  <span>Personal Training Inquiries</span>
                </CardTitle>
                <CardDescription>
                  Manage personal training session inquiries
                </CardDescription>
              </CardHeader>
              <CardContent>
                {personalTraining.length === 0 ? (
                  <div className="text-center py-8">
                    <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No personal training inquiries yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {personalTraining.map((training, index) => (
                      <div
                        key={training.id}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          index % 2 === 0 ? "bg-muted/50" : "bg-background"
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div>
                              <h3 className="font-semibold text-card-foreground">
                                {training.fullName}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {training.whatsapp}
                              </p>
                            </div>
                            <div className="hidden sm:block">
                              <Badge variant="secondary">
                                Age: {training.age}
                              </Badge>
                            </div>
                            <div className="hidden md:block">
                              <p className="text-sm font-medium text-primary">
                                {training.package}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Inquired: {formatTime(training.created_at)}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2">
                            <p className="text-sm text-muted-foreground">
                              Goals: {training.goals}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            handleDeletePersonalTraining(
                              training.id,
                              training.fullName
                            )
                          }
                          className="flex items-center space-x-1"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="hidden sm:inline">Delete</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
