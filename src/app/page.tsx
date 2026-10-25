'use client';

import React from 'react';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { FinalCTASection } from '@/components/landing/FinalCTASection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { useScrollReveal } from '@/components/landing/useScrollReveal';

export default function LandingPage() {
  useScrollReveal();

  return (
    <div className="landing-page min-h-screen">
      {/* 1. Sticky Navigation Header */}
      <LandingNavbar />

      <main>
        {/* 2. Hero Section with Interactive Live Invoice Simulator */}
        <HeroSection />

        {/* 3. Problem Section ("Pourquoi changer") */}
        <ProblemSection />

        {/* 4. Features Section with Interactive Tax Simulator ("Fonctionnalités") */}
        <FeaturesSection />

        {/* 5. How It Works Section ("Comment ça marche") */}
        <HowItWorksSection />

        {/* 6. Testimonials Section ("Témoignages") */}
        <TestimonialsSection />

        {/* 7. Pricing Section ("Tarifs") */}
        <PricingSection />

        {/* 8. Final Call to Action */}
        <FinalCTASection />
      </main>

      {/* 9. Site Footer */}
      <LandingFooter />
    </div>
  );
}
