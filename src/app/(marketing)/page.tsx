import { Comparison } from "@/components/marketing/comparison";
import { CTA } from "@/components/marketing/cta";
import { FAQ } from "@/components/marketing/faq";
import { Features } from "@/components/marketing/features";
import { Footer } from "@/components/marketing/footer";
import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/howitwork";
import { Problem } from "@/components/marketing/problem";
import { SocialCase } from "@/components/marketing/social-case";
import { Transformation } from "@/components/marketing/transformation";

export default function Page() {
  return (
    <>
      <Hero />
      <Problem />
      <Transformation />
      <HowItWorks />
      <Features />
      <SocialCase />
      <Comparison />
      <CTA />
      <FAQ />
      <Footer />
      {/* <FooterSection /> */}
    </>
  );
}
