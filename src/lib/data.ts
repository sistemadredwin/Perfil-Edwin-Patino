import { cacheLife, cacheTag } from "next/cache";
import { failure, getSupabase } from "./supabase";
import {
  sampleAchievements,
  sampleEducation,
  sampleGallery,
  sampleMeetings,
  sampleProfile,
} from "./sample";
import type {
  Achievement,
  Education,
  Media,
  Meeting,
  Profile,
  Stats,
} from "./types";

/*
 * Lecturas públicas. Cada función se guarda en caché (Cache Components) y
 * lleva una etiqueta, para que el panel de administración pueda invalidarla
 * al guardar cambios (updateTag / revalidateTag).
 */

function sortMedia(list: Media[] | null | undefined): Media[] {
  return [...(list ?? [])].sort((a, b) => a.sort_order - b.sort_order);
}

export async function getProfile(): Promise<Profile> {
  "use cache";
  cacheLife("minutes");
  cacheTag("profile");

  const sb = getSupabase();
  if (!sb) return sampleProfile;
  const { data, error } = await sb
    .from("profile")
    .select("*")
    .limit(1)
    .maybeSingle();
  if (error) throw failure("profile", error.message);
  return (data as Profile | null) ?? sampleProfile;
}

export async function getEducation(): Promise<Education[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("education");

  const sb = getSupabase();
  if (!sb) return sampleEducation;
  const { data, error } = await sb
    .from("education")
    .select("*")
    .order("year", { ascending: false, nullsFirst: false })
    .order("sort_order", { ascending: true });
  if (error) throw failure("education", error.message);
  return (data ?? []) as Education[];
}

export async function getMeetings(): Promise<Meeting[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("meetings");

  const sb = getSupabase();
  if (!sb) return sampleMeetings;
  const { data, error } = await sb
    .from("meetings")
    .select("*, media(*)")
    .eq("status", "publica")
    .order("meeting_date", { ascending: false });
  if (error) throw failure("meetings", error.message);
  return ((data ?? []) as Meeting[]).map((m) => ({
    ...m,
    media: sortMedia(m.media),
  }));
}

export async function getMeeting(slug: string): Promise<Meeting | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("meetings");

  const sb = getSupabase();
  if (!sb) return sampleMeetings.find((m) => m.slug === slug) ?? null;
  const { data, error } = await sb
    .from("meetings")
    .select("*, media(*)")
    .eq("slug", slug)
    .eq("status", "publica")
    .maybeSingle();
  if (error) throw failure("meetings", error.message);
  if (!data) return null;
  const meeting = data as Meeting;
  return { ...meeting, media: sortMedia(meeting.media) };
}

export async function getAchievements(): Promise<Achievement[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("achievements");

  const sb = getSupabase();
  if (!sb) return sampleAchievements;
  const { data, error } = await sb
    .from("achievements")
    .select("*")
    .order("year", { ascending: false, nullsFirst: false })
    .order("sort_order", { ascending: true });
  if (error) throw failure("achievements", error.message);
  return (data ?? []) as Achievement[];
}

export async function getGallery(): Promise<Media[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("media");

  const sb = getSupabase();
  if (!sb) return sampleGallery;
  const { data, error } = await sb
    .from("media")
    .select("*")
    .eq("status", "publica")
    .order("created_at", { ascending: false });
  if (error) throw failure("media", error.message);
  return (data ?? []) as Media[];
}

export async function getStats(): Promise<Stats> {
  "use cache";
  cacheLife("hours");
  cacheTag("education", "meetings", "profile", "achievements");

  const [profile, education, meetings, achievements] = await Promise.all([
    getProfile(),
    getEducation(),
    getMeetings(),
    getAchievements(),
  ]);
  const start = profile.career_start_year;
  return {
    titles: education.length,
    universities: new Set(
      education.map((e) => e.university.trim()).filter(Boolean),
    ).size,
    meetings: meetings.length,
    years: start ? new Date().getFullYear() - start : null,
    positions: Math.max(0, achievements.length - 1),
  };
}
