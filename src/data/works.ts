export interface PortfolioWork {
  id: string;
  title: string;
  occasion: string;
  description: string;
  previewUrl: string;
}

// Retained local portfolio copies are independent of customer invitation expiry.
export const works: PortfolioWork[] = [
  {
    id: "a-beautiful-beginning",
    title: "A beautiful beginning",
    occasion: "Nikah",
    description: "A celebration of togetherness, brought to life in a digital invitation.",
    previewUrl: "/portfolio/nikah/preview.json",
  },
];
