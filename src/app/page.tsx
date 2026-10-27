'use client';

import React from 'react';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { ProductTourSection } from '@/components/landing/ProductTourSection';
import { RoiCalculator } from '@/components/landing/RoiCalculator';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { FinalCTASection } from '@/components/landing/FinalCTASection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { BackToTopButton } from '@/components/landing/BackToTopButton';
import { useScrollReveal } from '@/components/landing/useScrollReveal';

export default function LandingPage() {
  useScrollReveal();

  return (
    <div className="landing-page min-h-screen">
      {/* 1. Sticky Navigation Header */}
      <LandingNavbar />

      <main>
        {/* 2. Hero Section with Interactive Live Invoice Simulator & Live Dashboard Switcher */}
        <HeroSection />

        {/* 3. Problem Section ("Pourquoi changer" with Visual Comparison Mockup) */}
        <ProblemSection />

        {/* 4. Product Tour Section (4 Visual Pillars with High Definition Mockups) */}
        <ProductTourSection />

        {/* 5. Interactive ROI & Savings Calculator */}
        <RoiCalculator />

        {/* 6. Features Section ("Fonctionnalités") */}
        <FeaturesSection />

        {/* 7. How It Works Section ("Comment ça marche") */}
        <HowItWorksSection />

        {/* 8. Testimonials Section ("Témoignages" with Country Flags & Verified Badges) */}
        <TestimonialsSection />

        {/* 9. Pricing Section ("Tarifs") */}
        <PricingSection />

        {/* 10. Final Call to Action */}
        <FinalCTASection />
      </main>

      {/* 11. Site Footer */}
      <LandingFooter />

      {/* 12. Floating Back To Top Button */}
      <BackToTopButton />
    </div>
  );
}
