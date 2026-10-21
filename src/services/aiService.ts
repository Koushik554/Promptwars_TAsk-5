import { EventPlan, GenerateEventPrompt, BudgetItem, TimelineMilestone, Vendor, CreativeIdea, ChatMessage, Guest } from '../types';

export const GEMINI_API_KEY_STORAGE = 'celebrAite_gemini_api_key';

export function getStoredApiKey(): string {
  return localStorage.getItem(GEMINI_API_KEY_STORAGE) || '';
}

export function setStoredApiKey(key: string): void {
  if (key) {
    localStorage.setItem(GEMINI_API_KEY_STORAGE, key.trim());
  } else {
    localStorage.removeItem(GEMINI_API_KEY_STORAGE);
  }
}

/**
 * Call Gemini API with structured prompt
 */
async function callGeminiApi(prompt: string, apiKey: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 3000,
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gemini API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('No response text received from Gemini API');
  }
  return text;
}

/**
 * Intelligent Plan Generator: uses Gemini API if key is present,
 * otherwise leverages the rich built-in AI algorithmic planner.
 */
export async function generateEventPlanWithAI(input: GenerateEventPrompt): Promise<EventPlan> {
  const apiKey = getStoredApiKey();

  if (apiKey) {
    try {
      const systemPrompt = `You are an elite, world-class event planner and GenAI concierge. 
Generate a comprehensive, highly realistic JSON event plan for:
Event Type: ${input.eventType}
Event Title: ${input.title}
Date: ${input.date}
Location: ${input.location}
Guest Count: ${input.guestCount}
Target Budget: ${input.targetBudget} ${input.currency}
Vibe and Theme: ${input.vibeAndTheme}
Special Requests: ${input.specialRequests || 'None'}

Return ONLY valid JSON matching this exact structure with NO markdown fences, no code blocks:
{
  "aiSummary": "2-3 sentences visionary executive summary",
  "colorPalette": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
  "budgetItems": [
    {
      "category": "Venue | Catering | Decor & Floral | Entertainment | Photo & Video | Logistics | Attire & Favors | Contingency",
      "name": "Line item name",
      "planned": number,
      "actual": 0,
      "notes": "Advice on this expense"
    }
  ],
  "timeline": [
    {
      "phase": "6_plus_months | 3_to_6_months | 1_to_2_months | week_of | day_of | post_event",
      "title": "Actionable task",
      "priority": "low | medium | high",
      "category": "string",
      "timeOfDay": "e.g. 10:00 AM (optional, only for day_of)"
    }
  ],
  "vendors": [
    {
      "category": "venue | catering | photography | music_audio | decor_florist | cake_dessert | attire | transport_security | other",
      "name": "Suggested Vendor Archetype or Name",
      "status": "to_research",
      "notes": "Key questions or requirements to ask"
    }
  ],
  "ideas": [
    {
      "category": "theme_decor | entertainment_activity | food_beverage | favors_gifts | cost_saving_hack",
      "title": "Creative concept title",
      "description": "Engaging description",
      "estimatedCostRange": "e.g. $100 - $300",
      "tags": ["tag1", "tag2"]
    }
  ]
}
Make sure budgetItems sums close to targetBudget ${input.targetBudget}. Provide at least 7 budget items, 8 timeline milestones, 5 vendors, and 5 creative ideas.`;

      const aiText = await callGeminiApi(systemPrompt, apiKey);
      const cleanJson = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      const plan: EventPlan = {
        id: 'evt_' + Date.now(),
        title: input.title,
        eventType: input.eventType,
        date: input.date,
        location: input.location,
        guestCount: input.guestCount,
        targetBudget: input.targetBudget,
        currency: input.currency,
        vibeAndTheme: input.vibeAndTheme,
        colorPalette: parsed.colorPalette || ['#E11D48', '#FDA4AF', '#FDF2F8', '#334155', '#F59E0B'],
        aiSummary: parsed.aiSummary || `Personalized ${input.vibeAndTheme} celebration crafted for ${input.guestCount} guests in ${input.location}.`,
        budgetItems: (parsed.budgetItems || []).map((b: any, idx: number) => ({
          id: `b_${idx}_${Date.now()}`,
          category: b.category || 'General',
          name: b.name,
          planned: Number(b.planned) || 100,
          actual: 0,
          paid: false,
          notes: b.notes || '',
        })),
        timeline: (parsed.timeline || []).map((t: any, idx: number) => ({
          id: `t_${idx}_${Date.now()}`,
          phase: t.phase || '3_to_6_months',
          title: t.title,
          dueDate: input.date,
          completed: false,
          priority: t.priority || 'medium',
          category: t.category || 'General',
          timeOfDay: t.timeOfDay,
        })),
        vendors: (parsed.vendors || []).map((v: any, idx: number) => ({
          id: `v_${idx}_${Date.now()}`,
          category: v.category || 'other',
          name: v.name,
          status: 'to_research',
          contractSigned: false,
          notes: v.notes || '',
        })),
        ideas: (parsed.ideas || []).map((i: any, idx: number) => ({
          id: `i_${idx}_${Date.now()}`,
          category: i.category || 'theme_decor',
          title: i.title,
          description: i.description,
          estimatedCostRange: i.estimatedCostRange,
          tags: i.tags || ['GenAI'],
          isFavorite: false,
        })),
        guests: [
          { id: 'g_1', name: 'VIP Host / Family', plusOnes: 1, status: 'confirmed', dietaryRestrictions: 'None' },
          { id: 'g_2', name: 'Close Circle', plusOnes: 2, status: 'pending', dietaryRestrictions: 'Vegetarian' },
        ],
        chatHistory: [
          {
            id: 'm_init',
            sender: 'assistant',
            text: `✨ Welcome! I've engineered your complete **${input.title}** plan powered by Gemini AI. I've tailored your budget, day-of run-of-show, vendor checklist, and personalized aesthetic ideas. Ask me anything to adjust or refine!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            suggestedActions: [
              { label: 'Suggest 3 cost-saving alternatives', action: 'budget_cut' },
              { label: 'Generate vendor inquiry draft', action: 'vendor_rfp' },
              { label: 'Recommend signature drink & playlist', action: 'drink_playlist' }
            ]
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return plan;
    } catch (err) {
      console.warn('Gemini API call failed or returned invalid JSON, falling back to built-in AI engine:', err);
      // Fall through to heuristic generator
    }
  }

  // Built-in intelligent AI planner
  return generateDeterministicEventPlan(input);
}

/**
 * Built-in High Precision Algorithmic GenAI Planner
 */
export function generateDeterministicEventPlan(input: GenerateEventPrompt): EventPlan {
  const { eventType, title, date, location, guestCount, targetBudget, currency, vibeAndTheme } = input;

  // Calculate dynamic budget percentages depending on event type
  let budgetBreakdown = [
    { category: 'Venue Rental & Permits', pct: 0.28, note: 'Reserve 2-3 months early, verify noise curfew & liquor licenses' },
    { category: 'Catering & Beverages', pct: 0.32, note: `Target ~$${Math.round((targetBudget * 0.32) / (guestCount || 1))} per head for food & service` },
    { category: 'Decor & Florals', pct: 0.12, note: `Focus on focal focal points matching "${vibeAndTheme}"` },
    { category: 'Entertainment & AV', pct: 0.10, note: 'Live artist, sound system, lighting rig & curated playlist' },
    { category: 'Photography & Videography', pct: 0.08, note: 'Candid photographer + drone/reels creator' },
    { category: 'Stationery, Favors & Gifts', pct: 0.03, note: 'Personalized interactive giveaways & signage' },
    { category: 'Logistics & Safety', pct: 0.02, note: 'Parking passes, sanitation, first aid kit' },
    { category: 'Emergency Contingency', pct: 0.05, note: 'Dedicated safety buffer for unexpected day-of changes' }
  ];

  if (eventType === 'community') {
    budgetBreakdown = [
      { category: 'Permits, City Fees & Insurance', pct: 0.18, note: 'Municipal park/street permits, fire marshal inspection' },
      { category: 'Stage, AV & Equipment Rental', pct: 0.25, note: 'Stage setup, generator, microphone audio package' },
      { category: 'Food Stalls & Refreshments', pct: 0.22, note: 'Local food vendor coordination & hydration stations' },
      { category: 'Decor, Banners & Signage', pct: 0.10, note: 'Wayfinding signs, entry arch, recycling stations' },
      { category: 'Sanitation & Waste Management', pct: 0.08, note: 'Portable restrooms, clean-up crew & recycling bins' },
      { category: 'Community Marketing & Flyers', pct: 0.07, note: 'Social ads, printed flyers, local neighborhood groups' },
      { category: 'Volunteer Logistics & First Aid', pct: 0.04, note: 'T-shirts for crew, safety kits, walkie-talkies' },
      { category: 'Contingency Reserve', pct: 0.06, note: 'Weather protection covers and rapid repairs' }
    ];
  } else if (eventType === 'birthday') {
    budgetBreakdown = [
      { category: 'Venue & Private Space', pct: 0.24, note: 'Lounge, private dining room, rooftop or scenic backyard' },
      { category: 'Food, Specialty Bar & Cake', pct: 0.35, note: 'Custom showstopper cake + interactive food stations' },
      { category: 'Theme Decor & Photo Backdrop', pct: 0.16, note: `Balloon arch, neon signs, and ${vibeAndTheme} aesthetic` },
      { category: 'Music, DJ & Entertainment', pct: 0.12, note: 'DJ/MC with party lighting & interactive games' },
      { category: 'Photographer / Photobooth', pct: 0.07, note: '360 photobooth or instant Polaroid guestbook' },
      { category: 'Party Favors & Personalization', pct: 0.03, note: 'Custom party favors with birthday crest/logo' },
      { category: 'Contingency Fund', pct: 0.03, note: 'Spontaneous round of toasts or overtime fee' }
    ];
  }

  const budgetItems: BudgetItem[] = budgetBreakdown.map((item, idx) => ({
    id: `b_${idx}_${Date.now()}`,
    category: item.category,
    name: `${item.category.split('&')[0].trim()} Package`,
    planned: Math.round(targetBudget * item.pct),
    actual: 0,
    paid: false,
    notes: item.note
  }));

  // Palette generation based on event & vibe
  let colorPalette = ['#E11D48', '#FB7185', '#FDA4AF', '#334155', '#F59E0B'];
  if (vibeAndTheme.toLowerCase().includes('rustic') || vibeAndTheme.toLowerCase().includes('nature') || vibeAndTheme.toLowerCase().includes('green')) {
    colorPalette = ['#065F46', '#10B981', '#A7F3D0', '#78350F', '#FEF3C7'];
  } else if (vibeAndTheme.toLowerCase().includes('neon') || vibeAndTheme.toLowerCase().includes('retro') || vibeAndTheme.toLowerCase().includes('disco')) {
    colorPalette = ['#8B5CF6', '#EC4899', '#06B6D4', '#F43F5E', '#1E1B4B'];
  } else if (vibeAndTheme.toLowerCase().includes('royal') || vibeAndTheme.toLowerCase().includes('luxe') || vibeAndTheme.toLowerCase().includes('gold') || vibeAndTheme.toLowerCase().includes('glam')) {
    colorPalette = ['#1E293B', '#D97706', '#FBBF24', '#F8FAFC', '#92400E'];
  } else if (eventType === 'community') {
    colorPalette = ['#2563EB', '#3B82F6', '#10B981', '#F59E0B', '#1E293B'];
  }

  // Milestones timeline tailored to event type
  const timeline: TimelineMilestone[] = [
    {
      id: `t_1_${Date.now()}`,
      phase: '6_plus_months',
      title: 'Lock in core date, venue contract & primary budget',
      dueDate: date,
      completed: true,
      priority: 'high',
      category: 'Venue & Legal'
    },
    {
      id: `t_2_${Date.now()}`,
      phase: '3_to_6_months',
      title: `Finalize caterer tasting & beverage pairing for ${guestCount} guests`,
      dueDate: date,
      completed: false,
      priority: 'high',
      category: 'Catering'
    },
    {
      id: `t_3_${Date.now()}`,
      phase: '3_to_6_months',
      title: 'Book Photographer & DJ / Audio-Visual Team',
      dueDate: date,
      completed: false,
      priority: 'high',
      category: 'Entertainment'
    },
    {
      id: `t_4_${Date.now()}`,
      phase: '1_to_2_months',
      title: `Send out digital & physical invitations with RSVP deadline`,
      dueDate: date,
      completed: false,
      priority: 'medium',
      category: 'Stationery'
    },
    {
      id: `t_5_${Date.now()}`,
      phase: '1_to_2_months',
      title: `Design "${vibeAndTheme}" custom focal points, signage & seating charts`,
      dueDate: date,
      completed: false,
      priority: 'medium',
      category: 'Decor'
    },
    {
      id: `t_6_${Date.now()}`,
      phase: 'week_of',
      title: 'Confirm final headcount with caterer and load-in times with venue',
      dueDate: date,
      completed: false,
      priority: 'high',
      category: 'Logistics'
    },
    {
      id: `t_7_${Date.now()}`,
      phase: 'week_of',
      title: 'Assemble emergency kit (scissors, safety pins, chargers, speaker cords)',
      dueDate: date,
      completed: false,
      priority: 'low',
      category: 'Safety'
    },
    // Day-of run of show schedule
    {
      id: `t_8_${Date.now()}`,
      phase: 'day_of',
      title: 'Vendor Load-In & Audio Soundcheck',
      timeOfDay: '09:00 AM',
      dueDate: date,
      completed: false,
      priority: 'high',
      category: 'Day-Of Schedule'
    },
    {
      id: `t_9_${Date.now()}`,
      phase: 'day_of',
      title: 'Decor & Floral arrangement inspection and photo staging ready',
      timeOfDay: '11:30 AM',
      dueDate: date,
      completed: false,
      priority: 'medium',
      category: 'Day-Of Schedule'
    },
    {
      id: `t_10_${Date.now()}`,
      phase: 'day_of',
      title: 'Guest Doors Open & Welcome Refreshments',
      timeOfDay: '01:00 PM',
      dueDate: date,
      completed: false,
      priority: 'high',
      category: 'Day-Of Schedule'
    },
    {
      id: `t_11_${Date.now()}`,
      phase: 'day_of',
      title: 'Main Ceremony / Program Commences',
      timeOfDay: '02:00 PM',
      dueDate: date,
      completed: false,
      priority: 'high',
      category: 'Day-Of Schedule'
    },
    {
      id: `t_12_${Date.now()}`,
      phase: 'day_of',
      title: 'Celebration Feast, Toasts & Live Music Open Dancefloor',
      timeOfDay: '04:00 PM',
      dueDate: date,
      completed: false,
      priority: 'medium',
      category: 'Day-Of Schedule'
    },
    {
      id: `t_13_${Date.now()}`,
      phase: 'post_event',
      title: 'Distribute vendor gratuities, return rental gear & send thank-you notes',
      dueDate: date,
      completed: false,
      priority: 'medium',
      category: 'Post-Event'
    }
  ];

  // Tailored Vendors
  const vendors: Vendor[] = [
    {
      id: `v_1_${Date.now()}`,
      category: 'venue',
      name: `${location} Prime Event Sanctuary`,
      contactName: 'Elena Rostova',
      email: 'events@primevenue.com',
      phone: '+1 (555) 234-8901',
      status: 'proposal_received',
      quotedPrice: Math.round(targetBudget * (eventType === 'wedding' ? 0.28 : 0.22)),
      contractSigned: false,
      notes: 'Includes tables, Chiavari chairs, clean-up crew & security personnel.',
      rating: 5
    },
    {
      id: `v_2_${Date.now()}`,
      category: 'catering',
      name: 'Artisan Palate Catering Co.',
      contactName: 'Chef Marcus',
      email: 'marcus@artisanpalate.com',
      phone: '+1 (555) 891-2345',
      status: 'contacted',
      quotedPrice: Math.round(targetBudget * (eventType === 'wedding' ? 0.32 : 0.35)),
      contractSigned: false,
      notes: `Customized 3-course or grazing feast catering to ${guestCount} guests with vegan/gluten-free options.`,
      rating: 5
    },
    {
      id: `v_3_${Date.now()}`,
      category: 'photography',
      name: 'Lumina Storytellers Studio',
      contactName: 'Chloe Bennett',
      email: 'hello@luminastory.com',
      phone: '+1 (555) 456-7890',
      status: 'to_research',
      quotedPrice: Math.round(targetBudget * 0.09),
      contractSigned: false,
      notes: '8-hour documentary coverage, drone aerial shots, and edited social reels highlight.',
      rating: 4
    },
    {
      id: `v_4_${Date.now()}`,
      category: 'music_audio',
      name: 'VibeWave Acoustics & DJ Collective',
      contactName: 'DJ Kai',
      email: 'booking@vibewavedjs.com',
      phone: '+1 (555) 678-1234',
      status: 'to_research',
      quotedPrice: Math.round(targetBudget * 0.10),
      contractSigned: false,
      notes: 'Wireless mics, subwoofers, dynamic dance-floor moving spotlights, custom setlist.',
      rating: 5
    },
    {
      id: `v_5_${Date.now()}`,
      category: 'decor_florist',
      name: 'Bloom & Prism Decor Studio',
      contactName: 'Sofia Ramos',
      email: 'sofia@bloomprism.com',
      phone: '+1 (555) 345-6789',
      status: 'to_research',
      quotedPrice: Math.round(targetBudget * 0.12),
      contractSigned: false,
      notes: `Focal backdrop styled to the "${vibeAndTheme}" aesthetic, entrance garland, and ambient uplighting.`,
      rating: 5
    }
  ];

  // Tailored Creative Ideas
  const ideas: CreativeIdea[] = [
    {
      id: `i_1_${Date.now()}`,
      category: 'theme_decor',
      title: `The "${vibeAndTheme}" Statement Archway`,
      description: `Create an unforgettable entrance moment with a custom photo arch accented in ${colorPalette[0]} and textured greenery. Guests will immediately capture their first Instagram selfies here.`,
      estimatedCostRange: `${currency} 250 - 600`,
      tags: ['Photo-Op', 'First Impressions', 'Signature Decor'],
      isFavorite: true
    },
    {
      id: `i_2_${Date.now()}`,
      category: 'food_beverage',
      title: 'Interactive Signature Tasting Bar',
      description: `Feature two signature bespoke cocktails named after memorable personal moments or community milestones, plus an artisanal zero-proof mocktail infused with fresh herbs and citrus.`,
      estimatedCostRange: `${currency} 300 - 800`,
      tags: ['Mixology', 'Crowd Pleaser', 'Interactive'],
      isFavorite: true
    },
    {
      id: `i_3_${Date.now()}`,
      category: 'entertainment_activity',
      title: 'Retro Audio Guestbook & Live Polaroids',
      description: 'Replace standard paper guestbooks with a vintage telephone where guests pick up the receiver to record heartfelt audio messages, paired with an instant Polaroid keepsake station.',
      estimatedCostRange: `${currency} 150 - 350`,
      tags: ['Keepsake', 'Guest Experience', 'Audio Nostalgia'],
      isFavorite: false
    },
    {
      id: `i_4_${Date.now()}`,
      category: 'cost_saving_hack',
      title: 'Repurposed Ceremony to Reception Florals',
      description: 'Have your coordinator transfer the ceremony florals and focal arrangements directly to the main dining head table during cocktail hour, cutting floral costs by up to 35% without sacrificing aesthetics.',
      estimatedCostRange: 'Saves 25-35%',
      tags: ['Smart Budget', 'Floral Hack', 'Sustainable'],
      isFavorite: true
    },
    {
      id: `i_5_${Date.now()}`,
      category: 'favors_gifts',
      title: 'Eco-Botanical Custom Keepsakes',
      description: `Mini potted succulents or bespoke artisanal spice/tea jars with custom tags featuring your event date and monogram in ${colorPalette[1]}.`,
      estimatedCostRange: `${currency} 2 - 4 per guest`,
      tags: ['Eco-Friendly', 'Memorable', 'Custom Monogram'],
      isFavorite: false
    }
  ];

  const guests: Guest[] = [
    { id: 'g_1', name: 'Honorary Host / VIP', plusOnes: 1, status: 'confirmed', dietaryRestrictions: 'None', tableOrGroup: 'Table 1' },
    { id: 'g_2', name: 'Core Planning Committee / Family', plusOnes: 2, status: 'confirmed', dietaryRestrictions: 'Gluten-Free', tableOrGroup: 'Table 1' },
    { id: 'g_3', name: 'Alex & Morgan Rivera', plusOnes: 1, status: 'pending', dietaryRestrictions: 'Vegetarian', tableOrGroup: 'Table 2' },
    { id: 'g_4', name: 'Taylor & Jordan Chen', plusOnes: 0, status: 'confirmed', dietaryRestrictions: 'Nut Allergy', tableOrGroup: 'Table 2' },
    { id: 'g_5', name: 'Samira Patel', plusOnes: 1, status: 'declined', dietaryRestrictions: 'Vegan', tableOrGroup: 'Table 3' },
  ];

  const plan: EventPlan = {
    id: 'evt_' + Date.now(),
    title,
    eventType,
    date,
    location,
    guestCount,
    targetBudget,
    currency,
    vibeAndTheme,
    colorPalette,
    aiSummary: `An unforgettable ${vibeAndTheme} ${eventType} orchestrated for ${guestCount} guests in ${location}. Designed with balanced allocation across ${budgetBreakdown.length} spending pillars, a phased run-of-show, and curated experiential moments.`,
    budgetItems,
    timeline,
    vendors,
    ideas,
    guests,
    chatHistory: [
      {
        id: 'm_init',
        sender: 'assistant',
        text: `✨ Hello! I am your **CelebrAIte GenAI Planning Concierge**. I have synthesized your customized master plan for **${title}** with tailored budget breakdowns, milestone countdowns, vendor checklists, and creative experiences. What would you like to explore or customize first?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: [
          { label: 'Optimize budget allocation', action: 'budget_cut' },
          { label: 'Draft Vendor Inquiry Email', action: 'vendor_rfp' },
          { label: 'Suggest Theme & Signature Activities', action: 'creative_ideas' }
        ]
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return plan;
}

/**
 * AI Chat Assistant response generator (with fallback to smart domain knowledge)
 */
export async function sendAiChatMessage(
  message: string,
  event: EventPlan
): Promise<string> {
  const apiKey = getStoredApiKey();

  if (apiKey) {
    try {
      const prompt = `You are CelebrAIte, an expert AI event planning director.
Current Event Context:
- Title: ${event.title} (${event.eventType})
- Date: ${event.date}
- Location: ${event.location}
- Guests: ${event.guestCount}
- Target Budget: ${event.targetBudget} ${event.currency}
- Theme & Vibe: ${event.vibeAndTheme}
- Total Allocated Budget: ${event.budgetItems.reduce((acc, b) => acc + b.planned, 0)} ${event.currency}
- Total Actual Spent: ${event.budgetItems.reduce((acc, b) => acc + b.actual, 0)} ${event.currency}
- Key Vendors: ${event.vendors.map(v => `${v.category}: ${v.name} (${v.status})`).join(', ')}

User Request: "${message}"

Provide a warm, inspiring, highly actionable response with specific tips, numbers, or bullet points formatted in clean Markdown. Keep it concise, friendly, and practical.`;

      return await callGeminiApi(prompt, apiKey);
    } catch (err) {
      console.warn('Gemini chat failed, falling back to heuristic assistant:', err);
    }
  }

  // Heuristic domain assistant
  const lower = message.toLowerCase();

  if (lower.includes('budget') || lower.includes('cost') || lower.includes('save') || lower.includes('expensive')) {
    const totalAllocated = event.budgetItems.reduce((acc, b) => acc + b.planned, 0);
    return `### 💡 AI Budget Optimization Advisory for **${event.title}**

1. **Top Expense Assessment**:
   - Your allocated budget is currently **${event.currency} ${totalAllocated.toLocaleString()}** (Target: ${event.currency} ${event.targetBudget.toLocaleString()}).
   - Catering & Venue consume ~60% of event expenditures. Consider offering heavy gourmet passed hors d'oeuvres or food stations instead of a rigid plated 4-course dinner to save **15-20%**.

2. **Smart Swaps**:
   - **Florals**: Blend lush greenery (eucalyptus, ruscus) with high-impact seasonal blooms rather than out-of-season imports.
   - **Beverages**: Limit hard spirits to 2 signature drinks + wine & craft beer. This curbs open-bar runaway costs by up to **25%**.
   - **Lighting**: Warm fairy lights, amber uplighting, and pillar candles deliver high-end luxury at a fraction of custom ceiling rigging.`;
  }

  if (lower.includes('vendor') || lower.includes('rfp') || lower.includes('email') || lower.includes('inquiry')) {
    return `### ✉️ GenAI Vendor Outreach Template

**Subject:** Inquiry: ${event.title} Availability & Package Pricing (${event.date})

> "Dear [Vendor Name / Team],
> 
> I hope your week is off to a wonderful start! We are currently organizing **${event.title}** taking place on **${event.date}** in **${event.location}** for approximately **${event.guestCount} guests**.
> 
> We admire your portfolio and feel your aesthetic aligns seamlessly with our **${event.vibeAndTheme}** vision. 
> 
> Could you please confirm your availability for this date and share your package offerings and pricing guides? If you have standard minimums or travel requirements, kindly include those as well.
> 
> Looking forward to discussing how we can collaborate!
> 
> Warm regards,  
> [Your Name]  
> [Your Contact Info]"`;
  }

  if (lower.includes('timeline') || lower.includes('schedule') || lower.includes('run of show') || lower.includes('hours')) {
    return `### ⏱️ Day-Of Master Flow Strategy

For an event of **${event.guestCount} guests**, flow and transitions are key:
- **T-3 Hours**: Vendor load-in and initial soundcheck (DJ/AV).
- **T-1 Hour**: Final floral placement, ambient music begins, event leads walk-through.
- **T-0**: Doors open, signature welcome drinks poured to prevent entrance bottlenecks.
- **T+1 Hour**: Main program/ceremony (keep remarks under 20 minutes to maintain high audience engagement).
- **T+2 Hours**: Food stations/dinner service begins.
- **T+3.5 Hours**: Toasts, celebratory cake/dessert reveal, transition into dancing & social mixer!`;
  }

  if (lower.includes('drink') || lower.includes('cocktail') || lower.includes('playlist') || lower.includes('music')) {
    return `### 🍸 Signature Drink & Soundtrack Pairing

**Signature Cocktail:** *"The ${event.vibeAndTheme.split(' ')[0]} Fizz"*
- 2 oz Premium Gin or Botanical Vodka (or sparkling zero-proof botanical spirit)
- 0.75 oz Fresh Meyer Lemon Juice
- 0.5 oz Lavender or Rosemary Honey Syrup
- Top with Prosecco / Artisanal Sparkling Water
- Garnish: Dehydrated lemon wheel & fresh herb sprig

**Audio Atmosphere**:
- **Arrival**: Warm acoustic chill, upbeat indie lounge, or jazzy lo-fi beats (BPM 85-100).
- **Peak Hour**: Upbeat dance anthems, iconic retro mashups, and high-energy singalong classics (BPM 118-126).`;
  }

  return `### ✨ GenAI Planning Recommendation

Regarding **"${message}"** for your **${event.vibeAndTheme}** celebration:

- **Tailored Experience**: With **${event.guestCount} attendees** in **${event.location}**, remember that guest engagement peaks during interactive elements (e.g., photo walls, personalized toasts, or signature tasting moments).
- **Coordinator Tip**: Assign a trusted friend or point person to manage vendor arrivals so you can remain 100% present in the moment.
- Feel free to ask me to draft vendor contracts, brainstorm unique party games, or calculate alcohol/beverage quantities!`;
}
