"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, LogOut, Lock, Users, CalendarDays } from "lucide-react";

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

enum AuthState {
  LOADING = "loading",
  UNAUTHENTICATED = "unauthenticated",
  AUTHENTICATED = "authenticated",
}

export default function RSVPDashboard() {
  const [authState, setAuthState] = useState<AuthState>(AuthState.LOADING);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUserStatus = async (sessionUser: any) => {
      if (!sessionUser) {
        setUser(null);
        setAuthState(AuthState.UNAUTHENTICATED);
        return;
      }
      setUser(sessionUser);
      setAuthState(AuthState.AUTHENTICATED);
    };

    const initializeAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      await checkUserStatus(session?.user);
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      checkUserStatus(session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  switch (authState) {
    case AuthState.LOADING:
      return <LoadingScreen />;
    case AuthState.UNAUTHENTICATED:
      return <LoginPage />;
    case AuthState.AUTHENTICATED:
      return <AuthenticatedDashboard user={user} />;
    default:
      return <LoadingScreen />;
  }
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#fc9dca] border-b-2"></div>
    </div>
  );
}

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) setError(error.message);
    } catch {
      setError("Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 p-6">
      <Card className="w-full max-w-md shadow-lg rounded-2xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold text-gray-900">
            RSVP Admin Login
          </CardTitle>
          <p className="text-gray-500 text-sm">
            Sign in to manage Wednesday RSVPs
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label>Password</Label>
              <div className="relative mt-1">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-12"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-600">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            <Button
              type="submit"
              className="w-full h-11 rounded-lg bg-[#fc9dca] text-white font-semibold hover:bg-pink-500 transition"
              disabled={loading}
            >
              {loading ? (
                "Signing in..."
              ) : (
                <>
                  <Lock className="w-5 h-5 mr-2" /> Sign In
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function AuthenticatedDashboard({ user }: { user: any }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await supabase.auth.signOut();
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white shadow rounded-xl p-4">
          <h1 className="text-2xl font-bold text-gray-900">
            🎉 Wednesday RSVPs
          </h1>
          <div className="flex items-center gap-3 mt-4 sm:mt-0">
            <span className="text-sm text-gray-600">{user.email}</span>
            <Button
              variant="outline"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="h-10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {isLoggingOut ? "Signing out..." : "Sign Out"}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <StatsCard />

        {/* RSVP Table */}
        <Card className="shadow-lg rounded-xl">
          <CardHeader className="flex flex-col sm:flex-row justify-between items-center">
            <CardTitle className="text-lg font-semibold text-gray-900">
              RSVP List
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RSVPTable />
          </CardContent>
        </Card>

        {/* Upcoming Weeks */}
        <UpcomingWeeks />
      </div>
    </main>
  );
}

function StatsCard() {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    async function fetchStats() {
      const { count: totalCount } = await supabase
        .from("wednesday_rsvps")
        .select("*", { count: "exact", head: true });
      setTotal(totalCount || 0);
    }
    fetchStats();
  }, []);

  return (
    <Card className="bg-[#fc9dca] text-white shadow-lg rounded-xl">
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <p className="text-sm opacity-80">Total RSVPs</p>
          <h2 className="text-3xl font-bold">{total}</h2>
        </div>
        <Users className="w-12 h-12 opacity-90" />
      </CardContent>
    </Card>
  );
}

function RSVPTable() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      const { data: fetchedData, error } = await supabase
        .from("wednesday_rsvps")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) setError("Failed to load RSVPs");
      else setData(fetchedData || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this RSVP?")) return;
    const { error } = await supabase
      .from("wednesday_rsvps")
      .delete()
      .eq("id", id);
    if (!error) setData(data.filter((item) => item.id !== id));
  };

  if (loading)
    return <p className="p-6 text-center text-gray-600">Loading RSVPs...</p>;
  if (error)
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertDescription className="text-red-600">{error}</AlertDescription>
      </Alert>
    );

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <Table>
        <TableHeader className="bg-pink-50">
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>First Name</TableHead>
            <TableHead>Last Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Week Of</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id} className="hover:bg-pink-50">
              <TableCell>{row.id}</TableCell>
              <TableCell>{row.first_name}</TableCell>
              <TableCell>{row.last_name}</TableCell>
              <TableCell>{row.phone_number}</TableCell>
              <TableCell>{row.week_of}</TableCell>
              <TableCell>
                {new Date(row.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(row.id)}
                  className="rounded-lg bg-red-500 hover:bg-red-600"
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function UpcomingWeeks() {
  const [weeks, setWeeks] = useState<Record<string, number>>({});

  useEffect(() => {
    async function fetchWeeks() {
      const { data } = await supabase.from("wednesday_rsvps").select("week_of");

      const weekCounts: Record<string, number> = {};
      data?.forEach((r) => {
        weekCounts[r.week_of] = (weekCounts[r.week_of] || 0) + 1;
      });
      setWeeks(weekCounts);
    }
    fetchWeeks();
  }, []);

  return (
    <Card className="shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Upcoming Weeks
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Object.entries(weeks).map(([week, count]) => (
            <div
              key={week}
              className="flex justify-between items-center p-3 bg-pink-50 rounded-lg"
            >
              <span className="font-medium">{week}</span>
              <span className="text-[#fc9dca] font-semibold">
                {count} RSVP(s)
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
