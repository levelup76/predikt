import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import AdminDashboard from "@/components/admin/dashboard";

export default async function EventAdminPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  // Fetch event basic info first
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select(`*, markets(*)`)
    .eq("slug", slug)
    .single();

  if (eventError || !event) {
    console.error("Event fetch error:", eventError);
    notFound();
  }

  // Security Check
  if (event.creator_id !== user.id) {
    return (
        <div className="container mx-auto py-20 text-center">
            <h1 className="text-2xl font-bold text-red-600">Hozzáférés megtagadva</h1>
            <p className="text-gray-500">Csak az esemény létrehozója láthatja ezt az oldalt.</p>
            <Link href={`/e/${slug}`} className="mt-4 inline-block text-blue-600 hover:underline">
                Visszahoz a publikus oldalra
            </Link>
        </div>
    )
  }

  // Fetch predictions separately to avoid Join issues if FK is missing
  const { data: predictions } = await supabase
    .from("predictions")
    .select("id, user_id, points, picks_json")
    .eq("event_id", event.id);

  // Fetch profiles for these predictions
  const userIds = predictions?.map(p => p.user_id) || [];
  let profiles: any[] = [];
  
  if (userIds.length > 0) {
      const { data: pData } = await supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url")
        .in("id", userIds);
      profiles = pData || [];
  }

  // Merge predictions with profiles
  const predictionsWithProfiles = predictions?.map(p => ({
      ...p,
      profiles: profiles.find(prof => prof.id === p.user_id)
  })) || [];

  // Re-attach to event object so Dashboard works as expected
  const eventWithPredictions = {
      ...event,
      predictions: predictionsWithProfiles
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Link
          href={`/e/${slug}`}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Vissza az eseményhez
        </Link>
      </div>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Esemény Kezelése (Admin)</h1>
        <div className="px-3 py-1 rounded bg-blue-100 text-blue-800 text-xs font-mono">
            {event.id}
        </div>
      </div>

      <AdminDashboard event={eventWithPredictions} />
    </div>
  );
}
