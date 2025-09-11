"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DashboardItem } from "./types";
import { Badge } from "@/components/ui/badge";

interface DetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  item: DashboardItem | null;
  type: string | null;
}

// Detail item component for consistent styling
const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) => {
  if (!value) return null;
  return (
    <div className="grid grid-cols-3 gap-2 py-2 border-b">
      <dt className="font-semibold text-muted-foreground">{label}</dt>
      <dd className="col-span-2">{value}</dd>
    </div>
  );
};

// Subheading for grouping details
const DetailGroup = ({ title }: { title: string }) => (
  <h3 className="font-bold text-lg mt-4 mb-2 text-primary">{title}</h3>
);

export function DetailsDialog({
  isOpen,
  onOpenChange,
  item,
  type,
}: DetailsDialogProps) {
  if (!item) return null;

  const formatDate = (dateString: string | null) =>
    dateString ? new Date(dateString).toLocaleDateString("en-ZA") : "N/A";
  const formatDateTime = (dateString: string) =>
    new Date(dateString).toLocaleString("en-ZA");

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Full Details</DialogTitle>
          <DialogDescription>
            Complete information for{" "}
            {"full_name" in item
              ? item.full_name
              : `${item.first_name} ${item.last_name}`}
            .
          </DialogDescription>
        </DialogHeader>

        <dl className="py-4 text-sm">
          {/* --- RSVP DETAILS --- */}
          {type === "rsvp" && "first_name" in item && (
            <>
              <DetailItem
                label="Name"
                value={`${item.first_name} ${item.last_name}`}
              />
              <DetailItem label="Phone" value={item.phone_number} />
              <DetailItem label="Week Of" value={formatDate(item.week_of)} />
            </>
          )}

          {/* --- ONLINE COACHING DETAILS --- */}
          {/* FIX: Changed "email" to "instagram" for a unique type guard */}
          {type === "coaching" && "instagram" in item && (
            <>
              <DetailGroup title="Personal Information" />
              <DetailItem label="Name" value={item.full_name} />
              <DetailItem label="Email" value={item.email} />
              <DetailItem label="WhatsApp" value={item.whatsapp} />
              <DetailItem
                label="Instagram"
                value={item.instagram ? `@${item.instagram}` : "N/A"}
              />
              <DetailItem label="Age" value={item.age} />

              <DetailGroup title="Fitness Profile" />
              <DetailItem label="Package" value={item.package} />
              <DetailItem
                label="Start Date"
                value={formatDate(item.start_date)}
              />
              <DetailItem label="Fitness Level" value={item.fitness_level} />
              <DetailItem label="Gym Access" value={item.gym_access} />
              <DetailItem label="Goals" value={item.goals} />
              <DetailItem
                label="Dietary Restrictions"
                value={item.dietary_restrictions}
              />
              <DetailItem
                label="Additional Info"
                value={item.additional_info}
              />
            </>
          )}

          {/* --- MEMBERSHIP DETAILS --- */}
          {type === "membership" && "membership_plan" in item && (
            <>
              <DetailGroup title="Personal Information" />
              <DetailItem label="Name" value={item.full_name} />
              <DetailItem
                label="Date of Birth"
                value={formatDate(item.date_of_birth)}
              />
              <DetailItem label="Email" value={item.email} />
              <DetailItem label="Phone" value={item.phone} />
              <DetailItem label="Address" value={item.address} />

              <DetailGroup title="Emergency Contact" />
              <DetailItem label="Contact Name" value={item.emergency_name} />
              <DetailItem label="Contact Phone" value={item.emergency_phone} />
              <DetailItem
                label="Relationship"
                value={item.emergency_relationship}
              />

              <DetailGroup title="Membership Details" />
              <DetailItem label="Plan" value={item.membership_plan} />
              <DetailItem
                label="Start Date"
                value={formatDate(item.start_date)}
              />
              <div className="py-2 border-b">
                <dt className="font-semibold text-muted-foreground">Add-ons</dt>
                <dd className="flex flex-wrap gap-2 mt-1">
                  {item.additional_services?.map((s) => (
                    <Badge key={s} variant="secondary">
                      {s}
                    </Badge>
                  ))}
                </dd>
              </div>
              <DetailItem
                label="Medical Conditions"
                value={item.medical_conditions}
              />
              <DetailItem label="Heard About Us Via" value={item.hear_about} />
            </>
          )}

          {/* --- PERSONAL TRAINING DETAILS --- */}
          {type === "training" &&
            "package" in item &&
            !("instagram" in item) && (
              <>
                <DetailGroup title="Client Information" />
                <DetailItem label="Name" value={item.full_name} />
                <DetailItem label="WhatsApp" value={item.whatsapp} />
                <DetailItem label="Age" value={item.age} />

                <DetailGroup title="Training Goals" />
                <DetailItem label="Package" value={item.package} />
                <DetailItem label="Goals" value={item.goals} />
                <DetailItem
                  label="Additional Info"
                  value={item.additional_info}
                />
              </>
            )}

          <div className="pt-4 mt-4 border-t">
            <DetailItem
              label="Submitted At"
              value={formatDateTime(item.created_at)}
            />
          </div>
        </dl>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
