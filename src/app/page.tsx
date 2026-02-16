'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck, CalendarClock, ChevronRight } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
      </div>
      
      <main className="z-10 flex flex-col items-center justify-center gap-8 max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-primary tracking-widest uppercase">
            ClaimFlow AI
          </h2>
          <h1 className="text-5xl md:text-7xl font-bold font-headline leading-tight">
            Effortless Claims,
            <br />
            Powerful Outcomes.
          </h1>
          <p className="text-lg text-muted-foreground max-w-md">
            Smart, simple, and secure. AI-powered insurance claims processing starts here.
          </p>
        
        <div className="relative my-8">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-full blur-xl opacity-50 animate-pulse"></div>
            <div className="relative w-40 h-40 bg-card rounded-full flex items-center justify-center shadow-2xl shadow-primary/20">
                <div className="w-32 h-32 bg-background rounded-full flex items-center justify-center">
                    <Logo className="w-16 h-16 text-primary" />
                </div>
            </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 w-full max-w-lg">
            <Card className="bg-card/80 backdrop-blur-sm border-border/50 text-left">
                <CardContent className="pt-6">
                    <ShieldCheck className="w-8 h-8 text-primary mb-3"/>
                    <h3 className="font-bold text-lg">Instant Analysis</h3>
                    <p className="text-muted-foreground text-sm">AI-driven damage and fraud detection in seconds.</p>
                </CardContent>
            </Card>
            <Card className="bg-card/80 backdrop-blur-sm border-border/50 text-left">
                <CardContent className="pt-6">
                    <CalendarClock className="w-8 h-8 text-primary mb-3"/>
                    <h3 className="font-bold text-lg">Guided Process</h3>
                    <p className="text-muted-foreground text-sm">Our chatbot guides you through every step of the claim.</p>
                </CardContent>
            </Card>
        </div>
        
        <Button variant="primary" size="lg" className="w-full max-w-sm mt-8 group" asChild>
          <Link href="/dashboard">
            Get Started
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </main>
    </div>
  );
}
