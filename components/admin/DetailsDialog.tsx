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
      <dd className="col-span-2 whitespace-pre-line">{value}</dd>
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
  const formatCurrency = (amount: number | null | undefined) =>
    typeof amount === "number"
      ? new Intl.NumberFormat("en-ZA", {
          style: "currency",
          currency: "ZAR",
        }).format(amount)
      : "N/A";

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

          {/* --- CHALLENGE DETAILS --- */}
          {type === "challenge" && "payment_reference" in item && (
            <>
              <DetailGroup title="Participant Information" />
              <DetailItem label="Name" value={item.full_name} />
              <DetailItem label="Email" value={item.email} />
              <DetailItem label="WhatsApp" value={item.whatsapp_number} />
              <DetailItem label="Age" value={String(item.age)} />
              <DetailItem
                label="Instagram"
                value={item.instagram_handle || "N/A"}
              />
              <DetailItem label="Guardian Name" value={item.guardian_name} />

              <DetailGroup title="Payment" />
              <DetailItem
                label="Payment Option"
                value={item.payment_option === "member" ? "Member" : "Non-member"}
              />
              <DetailItem label="Base Price" value={formatCurrency(item.base_price)} />
              <DetailItem label="Amount Paid" value={formatCurrency(item.amount_paid)} />
              <DetailItem
                label="Discount Applied"
                value={item.discount_applied ? "Yes" : "No"}
              />
              <DetailItem label="Discount Code" value={item.discount_code} />
              <DetailItem
                label="Discount Amount"
                value={formatCurrency(item.discount_amount)}
              />
              <DetailItem label="Payment Status" value={item.payment_status} />
              <DetailItem label="Payment Reference" value={item.payment_reference} />

              <DetailGroup title="Challenge Profile" />
              <DetailItem label="Goal" value={item.challenge_goal} />
              <DetailItem label="Activity Level" value={item.activity_level} />
              <DetailItem
                label="Dietary Preferences"
                value={item.dietary_preferences?.length ? item.dietary_preferences.join(", ") : "None"}
              />
              <DetailItem label="Foods Disliked" value={item.foods_disliked} />
              <DetailItem label="Medical Conditions" value={item.medical_conditions} />
              <DetailItem label="Alcohol Frequency" value={item.alcohol_frequency} />

              <DetailGroup title="Emergency and Agreement" />
              <DetailItem
                label="Emergency Contact Name"
                value={item.emergency_contact_name}
              />
              <DetailItem
                label="Emergency Contact Number"
                value={item.emergency_contact_number}
              />
              <DetailItem
                label="Terms Accepted"
                value={item.terms_accepted ? "Yes" : "No"}
              />
              <DetailItem
                label="Liability Accepted"
                value={item.liability_accepted ? "Yes" : "No"}
              />
              <DetailItem label="Signature" value={item.agreement_signature} />
              <DetailItem
                label="Agreement Date"
                value={formatDate(item.agreement_date)}
              />
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
                  label="Preferred Start Date"
                  value={(item as any).start_date
                    ? formatDate((item as any).start_date)
                    : (() => {
                        const text = (item as any).additional_info || "";
                        const m = text.match(/Preferred start date:\s*([^\n]+)/i);
                        return m ? m[1] : null;
                      })()}
                />
                <DetailItem
                  label="Additional Info"
                  value={(() => {
                    const text = (item as any).additional_info || "";
                    // Remove any embedded preferred start date line
                    const cleaned = text.replace(/\s*Preferred start date:\s*[^\n]+/i, "").trim();
                    return cleaned || null;
                  })()}
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
