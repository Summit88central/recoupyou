"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminContent } from "@/components/admin/AdminContent";
import { DetailsDialog } from "@/components/admin/DetailsDialog";
import { DashboardLoadingSkeleton } from "@/components/admin/DashboardLoadingSkeleton";
import { ConfirmationDialog } from "@/components/admin/ConfirmationDialog";

// Types
interface RSVP {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
}

interface OnlineCoaching {
  id: string;
  name: string;
  email: string;
  phone: string;
  goal: string;
  experience: string;
  created_at: string;
}

interface Membership {
  id: string;
  name: string;
  email: string;
  phone: string;
  membership_type: string;
  created_at: string;
}

interface PersonalTraining {
  id: string;
  name: string;
  email: string;
  phone: string;
  goal: string;
  experience: string;
  created_at: string;
}

interface Guide {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  pdf_url: string;
  created_at: string;
}

interface Bundle {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  guide1_id: string;
  guide2_id: string;
  created_at: string;
}

interface DeleteConfirmation {
  isOpen: boolean;
  id: string;
  type: string;
  title: string;
  description: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [onlineCoaching, setOnlineCoaching] = useState<OnlineCoaching[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [personalTraining, setPersonalTraining] = useState<PersonalTraining[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [dialogType, setDialogType] = useState<string>("");
  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmation>({
    isOpen: false,
    id: "",
    type: "",
    title: "",
    description: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      
      // Use the imported supabase client

      // Fetch all data concurrently
      const [
        rsvpData,
        coachingData,
        membershipData,
        trainingData,
        guidesResponse,
        bundlesResponse,
      ] = await Promise.all([
        supabase.from("wednesday_rsvps").select("*").order("created_at", { ascending: false }),
        supabase.from("online_coaching_applications").select("*").order("created_at", { ascending: false }),
        supabase.from("membership_applications").select("*").order("created_at", { ascending: false }),
        supabase.from("personal_training_applications").select("*").order("created_at", { ascending: false }),
        fetch("/api/guides"),
        fetch("/api/bundles"),
      ]);

      // Set Supabase data
      if (rsvpData.data) setRsvps(rsvpData.data);
      if (coachingData.data) setOnlineCoaching(coachingData.data);
      if (membershipData.data) setMemberships(membershipData.data);
      if (trainingData.data) setPersonalTraining(trainingData.data);

      // Set API data
      if (guidesResponse.ok) {
        const guidesData = await guidesResponse.json();
        setGuides(guidesData.guides || []);
      }

      if (bundlesResponse.ok) {
        const bundlesData = await bundlesResponse.json();
        setBundles(bundlesData.bundles || []);
      }

      if (showRefreshLoader) {
        toast.success("Dashboard data refreshed successfully");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch dashboard data");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      router.push("/");
    } catch (error) {
      console.error('Error during logout:', error);
      router.push("/");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleView = (item: any, type: string) => {
    setSelectedItem(item);
    setDialogType(type);
  };

  const handleRefresh = () => {
    fetchData(true);
  };

  const getItemName = (item: any, type: string): string => {
    switch (type) {
      case "guide":
        return item.title;
      case "bundle":
        return item.name;
      case "rsvp":
      case "coaching":
      case "membership":
      case "training":
        return item.name;
      default:
        return "this item";
    }
  };

  const getDeleteDescription = (type: string): string => {
    switch (type) {
      case "guide":
        return "This will permanently delete the guide and all associated data. This action cannot be undone.";
      case "bundle":
        return "This will permanently delete the bundle and all associated data. This action cannot be undone.";
      case "rsvp":
        return "This will permanently delete the RSVP entry. This action cannot be undone.";
      case "coaching":
        return "This will permanently delete the online coaching entry. This action cannot be undone.";
      case "membership":
        return "This will permanently delete the membership entry. This action cannot be undone.";
      case "training":
        return "This will permanently delete the personal training entry. This action cannot be undone.";
      default:
        return "This will permanently delete the item. This action cannot be undone.";
    }
  };

  const handleDeleteClick = (id: string, name: string, type: string) => {
    setDeleteConfirmation({
      isOpen: true,
      id,
      type,
      title: `Delete ${type === "rsvp" ? "RSVP" : type === "coaching" ? "Online Coaching Entry" : type === "membership" ? "Membership" : type === "training" ? "Personal Training Entry" : type.charAt(0).toUpperCase() + type.slice(1)}`,
      description: `Are you sure you want to delete "${name}"? ${getDeleteDescription(type)}`,
    });
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      const { id, type } = deleteConfirmation;
      
      // Use the imported supabase client

      switch (type) {
        case "guide":
          const guideResponse = await fetch(`/api/guides/${id}`, {
            method: "DELETE",
          });
          if (!guideResponse.ok) {
            const errorData = await guideResponse.json();
            throw new Error(errorData.error || "Failed to delete guide");
          }
          setGuides(guides.filter((guide) => guide.id !== id));
          toast.success("Guide deleted successfully");
          break;

        case "bundle":
          const bundleResponse = await fetch(`/api/bundles/${id}`, {
            method: "DELETE",
          });
          if (!bundleResponse.ok) {
            const errorData = await bundleResponse.json();
            throw new Error(errorData.error || "Failed to delete bundle");
          }
          setBundles(bundles.filter((bundle) => bundle.id !== id));
          toast.success("Bundle deleted successfully");
          break;

        case "rsvp":
          const { error: rsvpError } = await supabase
            .from("wednesday_rsvps")
            .delete()
            .eq("id", id);
          if (rsvpError) throw rsvpError;
          setRsvps(rsvps.filter((rsvp) => rsvp.id !== id));
          toast.success("RSVP deleted successfully");
          break;

        case "coaching":
          const { error: coachingError } = await supabase
            .from("online_coaching_applications")
            .delete()
            .eq("id", id);
          if (coachingError) throw coachingError;
          setOnlineCoaching(onlineCoaching.filter((coaching) => coaching.id !== id));
          toast.success("Online coaching entry deleted successfully");
          break;

        case "membership":
          const { error: membershipError } = await supabase
            .from("membership_applications")
            .delete()
            .eq("id", id);
          if (membershipError) throw membershipError;
          setMemberships(memberships.filter((membership) => membership.id !== id));
          toast.success("Membership deleted successfully");
          break;

        case "training":
          const { error: trainingError } = await supabase
            .from("personal_training_applications")
            .delete()
            .eq("id", id);
          if (trainingError) throw trainingError;
          setPersonalTraining(personalTraining.filter((training) => training.id !== id));
          toast.success("Personal training entry deleted successfully");
          break;

        default:
          throw new Error("Unknown item type");
      }

      setDeleteConfirmation({
        isOpen: false,
        id: "",
        type: "",
        title: "",
        description: "",
      });
    } catch (error) {
      console.error("Delete Error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete item");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <DashboardLoadingSkeleton />;
  }

  const stats = {
    total: rsvps.length + onlineCoaching.length + memberships.length + personalTraining.length,
    rsvps: rsvps.length,
    coaching: onlineCoaching.length,
    memberships: memberships.length,
    personalTraining: personalTraining.length,
    guides: guides.length,
    bundles: bundles.length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Header with Hamburger Menu */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl font-bold text-pink-600">RY</div>
            <span className="text-sm font-medium text-gray-600">Admin Dashboard</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex h-screen">
        <AdminSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onLogout={handleLogout}
          stats={stats}
          isMobileOpen={isMobileMenuOpen}
          onMobileToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isLoggingOut={isLoggingOut}
        />
        
        <main className="flex-1 pt-16 lg:pt-0 overflow-hidden">
          <AdminContent
            activeSection={activeSection}
            data={{
              rsvps,
              onlineCoaching,
              memberships,
              personalTraining,
              guides,
              bundles
            }}
            stats={stats}
            onView={handleView}
            onDelete={handleDeleteClick}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />
        </main>
      </div>

      <DetailsDialog
        item={selectedItem}
        type={dialogType}
        isOpen={!!selectedItem}
        onOpenChange={(open) => !open && setSelectedItem(null)}
      />

      <ConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        onOpenChange={(open) => 
          setDeleteConfirmation(prev => ({ ...prev, isOpen: open }))
        }
        title={deleteConfirmation.title}
        description={deleteConfirmation.description}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        variant="destructive"
      />
    </div>
  );
}
