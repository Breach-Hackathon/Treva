import { NextRequest, NextResponse } from "next/server";
import { travelData } from "@/data/travelData";

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
      // Demo budgets kept modest so they work for lower budgets like ₹30,000 too.
      estimatedBudget: "₹18,000–₹26,000 total for two travelers",
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
      estimatedBudget: "₹22,000–₹30,000 total for two travelers",
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
  const indianCities = [
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Hyderabad",
    "Chennai",
    "Kolkata",
    "Pune",
    "Ahmedabad",
    "Jaipur",
    "Goa",
    "Udaipur",
    "Manali",
    "Shimla",
    "Rishikesh",
    "Varanasi",
    "Agra",
    "Kochi",
    "Munnar",
    "Ooty",
    "Leh",
    "Srinagar",
    "Kedarnath",
    "Badrinath",
  ];
  const lower = text.toLowerCase();
  return indianCities.filter((c) => lower.includes(c.toLowerCase()));
}

async function getDestinationImages(
  destination: string,
  originalPrompt?: string
): Promise<string[]> {
  // Prefer an explicit place name from the user's prompt (e.g. Kedarnath),
  // fall back to the AI's destination field, and finally to a generic label.
  const fromPrompt = originalPrompt
    ? extractCities(originalPrompt)[0]
    : undefined;
  const place = (fromPrompt || destination || "Travel destination").trim();
  const lower = place.toLowerCase();

  // 1) Try to re-use curated images from our static travel catalogue
  //    so that generated trips visually match existing destinations.
  const matchedFromCatalogue = travelData.filter((trip) => {
    const title = trip.title.toLowerCase();
    const country = trip.country.toLowerCase();
    return (
      lower.includes(country) ||
      country.includes(lower) ||
      lower.includes(title) ||
      title.includes(lower)
    );
  });

  if (matchedFromCatalogue.length > 0) {
    const images = matchedFromCatalogue.map((t) => t.image);
    // Repeat or slice to always return at least 3 images.
    const repeated = [...images, ...images, ...images];
    return repeated.slice(0, 3);
  }

  // 2) Fallbacks for some popular destinations with hand-picked images.
  if (lower.includes("delhi")) {
    return [
      "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&q=80&w=1600", // India Gate
      "https://images.unsplash.com/photo-1598519870305-0bea1891fc87?auto=format&fit=crop&q=80&w=1600", // Qutub Minar
      "https://images.unsplash.com/photo-1589739900243-4c4c4620cf5e?auto=format&fit=crop&q=80&w=1600", // Old Delhi street
    ];
  }

  if (lower.includes("mumbai")) {
    return [
      "https://images.unsplash.com/photo-1587470213746-604081de63d3?auto=format&fit=crop&q=80&w=1600", // Gateway of India
      "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&q=80&w=1600", // Marine Drive
      "https://images.unsplash.com/photo-1559717865-a99cac1c95c1?auto=format&fit=crop&q=80&w=1600", // Mumbai skyline
    ];
  }

  if (lower.includes("goa")) {
    return [
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&q=80&w=1600", // Goa beach
      "https://images.unsplash.com/photo-1562577309-4932fdd64cd1?auto=format&fit=crop&q=80&w=1600", // Shack / cafe
      "https://images.unsplash.com/photo-1512343879784-a2b2f1e0f5bb?auto=format&fit=crop&q=80&w=1600", // Sunset coast
    ];
  }

  if (lower.includes("kathmandu") || lower.includes("nepal")) {
    return [
      "https://images.unsplash.com/photo-1526800544336-d04f0cbfd700?auto=format&fit=crop&q=80&w=1600", // Kathmandu valley
      "https://images.unsplash.com/photo-1533047025350-0467a9bcd102?auto=format&fit=crop&q=80&w=1600", // Boudhanath
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=1600", // Himalayas near Kathmandu
    ];
  }

  if (lower.includes("maldives")) {
    return [
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&q=80&w=1600", // Overwater villas
      "https://images.unsplash.com/photo-1504274066651-8d31a536b11a?auto=format&fit=crop&q=80&w=1600", // Sandbank
      "https://images.unsplash.com/photo-1526481280695-3c687fd543c0?auto=format&fit=crop&q=80&w=1600", // Turquoise lagoon
    ];
  }

  if (lower.includes("paris") || lower.includes("france")) {
    return [
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=1600", // Eiffel Tower
      "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80&w=1600", // Paris streets
      "https://images.unsplash.com/photo-1502602898652-965bbb47e926?auto=format&fit=crop&q=80&w=1600", // Seine river
    ];
  }

  if (lower.includes("swiss") || lower.includes("switzerland") || lower.includes("alps")) {
    return [
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1600", // Swiss Alps
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=1600", // Mountain lake
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=1600", // Snowy village
    ];
  }

  if (lower.includes("uttarakhand") || lower.includes("nainital") || lower.includes("rishikesh") || lower.includes("mussoorie") || lower.includes("kedarnath")) {
    return [
      "https://images.unsplash.com/photo-1593691509543-cc9b245fc6aa?auto=format&fit=crop&q=80&w=1600", // Himalayan valley
      "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&q=80&w=1600", // Rishikesh Ganga
      "https://images.unsplash.com/photo-1600490036275-35f5f1656861?auto=format&fit=crop&q=80&w=1600", // Mountain road
    ];
  }

  // 3) Default web-based placeholders for other destinations.
  //    Build the Pexels search term from the *user's prompt* first so we
  //    capture the exact place they typed (e.g. Kedarnath, Goa, etc.).
  const searchTerm = place || "travel";
  const encoded = encodeURIComponent(searchTerm);

  // 3a) Try Pexels API if configured – we only need 1–3 images.
  const pexelsApiKey = process.env.PEXELS_API_KEY;
  if (pexelsApiKey) {
    try {
      const res = await fetch(
        `https://api.pexels.com/v1/search?query=${encoded}&per_page=3&orientation=landscape`,
        {
          headers: {
            Authorization: pexelsApiKey,
          },
          // Pexels is a third-party API; don't block the whole request if it's slow.
          next: { revalidate: 3600 }, // Cache for 1 hour
        }
      );

      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.photos) && data.photos.length > 0) {
          const urls = data.photos
            .map((p: any) => p.src?.landscape || p.src?.large || p.src?.original)
            .filter(Boolean);
          if (urls.length > 0) {
            console.log(`[Pexels] Found ${urls.length} images for "${destination}"`);
            return urls.slice(0, 3);
          }
        }
      } else {
        const errorText = await res.text();
        console.error(`[Pexels] API error ${res.status}:`, errorText);
      }
    } catch (err) {
      console.error("[Pexels] Image lookup failed:", err);
      // fall through to generic web placeholders
    }
  } else {
    console.warn("[Pexels] API key not configured, skipping Pexels search");
  }

  // 3b) Generic web placeholders as final fallback - always return at least 3 images.
  const fallbackImages = [
    `https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=1600&h=900`, // Generic travel
    `https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=1600&h=900`, // Landscape
    `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=1600&h=900`, // Mountains
  ];
  
  console.log(`[Images] Using fallback images for "${searchTerm}"`);
  return fallbackImages;
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

