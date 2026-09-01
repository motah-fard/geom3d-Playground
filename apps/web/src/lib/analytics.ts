"use client";

export type InteractionEvent = { name: string; at: number; detail?: Record<string, string> };
const KEY = "geom3d-interactions-v1";
const listeners = new Set<() => void>();
let cachedEvents: InteractionEvent[] | null = null;

export function getInteractions(): InteractionEvent[] {
  if (typeof window === "undefined") return [];
  if (cachedEvents) return cachedEvents;
  try { cachedEvents = JSON.parse(localStorage.getItem(KEY) ?? "[]") as InteractionEvent[]; }
  catch { cachedEvents = []; }
  return cachedEvents;
}

export function trackInteraction(name: string, detail?: Record<string, string>) {
  const events = [...getInteractions(), { name, detail, at: Date.now() }].slice(-100);
  cachedEvents = events;
  localStorage.setItem(KEY, JSON.stringify(events));
  listeners.forEach((listener) => listener());
}

export function clearInteractions() {
  localStorage.removeItem(KEY);
  cachedEvents = [];
  listeners.forEach((listener) => listener());
}

export function subscribeInteractions(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
