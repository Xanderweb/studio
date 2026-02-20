import type { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ThemeToggle } from './ThemeToggle';
import { PanelLeft, Bot, LayoutDashboard, PlusCircle } from 'lucide-react';

function Header() {
  const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar');

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center gap-4 border-b border-glass-border bg-bg-primary/50 backdrop-blur-lg px-4 md:px-6">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-lg font-semibold md:text-base font-headline"
        >
          <Logo className="h-7 w-7 text-electric-cyan" />
          <span className="text-xl glitch" data-text="ClaimFlow">ClaimFlow</span>
        </Link>
        <Link
          href="/dashboard"
          className="text-text-secondary transition-colors hover:text-electric-cyan font-semibold flex items-center gap-2"
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>
         <Link
          href="/new-claim"
          className="text-text-secondary transition-colors hover:text-electric-cyan font-semibold flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          New Claim
        </Link>
         <Link
          href="/claim-status"
          className="text-text-secondary transition-colors hover:text-electric-cyan font-semibold flex items-center gap-2"
        >
          <Bot className="h-4 w-4" />
          Check Status
        </Link>
      </nav>
      <Button variant="ghost" size="icon" className="md:hidden">
        <PanelLeft />
        <span className="sr-only">Toggle Menu</span>
      </Button>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <div className="ml-auto flex-1 sm:flex-initial" />
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full w-10 h-10">
              {userAvatar ? (
                 <Image
                    src={userAvatar.imageUrl}
                    alt={userAvatar.description}
                    data-ai-hint={userAvatar.imageHint}
                    width={40}
                    height={40}
                    className="rounded-full border-2 border-electric-cyan/50"
                  />
              ) : (
                <span className="sr-only">Toggle user menu</span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-bg-secondary border-glass-border">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-glass-border"/>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator className="bg-glass-border"/>
            <DropdownMenuItem asChild>
              <Link href="/login">Logout</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}


export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-bg-primary">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {children}
      </main>
    </div>
  );
}
