import { NextRequest, NextResponse } from "next/server";

const FALLBACK_TRIP = {
  options: [
    {
      mood: "Serene & Secluded",
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
      ],
      images: [
        "https://images.unsplash.com/photo-1601581875309-fafbf2d8ed03?auto=format&fit=crop&q=80&w=1600",
        "https://images.unsplash.com/photo-1570077188670-e3a8d69ac542?auto=format&fit=crop&q=80&w=1600",
        "https://images.unsplash.com/photo-1549643276-fdf2fab574f5?auto=format&fit=crop&q=80&w=1600"
      ]
    },
    {
      mood: "Adventurous & Epicurean",
      tripName: "Flavors of the Cyclades",
      tagline: "A thrilling and tasteful journey through Greece's historic islands.",
      destination: "Mykonos & Santorini",
      country: "Greece",
      duration: "5 nights",
      bestSeason: "May–September",
      estimatedBudget: "₹12,000,000–₹18,000,000 per person",
      heroDescription: "Experience the vibrant energy and exquisite tastes of Greece. From private yacht parties in Mykonos to volcanic hikes and elite dining in Santorini, this trip is designed for the bold and the beautiful.",
      itinerary: [
        {
          day: 1,
          title: "Mykonos Arrival & Beach Club",
          morning: "Arrive via private jet and transfer directly to a VIP cabana at Scorpios.",
          afternoon: "A high-energy afternoon of sun, music, and Mediterranean cuisine.",
          evening: "Exclusive table at a world-renowned club in Mykonos town.",
          stayAt: "Santa Marina Resort"
        },
        {
          day: 2,
          title: "Helicopter to Santorini & Volcanic Delos",
          morning: "Private helicopter tour over the Cyclades, landing in Santorini.",
          afternoon: "Guided hike along the rim of the active volcano, followed by hot springs.",
          evening: "Gastronomic tasting menu at a cliffside restaurant.",
          stayAt: "Katikies Santorini"
        },
        {
          day: 3,
          title: "Epicurean Exploration",
          morning: "Private cooking masterclass with a local acclaimed chef.",
          afternoon: "Wine tasting tour of the island's oldest vineyards.",
          evening: "Dinner prepared using the techniques learned in the masterclass.",
          stayAt: "Katikies Santorini"
        },
        {
          day: 4,
          title: "Deep Sea Adventure",
          morning: "Charter a private speedboat for deep sea fishing and diving.",
          afternoon: "Fresh seafood barbecue prepared on board by your private crew.",
          evening: "Sunset cocktails at a secluded lighthouse view point.",
          stayAt: "Katikies Santorini"
        },
        {
          day: 5,
          title: "Farewell",
          morning: "Leisurely breakfast with endless Aegean views.",
          afternoon: "Private transfer to the airport for your departure.",
          evening: "N/A",
          stayAt: "N/A"
        }
      ],
      highlights: [
        "VIP access to exclusive beach clubs",
        "Private helicopter tours",
        "Guided volcanic hikes",
        "Masterclass with acclaimed chefs"
      ],
      packingEssentials: [
        "Designer beachwear",
        "Elegant evening attire",
        "Hiking shoes",
        "Camera for breathtaking views"
      ],
      travelTips: [
        "Book exclusive venues well in advance.",
        "Stay hydrated while hiking.",
        "Embrace the vibrant nightlife."
      ],
      cuisineToTry: [
        "Fresh local lobster",
        "Premium Greek yogurt with honey",
        "Decadent baklava"
      ],
      images: [
        "https://images.unsplash.com/photo-1515404929826-76fff9fef6fe?auto=format&fit=crop&q=80&w=1600",
        "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80&w=1600",
        "https://images.unsplash.com/photo-1534008897995-27a23e859048?auto=format&fit=crop&q=80&w=1600"
      ]
    }
  ]
};

async function getWeather(city: string) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) return "Weather data unavailable.";

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)},IN&units=metric&appid=${apiKey}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const current = data.list[0];
    return `${city}: ${current.weather[0].description}, ${Math.round(current.main.temp)}°C, humidity ${current.main.humidity}%`;
  } catch {
    return null;
  }
}

function extractCities(text: string): string[] {
  const indianCities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Goa", "Udaipur", "Manali", "Shimla", "Rishikesh", "Varanasi", "Agra", "Kochi", "Munnar", "Ooty", "Leh", "Srinagar"];
  const lower = text.toLowerCase();
  return indianCities.filter((c) => lower.includes(c.toLowerCase()));
}

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "Please provide a travel wish." },
        { status: 400 }
      );
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      console.warn("GEMINI_API_KEY not found in env. Falling back to demo.");
      return NextResponse.json({ options: FALLBACK_TRIP.options });
    }

    // Integrated Weather Logic
    const cities = extractCities(prompt);
    const weatherData = await Promise.all(cities.slice(0, 2).map(getWeather));
    const weatherContext = weatherData.filter(Boolean).join(". ");

    const systemPrompt = `You are Treva's AI Travel Architect — a world-class luxury travel concierge.
Weather Context: ${weatherContext || "Provide a luxury itinerary based on seasonal norms."}

Structure your response as hyper-detailed JSON containing EXACTLY 2 distinct luxury itineraries for the given prompt. Each itinerary should have a distinct "mood" or vibe (e.g., "Serene & Relaxing" vs "Adventurous & High-Energy", or "Cultural" vs "Epicurean").

{
  "options": [
    {
      "mood": "Name of the mood/vibe",
      "tripName": "Cinematic name", "tagline": "Cinematic tagline", "destination": "Primary city", "country": "Country",
      "duration": "nights", "bestSeason": "months", "estimatedBudget": "₹ amounts", "heroDescription": "Luxurious description",
      "itinerary": [{"day": 1, "title": "...", "morning": "...", "afternoon": "...", "evening": "...", "stayAt": "..."}],
      "highlights": [], "packingEssentials": [], "travelTips": [], "cuisineToTry": [], "images": []
    }
  ]
}`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemPrompt }]
          },
          contents: [
            { role: "user", parts: [{ text: `Travel Wish: "${prompt.trim()}"` }] }
          ],
          generationConfig: {
            responseMimeType: "application/json"
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!content) {
        throw new Error("Empty response from Gemini");
      }

      const tripData = JSON.parse(content);

      // AI cannot browse the web so its images are hallucinations (e.g. example.com). We will forcibly inject high quality Unsplash placeholders instead.
      const enrichedOptions = tripData.options.map((opt: any) => ({
        ...opt,
        images: [
          `https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=1600&query=${encodeURIComponent(opt.destination + ' luxury')}`,
          `https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=1600&query=${encodeURIComponent(opt.destination + ' resort')}`,
          `https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=1600&query=${encodeURIComponent(opt.destination + ' landscape')}`
        ]
      }));

      return NextResponse.json({ options: enrichedOptions });

    } catch (error: any) {
      console.error("Gemini context call failed:", error);
      return NextResponse.json({ error: error?.message || "Gemini direct call failed" }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Route error:", error);
    return NextResponse.json({ error: error?.message || String(error) }, { status: 500 });
  }
}
