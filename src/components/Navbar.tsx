import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Shield } from "lucide-react";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

interface NavbarProps {
  isAdmin: boolean;
}

const navItems = [
  { name: "Home", path: "/home" },
  { name: "About", path: "/about" },
  { name: "Projects", path: "/projects" },
  { name: "Blog", path: "/blog" },
  { name: "Contact", path: "/contact" },
];

const AuthButtons = () => (
  <div className="flex items-center gap-4">
    <SignedOut>
      <SignInButton />
      <SignUpButton />
    </SignedOut>
    <SignedIn>
      <UserButton />
    </SignedIn>
  </div>
);

export function Navbar({ isAdmin }: NavbarProps) {
  return (
    <nav className="fixed top-0 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      <div className="container flex h-14 items-center justify-between px-4 sm:px-8">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold">Utkarsh</span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <nav className="flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className="transition-colors hover:text-foreground/80 text-foreground"
                aria-label={`Navigate to ${item.name}`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          {isAdmin && (
            <Link
              href="/admin/projects"
              className="flex items-center"
              aria-label="Admin Panel"
            >
              <Shield className="h-5 w-5 text-blue-500" />
            </Link>
          )}
          <AuthButtons />
        </div>

        <Sheet>
          <SheetTrigger asChild className="block md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="relative -mr-2"
              aria-label="Open Menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent 
            side="left" 
            className="w-[300px] sm:w-[400px] flex flex-col overflow-y-auto"
          >
            <nav className="flex flex-col gap-4 flex-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className="block px-2 py-1 text-lg"
                  aria-label={`Navigate to ${item.name}`}
                >
                  {item.name}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  href="/admin/projects"
                  className="flex items-center gap-2 px-2 py-1 text-lg"
                  aria-label="Admin Panel"
                >
                  <Shield className="h-5 w-5 text-blue-500" />
                  Admin
                </Link>
              )}
            </nav>
            <div className="py-4">
              <AuthButtons />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
