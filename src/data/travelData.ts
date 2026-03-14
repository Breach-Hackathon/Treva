export interface Destination {
  id: string;
  title: string;
  subtitle: string;
  country: string;
  copy: string;
  meta: string;
  image: string;
  price: string;
  duration: string;
}

export const travelData: Destination[] = [
  {
    id: "amalfi-helicopter",
    title: "Amalfi by Helicopter",
    subtitle: "Italy · 5 nights",
    country: "Italy",
    copy: "Arrive by private rotor, descend to a cantilevered villa, and dine in cliffside grottoes lit only by candlelight and the Tyrrhenian Sea.",
    meta: "Signature Itinerary",
    image: "https://images.unsplash.com/photo-1534113414509-0eec2bfb493f?w=800&q=80",
    price: "From ₹12,00,000",
    duration: "5 nights",
  },
  {
    id: "kyoto-hidden-ryokan",
    title: "Kyoto Hidden Ryokan",
    subtitle: "Japan · 7 nights",
    country: "Japan",
    copy: "Tatami-mat suites, private onsen rituals, and after-hours access to lantern-lit districts reserved quietly for Treva guests.",
    meta: "Cultural Immersion",
    image: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80",
    price: "From ₹15,00,000",
    duration: "7 nights",
  },
  {
    id: "patagonia-sky-lodges",
    title: "Patagonia Sky Lodges",
    subtitle: "Chile · 6 nights",
    country: "Chile",
    copy: "Glass-domed lodges beneath the southern sky, glacier landings, and chef-driven fire dinners far beyond the last trailhead.",
    meta: "Expedition Luxury",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
    price: "From ₹18,00,000",
    duration: "6 nights",
  },
  {
    id: "maldives-private-atoll",
    title: "Maldives Private Atoll",
    subtitle: "Maldives · 8 nights",
    country: "Maldives",
    copy: "An entire island, yours alone. Overwater villas, a private dive master, and sunsets that redefine the colour gold.",
    meta: "Island Exclusive",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
    price: "From ₹26,00,000",
    duration: "8 nights",
  },
  {
    id: "morocco-imperial-circuit",
    title: "Morocco Imperial Circuit",
    subtitle: "Morocco · 10 nights",
    country: "Morocco",
    copy: "From the ancient medinas of Fez to the silence of the Sahara, a route through one of the world's most sensory-rich countries.",
    meta: "Cultural Immersion",
    image: "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800&q=80",
    price: "From ₹9,50,000",
    duration: "10 nights",
  },
  {
    id: "swiss-alps-retreat",
    title: "Swiss Alps Winter Retreat",
    subtitle: "Switzerland · 5 nights",
    country: "Switzerland",
    copy: "Heli-skiing pristine powder by day, Michelin-star fondue by night, all from a chalet that makes Narnia look modest.",
    meta: "Winter Luxury",
    image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80",
    price: "From ₹16,00,000",
    duration: "5 nights",
  },
  {
    id: "bora-bora-overwater",
    title: "Bora Bora Overwater",
    subtitle: "French Polynesia · 7 nights",
    country: "French Polynesia",
    copy: "Glass-floor villas above a lagoon so clear it feels like floating on light. Private pearl farm visits and Polynesian fire ceremonies.",
    meta: "Honeymoon",
    image: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=800&q=80",
    price: "From ₹21,00,000",
    duration: "7 nights",
  },
  {
    id: "arctic-aurora-expedition",
    title: "Arctic Aurora Expedition",
    subtitle: "Finland · 4 nights",
    country: "Finland",
    copy: "Glass igloos, husky safaris, and the Northern Lights dancing above the Arctic Circle in colours no screen can replicate.",
    meta: "Expedition",
    image: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&q=80",
    price: "From ₹8,00,000",
    duration: "4 nights",
  },
];
