'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck, CalendarClock, ChevronRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      <div className="absolute inset-0 -z-10 h-full w-full bg-bg-primary">
          <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:24px_36px] [mask-image:radial-gradient(ellipse_at_center,transparent_30%,white)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,245,255,0.2),transparent_40%)] animate-pulse"></div>
      </div>
      
      <main className="z-10 flex flex-col items-center justify-center gap-8 max-w-4xl mx-auto">
          <div className="relative mb-4">
              <div className="absolute -inset-1 bg-gradient-to-r from-electric-cyan to-electric-magenta rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative w-32 h-32 bg-bg-secondary rounded-full flex items-center justify-center shadow-2xl shadow-electric-cyan/20">
                  <div className="w-24 h-24 bg-bg-primary rounded-full flex items-center justify-center">
                      <Logo className="w-16 h-16 text-electric-cyan" />
                  </div>
              </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold font-headline leading-tight hero-title">
            Insurance Reimagined.
          </h1>
          <p className="text-lg text-text-secondary max-w-xl">
            Cyber-Luxury meets Street Tech. File claims in seconds with our AI-powered platform. Fast, fluid, and radically simple.
          </p>
        
        <Button variant="magnetic" size="lg" className="mt-8 group" asChild>
          <Link href="/login">
            Get Started
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </main>
    </div>
  );
}
