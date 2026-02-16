'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Logo from '@/components/Logo';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export default function LoginPage() {
  const router = useRouter();
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'agent@claimflow.ai',
      password: 'password123',
    },
  });

  function onSubmit(values: z.infer<typeof loginSchema>) {
    console.log(values);
    router.push('/dashboard');
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-6">
       <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      
      <div className="mx-auto grid w-[420px] gap-8">
        <div className="grid gap-4 text-center">
            <div className="flex justify-center items-center gap-4 mb-4">
              <Logo className="h-12 w-12 text-primary" />
              <h1 className="text-6xl font-bold font-headline glitch" data-text="ClaimFlow">ClaimFlow</h1>
            </div>
            <p className="text-balance text-lg text-muted-foreground">
              Insurance Reimagined as a Premium Digital Experience.
            </p>
        </div>
          
        <div className="relative rounded-3xl p-8 bg-card/80 backdrop-blur-xl border border-border/50 shadow-2xl shadow-black/20">
            <h2 className="text-3xl font-bold font-headline text-center mb-2">Agent Access</h2>
            <p className="text-muted-foreground text-center mb-8">Enter your credentials to begin.</p>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">Email</FormLabel>
                      <FormControl>
                        <Input placeholder="name@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" variant="primary" size="lg" className="w-full">
                  Authorize
                </Button>
              </form>
            </Form>
            <div className="mt-6 text-center text-sm">
              <Link href="#" className="underline font-semibold text-primary/80 hover:text-primary">
                Forgot Password?
              </Link>
            </div>
        </div>

      </div>
    </div>
  );
}
