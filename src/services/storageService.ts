import { EventPlan } from '../types';
import { generateDeterministicEventPlan } from './aiService';

const STORAGE_KEY = 'celebrAite_events_v1';
const ACTIVE_EVENT_KEY = 'celebrAite_active_event_id';

export function getSampleEvents(): EventPlan[] {
  const weddingPlan = generateDeterministicEventPlan({
    eventType: 'wedding',
    title: "Seraphina & Julian's Tuscan Villa Wedding",
    date: '2026-09-18',
    location: 'Napa Valley Hillside Estate, CA',
    guestCount: 120,
    targetBudget: 38000,
    currency: 'USD',
    vibeAndTheme: 'Rustic Italian Villa, Olive Groves & Warm Amber Candleglow',
    specialRequests: 'Include wine tasting hour, acoustic cello ceremony, and late-night woodfired pizza truck.'
  });

  const birthdayPlan = generateDeterministicEventPlan({
    eventType: 'birthday',
    title: "Maya's Neon Retro 30th Birthday Bash",
    date: '2026-07-25',
    location: 'Downtown Skyline Penthouse Lounge',
    guestCount: 45,
    targetBudget: 5500,
    currency: 'USD',
    vibeAndTheme: 'Neon Synthwave & 90s Disco Glitz',
    specialRequests: 'Custom LED cocktail bar, 360-degree slow motion video booth, DJ spinning 90s/00s remixed hits.'
  });

  const communityPlan = generateDeterministicEventPlan({
    eventType: 'community',
    title: 'Oakwood Harvest Arts & Food Fair',
    date: '2026-10-10',
    location: 'Oakwood Memorial Green & Riverwalk',
    guestCount: 500,
    targetBudget: 14500,
    currency: 'USD',
    vibeAndTheme: 'Eco-Friendly Autumn Harvest & Community Makers',
    specialRequests: '20 local artisan booths, kids pumpkin painting workshop, zero-waste composting stations.'
  });

  return [weddingPlan, birthdayPlan, communityPlan];
}

export function loadEventsFromStorage(): EventPlan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const presets = getSampleEvents();
      saveEventsToStorage(presets);
      return presets;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    const presets = getSampleEvents();
    saveEventsToStorage(presets);
    return presets;
  } catch (err) {
    console.error('Failed to read from localStorage:', err);
    return getSampleEvents();
  }
}

export function saveEventsToStorage(events: EventPlan[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (err) {
    console.error('Failed to save events to localStorage:', err);
  }
}

export function getActiveEventId(): string | null {
  return localStorage.getItem(ACTIVE_EVENT_KEY);
}

export function setActiveEventId(id: string): void {
  localStorage.setItem(ACTIVE_EVENT_KEY, id);
}

export function exportEventsJson(events: EventPlan[]): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(events, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `CelebrAIte_Events_Backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
