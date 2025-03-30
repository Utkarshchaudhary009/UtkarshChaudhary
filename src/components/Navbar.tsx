'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Shield, X } from "lucide-react";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { motion, AnimatePresence } from "framer-motion";

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
  <div className="flex items-center gap-3">
    <SignedOut>
      <motion.div 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <SignInButton mode="modal">
          <Button variant="ghost" size="sm" className="rounded-full px-4">
            Sign In
          </Button>
        </SignInButton>
      </motion.div>
      <motion.div 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <SignUpButton mode="modal">
          <Button variant="default" size="sm" className="rounded-full px-4">
            Sign Up
          </Button>
        </SignUpButton>
      </motion.div>
    </SignedOut>
    <SignedIn>
      <motion.div 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="ml-2"
      >
        <UserButton 
          appearance={{
            elements: {
              avatarBox: "h-8 w-8"
            }
          }}
        />
      </motion.div>
    </SignedIn>
    <motion.div 
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <ThemeToggle />
    </motion.div>
  </div>
);

export function Navbar({ isAdmin }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav 
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.01 }}
      className={`fixed top-0 w-full border-b z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-background/85 backdrop-blur-md shadow-sm" 
          : "bg-background/70 backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-lg bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
              Utkarsh Chaudhary
            </span>
          </Link>
        </motion.div>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <nav className="flex items-center gap-8">
            {navItems.map((item) => (
              <motion.div
                key={item.path}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href={item.path}
                  className="relative transition-colors hover:text-primary text-foreground group"
                  aria-label={`Navigate to ${item.name}`}
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </motion.div>
            ))}
          </nav>
          {isAdmin && (
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/admin"
                className="flex items-center"
                aria-label="Admin Panel"
              >
                <Shield className="h-5 w-5 text-primary" />
              </Link>
            </motion.div>
          )}
          <AuthButtons />
        </div>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="block md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              aria-label="Open Menu"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isOpen ? 'close' : 'open'}
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </motion.div>
              </AnimatePresence>
            </Button>
          </SheetTrigger>
          <SheetContent 
            side="left" 
            className="w-[280px] sm:w-[350px] flex flex-col overflow-y-auto border-r"
          >
            <div className="py-6 flex justify-center">
              <Link href="/" onClick={() => setIsOpen(false)}>
                <span className="font-bold text-xl bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                  Utkarsh Chaudhary
                </span>
              </Link>
            </div>
            <nav className="flex flex-col gap-1 flex-1 mt-4">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.path}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={item.path}
                    className="block px-4 py-3 text-base hover:bg-muted rounded-lg transition-colors"
                    aria-label={`Navigate to ${item.name}`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
              {isAdmin && (
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: navItems.length * 0.1 }}
                >
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 px-4 py-3 text-base hover:bg-muted rounded-lg transition-colors"
                    aria-label="Admin Panel"
                    onClick={() => setIsOpen(false)}
                  >
                    <Shield className="h-5 w-5 text-primary" />
                    Admin
                  </Link>
                </motion.div>
              )}
            </nav>
            <div className="py-6 flex justify-center">
              <AuthButtons />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </motion.nav>
  );
}
