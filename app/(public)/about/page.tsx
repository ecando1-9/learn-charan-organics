import type { Metadata } from "next";
import { AboutAcademySection } from "@/components/home/about-academy-section";

export const metadata: Metadata = {
  title: "About Us | Charan Organics Academy",
  description: "Learn about Charan Organics, our trademark registration under The Trademarks Act 1999, ayurvedic formulation heritage, values, and online manufacturing classes."
};

export default function AboutPage() {
  return (
    <div className="py-6">
      <AboutAcademySection showFullDetails />
    </div>
  );
}