For the entire trip, you MUST carefully read and respect any explicit budget constraints mentioned in the travel wish.
- If the user provides a numeric budget (for example "under 30000", "budget 50,000"), treat that number as a HARD MAXIMUM for the TOTAL trip cost for all travelers together.
- Under no circumstances may the estimated total cost or the "estimatedBudget" range exceed this maximum; if you cannot design a plausible trip within that number, clearly say so and keep the "estimatedBudget" range at or BELOW that number.
If the user does not clearly mention a budget, choose options that fit premium-to-luxury Indian travelers, but do not invent a constraint that contradicts what they wrote.
Express "estimatedBudget" as a realistic INR range for the full itinerary (for the whole party), and always keep the upper bound inside any numeric budget the user has provided.
Assume itineraries are for two travelers unless the user has clearly specified a different party size.

If the travel wish clearly mentions a trip length (for example "6 days", "4 nights", "10-day"), you MUST design itineraries that match that length as closely as possible.
- Do not silently shorten the trip to fewer days to fit the budget; instead, keep the requested number of days and clearly explain trade-offs in comfort or inclusions if the budget is very low.

Each day must be broken into morning, afternoon and evening time slots with concrete activities that match the stated budget, mood, and length of stay.

Structure your response as hyper-detailed JSON containing EXACTLY 2 distinct luxury itineraries for the given prompt. Each itinerary should have a distinct "mood" or vibe (e.g., "Serene & Relaxing" vs "Adventurous & High-Energy", or "Cultural" vs "Epicurean").

{
  "options": [
    {
      "mood": "Name of the mood/vibe",
      "tripName": "Cinematic name",
      "tagline": "Cinematic tagline",
      "destination": "Primary city",
      "country": "Country",
      "duration": "nights",
      "bestSeason": "months",
      "estimatedBudget": "₹ amounts for full trip",
      "heroDescription": "Luxurious description that hints at the budget level and key experiences",
      "itinerary": [
        {
          "day": 1,
          "title": "Short day title",
          "morning": "Morning time-slot activities with timings and locations",
          "afternoon": "Afternoon time-slot activities with timings and locations",
          "evening": "Evening time-slot activities with timings and locations",
          "stayAt": "Hotel / villa / resort that fits the budget level"
        }
      ],
      "highlights": [],
      "packingEssentials": [],
      "travelTips": [],
      "cuisineToTry": [],
      "images": []
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

      // AI cannot browse the web so its images are hallucinations.
      // Inject curated / Pexels / placeholder images instead.
      const enrichedOptions = await Promise.all(
        tripData.options.map(async (opt: any) => ({
          ...opt,
          images: await getDestinationImages(opt.destination, prompt),
        }))
      );

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
