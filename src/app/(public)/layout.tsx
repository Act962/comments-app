import { FooterSection } from "@/components/marketing/footer-section";
import { Navbar } from "@/components/marketing/navbar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* <Navbar /> */}
      <main className="min-h-screen pt-24">{children}</main>
      <FooterSection />
    </>
  );
}
