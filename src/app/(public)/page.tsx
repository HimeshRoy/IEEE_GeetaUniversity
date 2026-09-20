import Hero from "@/components/home/Hero";
import Introduction from "@/components/home/Introduction";
import UpcomingEvents from "@/components/home/UpcomingEvents";
import LatestAnnouncements from "@/components/home/LatestAnnouncements";
import ImpactHighlights from "@/components/home/ImpactHighlights";
import WhyJoinIEEE from "@/components/home/WhyJoinIEEE";
import HomeCTA from "@/components/home/HomeCTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Introduction />
      <UpcomingEvents />
      <LatestAnnouncements />
      <ImpactHighlights />
      <WhyJoinIEEE />
      <HomeCTA />
    </>
  );
}