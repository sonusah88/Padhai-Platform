import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import {
  HeroSection,
  MissionSection,
  HowItWorksSection,
  PathwaysSection,
  LiveClassesSection,
  FutureSkillsSection,
  AITutorSection,
  ParentsSection,
  FAQSection,
  CTASection,
} from '@/components/home/sections';

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <MissionSection />
        <HowItWorksSection />
        <PathwaysSection />
        <LiveClassesSection />
        <FutureSkillsSection />
        <AITutorSection />
        <ParentsSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
