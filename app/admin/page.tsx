"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createBrowserClient } from "@supabase/ssr";

// Import types and components
import {
  RSVP,
  OnlineCoaching,
  Membership,
  PersonalTraining,
  DashboardItem,
} from "@/components/admin/types";
import { DashboardHeader } from "@/components/admin/DashboardHeader";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { DashboardTabs } from "@/components/admin/DashboardTabs";
import { DetailsDialog } from "@/components/admin/DetailsDialog";
import { DashboardLoadingSkeleton } from "@/components/admin/DashboardLoadingSkeleton"; // ✨ Import the skeleton

export default function AdminDashboardPage() {
  // State for data
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [onlineCoaching, setOnlineCoaching] = useState<OnlineCoaching[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [personalTraining, setPersonalTraining] = useState<PersonalTraining[]>(
    []
  );

  // State for UI
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<DashboardItem | null>(null);
  const [dialogType, setDialogType] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchData = async () => {
      // Use Promise.all to fetch data concurrently for faster loading
      const [rsvpRes, coachingRes, membershipRes, trainingRes] =
        await Promise.all([
          supabase
            .from("wednesday_rsvps")
            .select("*")
            .order("created_at", { ascending: false }),
          supabase
            .from("online_coaching_applications")
            .select("*")
            .order("created_at", { ascending: false }),
          supabase
            .from("membership_applications")
            .select("*")
            .order("created_at", { ascending: false }),
          supabase
            .from("personal_training_applications")
            .select("*")
            .order("created_at", { ascending: false }),
        ]);

      if (rsvpRes.error) toast.error("Failed to load RSVPs.");
      else setRsvps(rsvpRes.data || []);

      if (coachingRes.error)
        toast.error("Failed to load Online Coaching applications.");
      else setOnlineCoaching(coachingRes.data || []);

      if (membershipRes.error) toast.error("Failed to load Memberships.");
      else setMemberships(membershipRes.data || []);

      if (trainingRes.error)
        toast.error("Failed to load Personal Training inquiries.");
      else setPersonalTraining(trainingRes.data || []);

      setIsLoading(false);
    };

    fetchData();
  }, [supabase]);

  // --- Handlers ---
  const handleLogout = () => {
    document.cookie =
      "admin-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/login");
  };

  const handleDelete = async (id: number, name: string, type: string) => {
    const tableMap: { [key: string]: string } = {
      rsvp: "wednesday_rsvps",
      coaching: "online_coaching_applications",
      membership: "membership_applications",
      training: "personal_training_applications",
    };
    const tableName = tableMap[type];
    if (!tableName) return;

    try {
      const { error } = await supabase.from(tableName).delete().eq("id", id);
      if (error) throw error;

      // Update state locally to reflect the change immediately
      if (type === "rsvp")
        setRsvps((prev) => prev.filter((item) => item.id !== id));
      if (type === "coaching")
        setOnlineCoaching((prev) => prev.filter((item) => item.id !== id));
      if (type === "membership")
        setMemberships((prev) => prev.filter((item) => item.id !== id));
      if (type === "training")
        setPersonalTraining((prev) => prev.filter((item) => item.id !== id));

      toast.success(`${name}'s entry has been removed.`);
    } catch (error) {
      console.error("Delete Error:", error);
      toast.error("Failed to delete entry.");
    }
  };

  const handleViewMore = (item: DashboardItem, type: string) => {
    setSelectedItem(item);
    setDialogType(type);
    setIsDialogOpen(true);
  };

  // ✨ Use the skeleton component when loading
  if (isLoading) {
    return <DashboardLoadingSkeleton />;
  }

  const stats = {
    total:
      rsvps.length +
      onlineCoaching.length +
      memberships.length +
      personalTraining.length,
    rsvps: rsvps.length,
    coaching: onlineCoaching.length,
    memberships: memberships.length,
  };

  return (
    <div className="min-h-screen bg-background mt-20">
      <DashboardHeader onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardStats stats={stats} />
        <DashboardTabs
          rsvps={rsvps}
          onlineCoaching={onlineCoaching}
          memberships={memberships}
          personalTraining={personalTraining}
          onViewMore={handleViewMore}
          onDelete={handleDelete}
        />
      </main>

      <DetailsDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        item={selectedItem}
        type={dialogType}
      />
    </div>
  );
}
