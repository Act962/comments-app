import { CallToAction } from "@/components/marketing/call-to-action";
import { ContentSection } from "@/components/marketing/content";
import { Features } from "@/components/marketing/features";
import { FooterSection } from "@/components/marketing/footer";
import { HeroSection } from "@/components/marketing/hero-section";
import { Pricing } from "@/components/marketing/pricing";

export default function Page() {
  return (
    <>
      <HeroSection />
      <Features />
      <ContentSection />
      <Pricing />
      <CallToAction />
      <FooterSection />
    </>
  );
}
