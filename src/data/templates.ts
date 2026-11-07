import { demoEventDate } from "./demoEvent";
import { premiumTemplates } from "./premiumTemplates";
export const occasions = [
  "Wedding",
  "Nikah",
  "Walima",
  "Engagement",
  "Aqiqah",
  "Birthday",
  "Anniversary",
  "Griha Pravesh",
  "Puja",
  "Housewarming",
  "Other Celebrations",
] as const;
export type Occasion = (typeof occasions)[number];
export type Theme =
  | "garden"
  | "celestial"
  | "editorial"
  | "confetti"
  | "earth"
  | "marigold"
  | "velvet"
  | "lunar"
  | "solstice"
  | "palace"
  | "letter"
  | "noir"
  | "provence"
  | "lotus"
  | "ocean"
  | "crystal"
  | "lantern"
  | "silk";
export type OpeningEffect =
  | "curtains"
  | "moonlight"
  | "sunrise"
  | "gates"
  | "envelope"
  | "aperture"
  | "shutters"
  | "bloom"
  | "tide"
  | "prism"
  | "lanterns"
  | "ribbons";
export interface PremiumDesign {
  effect: OpeningEffect;
  label: string;
  edition: string;
  layout: "theatre" | "orbital" | "editorial" | "architecture" | "landscape";
}
export interface InvitationTemplate {
  premium?: PremiumDesign;
  id: string;
  name: string;
  category: Occasion;
  theme: Theme;
  mood: string;
  description: string;
  names: string[];
  intro: string;
  title: string;
  message: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  symbol: string;
  opening: string;
  events: { title: string; time: string; detail: string }[];
}
export const templates: InvitationTemplate[] = [
  {
    id: "the-garden-edit",
    name: "The Garden Edit",
    category: "Wedding",
    theme: "garden",
    mood: "Botanical · Timeless",
    description:
      "Delicate botanical linework and soft ivory, made for a love that grows.",
    names: ["Ananya", "Rohan"],
    intro: "Together with their families",
    title: "A love in full bloom.",
    message:
      "With full hearts and a lifetime of little adventures ahead, we invite you to witness the beginning of our forever.",
    date: demoEventDate,
    time: "5:00 PM IST",
    venue: "The Garden Pavilion",
    city: "Jaipur, Rajasthan",
    symbol: "✳",
    opening: "A beautiful beginning awaits",
    events: [
      {
        title: "The ceremony",
        time: "5:00 PM",
        detail: "Under the garden canopy, surrounded by our favourite people.",
      },
      {
        title: "Dinner & celebration",
        time: "7:30 PM",
        detail:
          "An evening of good food, heartfelt toasts and a little dancing.",
      },
    ],
  },
  {
    id: "under-the-stars",
    name: "Under the Stars",
    category: "Nikah",
    theme: "celestial",
    mood: "Celestial · Elegant",
    description:
      "Midnight teal, golden constellations and an arched invitation to remember.",
    names: ["Ayaan", "Zoya"],
    intro: "With gratitude and the blessings of our families",
    title: "Written in the stars.",
    message:
      "In the company of those we hold dear, we begin a new chapter of love, kindness and togetherness. Please join us for our Nikah.",
    date: demoEventDate,
    time: "4:30 PM IST",
    venue: "The Crescent Courtyard",
    city: "Hyderabad, Telangana",
    symbol: "☾",
    opening: "An evening beneath the stars",
    events: [
      {
        title: "Nikah ceremony",
        time: "4:30 PM",
        detail: "Join our families as we celebrate this cherished promise.",
      },
      {
        title: "Dinner",
        time: "7:00 PM",
        detail: "Stay for a warm evening of conversation and celebration.",
      },
    ],
  },
  {
    id: "the-modern-vow",
    name: "The Modern Vow",
    category: "Engagement",
    theme: "editorial",
    mood: "Editorial · Contemporary",
    description:
      "Oversized type, a blush palette and a bold little yes. Effortlessly modern.",
    names: ["Meera", "Arjun"],
    intro: "One question. The easiest answer.",
    title: "Here’s to yes.",
    message:
      "We’re engaged! Before the next big chapter, let’s gather for a beautiful evening with the people who made our story what it is.",
    date: demoEventDate,
    time: "6:00 PM IST",
    venue: "The Rose Terrace",
    city: "Bengaluru, Karnataka",
    symbol: "&",
    opening: "The next chapter starts here",
    events: [
      {
        title: "Rings & happy tears",
        time: "6:00 PM",
        detail: "A small promise with a whole lifetime inside it.",
      },
      {
        title: "Toasts & dinner",
        time: "7:00 PM",
        detail: "Bring a favourite story and your dancing shoes.",
      },
    ],
  },
  {
    id: "a-little-confetti",
    name: "A Little Confetti",
    category: "Birthday",
    theme: "confetti",
    mood: "Playful · Colourful",
    description:
      "A sprinkle of colour, happy shapes and the biggest little celebration.",
    names: ["Tara"],
    intro: "Cake. Giggles. A whole lot of joy.",
    title: "Five & full of wonder!",
    message:
      "Our little sunshine is turning five, and a party wouldn’t be a party without you. Come make a bright, happy memory with us!",
    date: demoEventDate,
    time: "3:00 PM IST",
    venue: "The Sunshine Playhouse",
    city: "Pune, Maharashtra",
    symbol: "✦",
    opening: "There’s a party inside!",
    events: [
      {
        title: "Play time",
        time: "3:00 PM",
        detail: "Games, giggles and a few colourful surprises.",
      },
      {
        title: "Make a wish",
        time: "4:30 PM",
        detail: "Time for birthday cake and something delicious for everyone.",
      },
    ],
  },
  {
    id: "a-place-to-belong",
    name: "A Place to Belong",
    category: "Housewarming",
    theme: "earth",
    mood: "Earthy · Minimal",
    description:
      "Terracotta arches and warm paper tones. A heartfelt welcome home.",
    names: ["The Shah family"],
    intro: "A new address. The same warm welcome.",
    title: "Home, made happier with you.",
    message:
      "The boxes are unpacked, the kettle is on, and all that’s missing is you. Join us as we fill our new home with familiar faces and new memories.",
    date: demoEventDate,
    time: "11:00 AM IST",
    venue: "Our New Home · Sample Residence",
    city: "Ahmedabad, Gujarat",
    symbol: "⌂",
    opening: "Our door is open",
    events: [
      {
        title: "A warm welcome",
        time: "11:00 AM",
        detail: "Come on in, take a look around and make yourself at home.",
      },
      {
        title: "Lunch together",
        time: "12:30 PM",
        detail: "A table full of food and a home full of friends.",
      },
    ],
  },
  {
    id: "marigold-mornings",
    name: "Marigold Mornings",
    category: "Puja",
    theme: "marigold",
    mood: "Festive · Traditional",
    description:
      "Marigold garlands, saffron details and the warmth of a shared blessing.",
    names: ["The Iyer family"],
    intro: "With grateful hearts, we invite you",
    title: "A morning of new blessings.",
    message:
      "Please join our family for a joyful morning of prayer and togetherness. Your presence will make this new beginning all the more meaningful.",
    date: demoEventDate,
    time: "9:00 AM IST",
    venue: "The Lotus Hall",
    city: "Chennai, Tamil Nadu",
    symbol: "✺",
    opening: "A warm invitation to a new beginning",
    events: [
      {
        title: "Puja",
        time: "9:00 AM",
        detail: "A peaceful morning of prayer with family and friends.",
      },
      {
        title: "Prasad & lunch",
        time: "11:30 AM",
        detail: "Share a meal and a moment of gratitude together.",
      },
    ],
  },
  ...premiumTemplates,
];
export function filterTemplates(
  query = "",
  category = "All",
  collection = "All",
) {
  const normalized = query.trim().toLocaleLowerCase("en-IN");
  return templates.filter(
    (template) =>
      (category === "All" || template.category === category) &&
      (collection === "All" ||
        (collection === "Premium"
          ? Boolean(template.premium)
          : !template.premium)) &&
      `${template.name} ${template.category} ${template.mood} ${template.description} ${template.premium?.label ?? ""}`
        .toLocaleLowerCase("en-IN")
        .includes(normalized),
  );
}
export function getTemplate(id: string | undefined | null) {
  return templates.find((template) => template.id === id);
}
export function formatEventDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(`${date}T12:00:00+05:30`));
}
export function quoteLink(id: string) {
  return `/request-quote?template=${encodeURIComponent(id)}`;
}
