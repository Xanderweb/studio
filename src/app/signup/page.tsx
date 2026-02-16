'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SignUpPage() {
  const router = useRouter();

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd have user creation logic here.
    // For this prototype, we'll just navigate to the dashboard.
    router.push('/dashboard');
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-6">
      <div className="absolute inset-0 -z-10 h-full w-full bg-bg-primary">
          <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:24px_36px] [mask-image:radial-gradient(ellipse_at_center,transparent_30%,white)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,0,255,0.15),transparent_40%)] animate-pulse [animation-delay:-1s]"></div>
      </div>
      
      <div className="w-full max-w-md mx-auto z-10">
        <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-6">
                <Logo className="w-16 h-16 text-electric-cyan" />
            </Link>
            <h1 className="text-4xl font-bold font-headline glitch" data-text="Create Account">
              Create Account
            </h1>
            <p className="text-text-secondary mt-2">Join ClaimFlow and experience the future of insurance.</p>
        </div>

        <Card className="bg-glass-dark border-glass-border backdrop-blur-lg shadow-glass-glow">
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-8 pt-4">
              <div className="relative">
                <Input id="name" type="text" placeholder=" " required className="peer" />
                <Label htmlFor="name" className="absolute text-sm text-text-secondary duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-electric-cyan peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Full Name</Label>
              </div>
              <div className="relative">
                <Input id="email" type="email" placeholder=" " required className="peer" />
                <Label htmlFor="email" className="absolute text-sm text-text-secondary duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-electric-cyan peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Email Address</Label>
              </div>
              <div className="relative">
                <Input id="password" type="password" placeholder=" " required className="peer" />
                <Label htmlFor="password" className="absolute text-sm text-text-secondary duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-electric-cyan peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Password</Label>
              </div>
              <Button type="submit" variant="magnetic" className="w-full !mt-10">
                Create Account
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-text-secondary">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-electric-cyan hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
