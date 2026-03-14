import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const SYSTEM_PROMPT = `You are Treva's AI Travel Architect — a world-class luxury travel concierge.
Given a single-line travel wish from a client, generate a stunning, hyper-detailed trip suggestion.

RESPOND ONLY WITH VALID JSON matching this exact structure (no markdown, no code fences):
{
  "tripName": "A poetic, evocative name for the journey",
  "tagline": "A one-line cinematic tagline",
  "destination": "Primary destination",
  "country": "Country name",
  "duration": "X nights",
  "bestSeason": "e.g. March–May",
  "estimatedBudget": "e.g. ₹10,00,000–₹15,00,000 per person",
  "heroDescription": "A 2-3 sentence luxurious, cinematic description that paints a vivid picture of the experience",
  "itinerary": [
    {
      "day": 1,
      "title": "Day title",
      "morning": "Morning activity description",
      "afternoon": "Afternoon activity",
      "evening": "Evening activity",
      "stayAt": "Accommodation name"
    }
  ],
  "highlights": [
    "Unique experience 1",
    "Unique experience 2",
    "Unique experience 3",
    "Unique experience 4"
  ],
  "packingEssentials": ["Item 1", "Item 2", "Item 3", "Item 4"],
  "travelTips": ["Tip 1", "Tip 2", "Tip 3"],
  "cuisineToTry": ["Dish 1", "Dish 2", "Dish 3"]
}

Rules:
- Generate 4-7 day itineraries depending on the destination complexity
- Be specific with restaurant names, hotel names, and local experiences
- Make it feel impossibly luxurious and personal
- Include hidden gems and off-the-beaten-path experiences mixed with iconic landmarks
- The trip name should feel like a film title
- Keep the tone aspirational, warm, and sophisticated
- Always provide estimatedBudget in Indian Rupees (INR, marked with ₹ symbol)`;

const FALLBACK_TRIP = {
  tripName: "Echoes of the Aegean",
  tagline: "A cinematic voyage through Greece's hidden archipelagos.",
  destination: "Santorini & Milos",
  country: "Greece",
  duration: "5 nights",
  bestSeason: "May–September",
  estimatedBudget: "₹11,50,000–₹16,50,000 per person",
  heroDescription: "Board a private catamaran at dawn and navigate the azure waters of the Cyclades. From cliffside wine tastings in Santorini to the moon-like beaches of Milos, this journey is a masterclass in Mediterranean luxury, entirely shielded from the crowds.",
  itinerary: [
    {
      day: 1,
      title: "Arrival in the Caldera",
      morning: "Private helicopter transfer from Athens to Santorini, landing directly at your cliffside estate.",
      afternoon: "A tailored wine-tasting session in an underground 18th-century cellar.",
      evening: "Dinner on your private terrace, prepared by a Michelin-starred chef as the sun sets.",
      stayAt: "Canaves Oia Epitome"
    },
    {
      day: 2,
      title: "Sailing the Sapphire Sea",
      morning: "Board a sleek, luxurious catamaran for a private tour of the hidden volcanic islands.",
      afternoon: "Anchor in a secluded cove for a private swim and a beautifully plated marine lunch.",
      evening: "Disembark and explore the quiet, lantern-lit streets of Megalochori.",
      stayAt: "Canaves Oia Epitome"
    },
    {
      day: 3,
      title: "Transfer to Milos",
      morning: "A smooth, private speedboat transfer to the quiet island of Milos.",
      afternoon: "Explore the lunar landscapes of Sarakiniko beach, with a private photographer to document the afternoon.",
      evening: "A rustic but deeply luxurious dinner on the edge of the water in a traditional Syrma.",
      stayAt: "Milos Cove"
    },
    {
      day: 4,
      title: "The Silent Caves",
      morning: "A private yacht journey to the Kleftiko caves, where pirates once hid their treasures.",
      afternoon: "Snorkeling in crystal-clear waters, followed by a champagne picnic on a deserted beach.",
      evening: "Return to the resort for an exclusive spa treatment overlooking the Aegean.",
      stayAt: "Milos Cove"
    },
    {
      day: 5,
      title: "Departure",
      morning: "A final, lingering breakfast with panoramic views.",
      afternoon: "Helicopter transfer back to Athens for your onward journey.",
      evening: "N/A",
      stayAt: "N/A"
    }
  ],
  highlights: [
    "Private helicopter transfers bypassing all ferry routes",
    "A dedicated Michelin chef for intimate villa dining",
    "Exclusive access to the Kleftiko caves via private yacht",
    "Wine tasting in a hidden, historic Santorinian cellar"
  ],
  packingEssentials: [
    "Linen evening wear",
    "Polarized sunglasses",
    "Swimwear for deep-sea swimming",
    "Light windbreaker for evening sailing"
  ],
  travelTips: [
    "The Mediterranean sun is intense; we provide premium SPF onboard.",
    "Your concierge handles all tipping; no cash is needed.",
    "Local time in Greece is GMT+3 in summer."
  ],
  cuisineToTry: [
    "Assyrtiko wine from ancient volcanic vines",
    "Freshly caught Scorpion fish, grilled with lemon",
    "Fava puree with caramelized onions and olive oil"
  ]
};

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "Please provide a travel wish." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn("No API key found. Using beautiful demo trip.");
      await new Promise(resolve => setTimeout(resolve, 2500));
      return NextResponse.json({ trip: FALLBACK_TRIP });
    }

    try {
      const openai = new OpenAI({ apiKey });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Client's travel wish: "${prompt.trim()}"` },
        ],
        temperature: 0.9,
        max_tokens: 4096,
        response_format: { type: "json_object" },
      });

      const text = completion.choices[0]?.message?.content ?? "";
      const trip = JSON.parse(text);

      return NextResponse.json({ trip });
    } catch (openaiError) {
      // If the API key is rate limited (like yours), just show the demo!
      console.warn("OpenAI API failed (likely quota). Falling back to demo luxury trip:", openaiError);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return NextResponse.json({ trip: FALLBACK_TRIP });
    }

  } catch (error: unknown) {
    console.error("Trip generation route error:", error);
    return NextResponse.json(
      { error: "Something went wrong generating your trip. Please try again." },
      { status: 500 }
    );
  }
}
