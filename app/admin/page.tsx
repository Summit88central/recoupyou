"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import {
  ChevronRight,
  Calendar,
  Laptop,
  Dumbbell,
  IdCard,
  Trash2,
  ChevronDown,
  LogOut,
  Loader2,
} from "lucide-react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Client {
  id: number;
  [key: string]: any;
}

const categories = ["wednesday", "coaching", "personal", "membership"] as const;
type Category = (typeof categories)[number];

const tableMap: Record<Category, string> = {
  wednesday: "wednesday_rsvps",
  coaching: "online_coaching_applications",
  personal: "personal_training_applications",
  membership: "membership_applications",
};

export default function ClientAdmin() {
  const [clients, setClients] = useState<Record<Category, Client[]>>({
    wednesday: [],
    coaching: [],
    personal: [],
    membership: [],
  });
  const [counts, setCounts] = useState<Record<Category, number>>({
    wednesday: 0,
    coaching: 0,
    personal: 0,
    membership: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const detailRefs = useRef<
    Record<
      string,
      { input: HTMLInputElement | null; details: HTMLElement | null }
    >
  >({});

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const newClients: Partial<Record<Category, Client[]>> = {};
      for (const category of categories) {
        const { data, error } = await supabase
          .from(tableMap[category])
          .select("*");
        if (error) {
          console.error(`Error fetching ${category}:`, error);
          newClients[category] = [];
        } else {
          newClients[category] = data || [];
        }
      }
      setClients(newClients as Record<Category, Client[]>);
      setIsLoading(false);
    }
    init();
  }, [router]);

  useEffect(() => {
    const newCounts: Partial<Record<Category, number>> = {};
    for (const category of categories) {
      newCounts[category] = clients[category].length;
    }
    setCounts(newCounts as Record<Category, number>);
  }, [clients]);

  async function handleDelete(category: Category, id: number) {
    const table = tableMap[category];
    const ok = confirm("Delete this client? This action cannot be undone.");
    if (!ok) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) {
      console.error("Delete error:", error);
      alert("Failed to delete client.");
      return;
    }
    setClients((prev) => ({
      ...prev,
      [category]: prev[category].filter((c) => c.id !== id),
    }));
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error);
      alert("Failed to log out.");
      setIsLoggingOut(false);
      return;
    }
    router.push("/login");
  }

  function getClientName(client: Client, category: Category) {
    if (category === "wednesday") {
      return `${client.first_name} ${client.last_name}`;
    }
    return client.full_name;
  }

  function getClientImage(name: string) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=fc9dca&color=fff&size=256`;
  }

  function getClientDetailsList(
    client: Client,
    category: Category
  ): { label: string; value: string }[] {
    const list: { label: string; value: string }[] = [];
    const formatDate = (d: string | Date | null) =>
      d
        ? new Date(d).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })
        : "N/A";

    switch (category) {
      case "wednesday":
        list.push(
          { label: "First Name", value: client.first_name || "N/A" },
          { label: "Last Name", value: client.last_name || "N/A" },
          { label: "Phone Number", value: client.phone_number || "N/A" },
          { label: "Week Of", value: formatDate(client.week_of) },
          { label: "Created At", value: formatDate(client.created_at) },
          { label: "Status", value: "Confirmed" }
        );
        break;
      case "coaching":
        list.push(
          { label: "Full Name", value: client.full_name || "N/A" },
          { label: "Email", value: client.email || "N/A" },
          { label: "WhatsApp", value: client.whatsapp || "N/A" },
          { label: "Instagram", value: client.instagram || "N/A" },
          { label: "Age", value: client.age || "N/A" },
          { label: "Fitness Level", value: client.fitness_level || "N/A" },
          { label: "Goals", value: client.goals || "N/A" },
          { label: "Gym Access", value: client.gym_access || "N/A" },
          {
            label: "Dietary Restrictions",
            value: client.dietary_restrictions || "N/A",
          },
          { label: "Package", value: client.package || "N/A" },
          { label: "Start Date", value: formatDate(client.start_date) },
          { label: "Additional Info", value: client.additional_info || "N/A" },
          { label: "Created At", value: formatDate(client.created_at) },
          { label: "Status", value: "Active" }
        );
        break;
      case "personal":
        list.push(
          { label: "Full Name", value: client.full_name || "N/A" },
          { label: "WhatsApp", value: client.whatsapp || "N/A" },
          { label: "Age", value: client.age || "N/A" },
          { label: "Goals", value: client.goals || "N/A" },
          { label: "Package", value: client.package || "N/A" },
          { label: "Additional Info", value: client.additional_info || "N/A" },
          { label: "Created At", value: formatDate(client.created_at) },
          { label: "Status", value: "Active" }
        );
        break;
      case "membership":
        list.push(
          { label: "Full Name", value: client.full_name || "N/A" },
          { label: "Date of Birth", value: formatDate(client.date_of_birth) },
          { label: "Address", value: client.address || "N/A" },
          { label: "Phone", value: client.phone || "N/A" },
          { label: "Email", value: client.email || "N/A" },
          { label: "Emergency Name", value: client.emergency_name || "N/A" },
          { label: "Emergency Phone", value: client.emergency_phone || "N/A" },
          {
            label: "Emergency Relationship",
            value: client.emergency_relationship || "N/A",
          },
          {
            label: "Medical Conditions",
            value: client.medical_conditions || "N/A",
          },
          { label: "Membership Plan", value: client.membership_plan || "N/A" },
          {
            label: "Additional Services",
            value: client.additional_services
              ? client.additional_services.join(", ")
              : "N/A",
          },
          { label: "Start Date", value: formatDate(client.start_date) },
          { label: "Hear About", value: client.hear_about || "N/A" },
          { label: "Created At", value: formatDate(client.created_at) },
          { label: "Status", value: "Active" }
        );
        break;
    }
    return list;
  }

  function toggleDetails(uniqueId: string, checked: boolean) {
    const ref = detailRefs.current[uniqueId];
    if (ref?.input && ref?.details) {
      ref.input.checked = checked;
      ref.details.style.maxHeight = checked
        ? `${ref.details.scrollHeight}px`
        : "0px";
    }
  }

  useEffect(() => {
    // Initialize maxHeight to 0 for all details on mount or clients change
    Object.keys(detailRefs.current).forEach((uniqueId) => {
      const ref = detailRefs.current[uniqueId];
      if (ref?.details && !ref.input?.checked) {
        ref.details.style.maxHeight = "0px";
      }
    });
  }, [clients]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white text-slate-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#fc9dca]"></div>
      </div>
    );
  }

  return (
    <div className="mt-16 min-h-screen bg-white text-slate-900 antialiased selection:bg-[#fc9dca]/30 selection:text-slate-900">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Logo + Title */}
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-md bg-[#fc9dca] text-white grid place-items-center shadow-sm ring-1 ring-[#fc9dca]/50">
                <span className="text-sm font-semibold tracking-tight">AC</span>
              </div>
              <div>
                <h1 className="text-[22px] sm:text-2xl md:text-[28px] font-semibold tracking-tight leading-none">
                  Client Admin
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  Manage clients across categories
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:border-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fc9dca] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                title="Log out"
              >
                {isLoggingOut ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <LogOut size={16} />
                )}
                {isLoggingOut ? "Logging out..." : "Log out"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Overview Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden cursor-pointer">
            <div className="h-1.5 bg-[#fc9dca]" />
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 grid place-items-center rounded-md bg-[#fc9dca]/10 text-[#fc9dca] ring-1 ring-inset ring-[#fc9dca]/30">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-[13px] text-slate-500">Wednesday RSVP</p>
                  <p className="text-xl font-semibold tracking-tight">
                    {counts.wednesday} clients
                  </p>
                </div>
              </div>
              <ChevronRight className="text-slate-400" size={18} />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden cursor-pointer">
            <div className="h-1.5 bg-[#fc9dca]" />
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 grid place-items-center rounded-md bg-[#fc9dca]/10 text-[#fc9dca] ring-1 ring-inset ring-[#fc9dca]/30">
                  <Laptop size={18} />
                </div>
                <div>
                  <p className="text-[13px] text-slate-500">Online Coaching</p>
                  <p className="text-xl font-semibold tracking-tight">
                    {counts.coaching} clients
                  </p>
                </div>
              </div>
              <ChevronRight className="text-slate-400" size={18} />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden cursor-pointer">
            <div className="h-1.5 bg-[#fc9dca]" />
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 grid place-items-center rounded-md bg-[#fc9dca]/10 text-[#fc9dca] ring-1 ring-inset ring-[#fc9dca]/30">
                  <Dumbbell size={18} />
                </div>
                <div>
                  <p className="text-[13px] text-slate-500">
                    Personal Training
                  </p>
                  <p className="text-xl font-semibold tracking-tight">
                    {counts.personal} clients
                  </p>
                </div>
              </div>
              <ChevronRight className="text-slate-400" size={18} />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden cursor-pointer">
            <div className="h-1.5 bg-[#fc9dca]" />
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 grid place-items-center rounded-md bg-[#fc9dca]/10 text-[#fc9dca] ring-1 ring-inset ring-[#fc9dca]/30">
                  <IdCard size={18} />
                </div>
                <div>
                  <p className="text-[13px] text-slate-500">Gym Membership</p>
                  <p className="text-xl font-semibold tracking-tight">
                    {counts.membership} clients
                  </p>
                </div>
              </div>
              <ChevronRight className="text-slate-400" size={18} />
            </div>
          </div>
        </section>

        {/* Lists */}
        <section className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
          {categories.map((category) => (
            <div
              key={category}
              className="rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-md bg-[#fc9dca]/10 text-[#fc9dca] px-2.5 py-1 text-xs font-medium ring-1 ring-inset ring-[#fc9dca]/30">
                    {category === "wednesday" && <Calendar size={14} />}
                    {category === "coaching" && <Laptop size={14} />}
                    {category === "personal" && <Dumbbell size={14} />}
                    {category === "membership" && <IdCard size={14} />}
                    {category.charAt(0).toUpperCase() +
                      category.slice(1).replace(/([A-Z])/g, " $1")}
                  </span>
                  <span className="text-xs text-slate-500">
                    •{" "}
                    <span className="font-medium text-slate-700">
                      {counts[category]}
                    </span>{" "}
                    clients
                  </span>
                </div>
              </div>
              <ul className="divide-y divide-slate-200">
                {clients[category].map((client) => {
                  const name = getClientName(client, category);
                  const uniqueId = `${category.charAt(0)}${client.id}`;
                  const detailsList = getClientDetailsList(client, category);
                  const imageUrl = getClientImage(name);

                  return (
                    <li key={uniqueId} className="p-4">
                      <div className="flex items-start gap-4">
                        <img
                          src={imageUrl}
                          alt={name}
                          className="h-10 w-10 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="truncate font-medium">{name}</p>
                            <div className="flex items-center gap-2">
                              <div className="relative">
                                <input
                                  id={uniqueId}
                                  type="checkbox"
                                  className="peer absolute inset-0 h-0 w-0 opacity-0"
                                  ref={(el) => {
                                    if (el) {
                                      detailRefs.current[uniqueId] = {
                                        ...detailRefs.current[uniqueId],
                                        input: el,
                                      };
                                    }
                                  }}
                                  onChange={(e) =>
                                    toggleDetails(uniqueId, e.target.checked)
                                  }
                                />
                                <label
                                  htmlFor={uniqueId}
                                  className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 hover:border-slate-300 cursor-pointer select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fc9dca]"
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                      e.preventDefault();
                                      const input =
                                        detailRefs.current[uniqueId]?.input;
                                      if (input) {
                                        input.checked = !input.checked;
                                        toggleDetails(uniqueId, input.checked);
                                      }
                                    }
                                  }}
                                >
                                  <ChevronDown
                                    className="transition-transform duration-300 peer-checked:rotate-180 text-slate-500"
                                    size={16}
                                  />
                                  <span>
                                    <span className="peer-checked:hidden">
                                      View details
                                    </span>
                                    <span className="hidden peer-checked:inline">
                                      Hide details
                                    </span>
                                  </span>
                                </label>
                              </div>
                              <button
                                onClick={() =>
                                  handleDelete(category, client.id)
                                }
                                className="inline-flex items-center gap-1.5 rounded-md border border-red-200/70 bg-white px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 hover:border-red-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400 cursor-pointer"
                              >
                                <Trash2 size={16} />
                                Delete
                              </button>
                            </div>
                          </div>
                          <div
                            className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-hidden transition-all duration-300 max-h-0"
                            ref={(el) => {
                              if (el) {
                                detailRefs.current[uniqueId] = {
                                  ...detailRefs.current[uniqueId],
                                  details: el,
                                };
                                el.style.maxHeight = "0px"; // Ensure initially collapsed
                              }
                            }}
                          >
                            {detailsList.map((item, index) => (
                              <div
                                key={index}
                                className="text-sm text-slate-600"
                              >
                                <p>
                                  <span className="text-slate-500">
                                    {item.label}:
                                  </span>{" "}
                                  {item.value}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
                {clients[category].length === 0 && (
                  <li className="p-6 text-center text-sm text-slate-500">
                    <div className="inline-flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2 ring-1 ring-inset ring-slate-200">
                      No clients found in{" "}
                      {category.charAt(0).toUpperCase() +
                        category.slice(1).replace(/([A-Z])/g, " $1")}
                      .
                    </div>
                  </li>
                )}
              </ul>
            </div>
          ))}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} Client Admin — Built with TailwindCSS and
          Lucide icons
        </div>
      </footer>
    </div>
  );
}
