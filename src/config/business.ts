export const business = {
  hostingDailyRate: 5,
  includedHostingDays: 30,
  previewWorkingDays: 3,
};
export const packages = [
  {
    name: "Basic",
    price: 499,
    description: "A beautiful beginning.",
    fullFeatures: [
      "Template-based invitation",
      "Opening animation",
      "Responsive scrollable design",
      "Event details",
      "Venue map link",
      "Standard invitation URL",
      `${business.includedHostingDays} days of hosting`,
      "Two correction rounds",
    ],
    features: [
      "Template-based invitation",
      "Opening animation & event details",
      "Venue map link",
      "Two correction rounds",
    ],
  },
  {
    name: "Premium",
    price: 1499,
    description: "A little more magic.",
    fullFeatures: [
      "More advanced animation",
      "Greater design customization",
      "Multiple event sections",
      "Optional gallery, countdown and audio",
      "Responsive design & venue map",
      "Standard invitation URL",
      `${business.includedHostingDays} days of hosting`,
      "Four correction rounds",
    ],
    features: [
      "Greater design customization",
      "Advanced animation & multiple events",
      "Optional gallery, countdown & audio",
      "Four correction rounds",
    ],
  },
  {
    name: "Custom",
    price: 2999,
    description: "Entirely, uniquely you.",
    fullFeatures: [
      "Bespoke invitation experience",
      "Advanced visual customization",
      "Custom fonts and layouts",
      "Additional interactive features",
      "Responsive design & venue map",
      "Standard invitation URL",
      `${business.includedHostingDays} days of hosting`,
      "Flexible revisions within agreed scope",
    ],
    features: [
      "Bespoke invitation experience",
      "Custom typography & layouts",
      "Additional interactive features",
      "Revisions within agreed scope",
    ],
  },
];
export const rupees = (value: number) => `₹${value.toLocaleString("en-IN")}`;
