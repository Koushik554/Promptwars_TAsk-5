export type EventType = 'wedding' | 'birthday' | 'community' | 'other';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'INR' | 'CAD' | 'AUD';

export interface BudgetItem {
  id: string;
  category: string;
  name: string;
  planned: number;
  actual: number;
  paid: boolean;
  notes?: string;
}

export interface TimelineMilestone {
  id: string;
  phase: '6_plus_months' | '3_to_6_months' | '1_to_2_months' | 'week_of' | 'day_of' | 'post_event';
  title: string;
  dueDate: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  assignedTo?: string;
  timeOfDay?: string; // For day-of run-of-show (e.g. "09:30 AM")
}

export interface Vendor {
  id: string;
  category: 'venue' | 'catering' | 'photography' | 'music_audio' | 'decor_florist' | 'cake_dessert' | 'attire' | 'transport_security' | 'other';
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  status: 'to_research' | 'contacted' | 'proposal_received' | 'booked' | 'deposit_paid' | 'completed';
  quotedPrice?: number;
  finalPrice?: number;
  contractSigned: boolean;
  notes?: string;
  rating?: number;
}

export interface CreativeIdea {
  id: string;
  category: 'theme_decor' | 'entertainment_activity' | 'food_beverage' | 'favors_gifts' | 'cost_saving_hack';
  title: string;
  description: string;
  aiSuggestedPrompt?: string;
  estimatedCostRange?: string;
  colorPalette?: string[];
  tags: string[];
  isFavorite?: boolean;
}

export interface Guest {
  id: string;
  name: string;
  email?: string;
  status: 'confirmed' | 'declined' | 'pending';
  plusOnes: number;
  dietaryRestrictions?: string;
  tableOrGroup?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  suggestedActions?: { label: string; action: string; payload?: any }[];
}

export interface EventPlan {
  id: string;
  title: string;
  eventType: EventType;
  date: string;
  location: string;
  guestCount: number;
  targetBudget: number;
  currency: Currency;
  vibeAndTheme: string;
  colorPalette: string[];
  aiSummary: string;
  budgetItems: BudgetItem[];
  timeline: TimelineMilestone[];
  vendors: Vendor[];
  ideas: CreativeIdea[];
  guests: Guest[];
  chatHistory: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface GenerateEventPrompt {
  eventType: EventType;
  title: string;
  date: string;
  location: string;
  guestCount: number;
  targetBudget: number;
  currency: Currency;
  vibeAndTheme: string;
  specialRequests?: string;
}
