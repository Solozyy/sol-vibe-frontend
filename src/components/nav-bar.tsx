"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Wallet, Layers, Shield, Users, Zap, Menu, X } from "lucide-react";
import Image from "next/image";

interface NavBarProps {
  walletConnected: boolean;
  connectWallet: () => void;
  scrollToSection: (id: string) => void;
}

export function NavBar({
  walletConnected,
  connectWallet,
  scrollToSection,
}: NavBarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeHover, setActiveHover] = useState<string | null>(null);
  const [particles, setParticles] = useState<
    Array<{
      left: string;
      top: string;
      delay: string;
      duration: string;
    }>
  >([]);

  useEffect(() => {
    // Generate random particle positions only on client-side
    const newParticles = Array(5)
      .fill(0)
      .map(() => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: `${Math.random() * 1}s`,
        duration: `${1 + Math.random() * 2}s`,
      }));
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const navItems = [
    { id: "problems", label: "Problems", icon: <Shield size={16} /> },
    { id: "why-solana", label: "Why Solana", icon: <Zap size={16} /> },
    { id: "features", label: "Features", icon: <Layers size={16} /> },
    { id: "audience", label: "Audience", icon: <Users size={16} /> },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/10 backdrop-blur-lg border-b border-purple-500/20 shadow-[0_4px_30px_rgba(96,63,255,0.1)]"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <motion.div
            className="flex items-center cursor-pointer"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            onClick={() => scrollToSection("hero")}
          >
            <Image
              src="/solvibe-logo.svg"
              alt="SolVibe"
              width={100}
              height={100}
              className="w-10 h-10"
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-[#9C43FF] to-[#0FFF9A] bg-clip-text text-transparent">
              SolVibe
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                onMouseEnter={() => setActiveHover(item.id)}
                onMouseLeave={() => setActiveHover(null)}
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="relative px-4 py-2 rounded-lg group"
              >
                <span
                  className={`flex items-center gap-2 font-medium transition-colors ${
                    scrolled ? "text-gray-800" : "text-gray-800"
                  } group-hover:text-purple-600`}
                >
                  {item.icon}
                  {item.label}
                </span>

                {/* Animated underline */}
                <motion.span
                  className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-600 to-indigo-600"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: activeHover === item.id ? 1 : 0 }}
                  transition={{ duration: 0.2 }}
                />

                {/* Hover effect */}
                <span className="absolute inset-0 rounded-lg bg-purple-100/0 group-hover:bg-purple-100/50 transition-all duration-300"></span>
              </motion.button>
            ))}
          </div>

          {/* Wallet Button */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={connectWallet}
              className="relative overflow-hidden group bg-gradient-to-r from-[#9C43FF] to-[#0FFF9A] cursor-pointer"
              size="lg"
            >
              {/* Animated background */}
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#9C43FF] to-[#0FFF9A] group-hover:bg-gradient-to-r group-hover:from-[#0FFF9A] group-hover:to-[#9C43FF] transition-all duration-500 ease-in-out"></span>

              {/* Animated glow effect */}
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#9C43FF]/50 to-[#0FFF9A]/50 group-hover:from-[#0FFF9A]/50 group-hover:to-[#9C43FF]/50 blur-md group-hover:opacity-75 opacity-0 transition-all duration-500 ease-in-out"></span>

              {/* Button content */}
              <span className="relative flex items-center gap-2 z-10">
                <span className="relative">
                  <Wallet size={18} className="text-black" />
                  <span
                    className={`absolute -top-1 -right-1 flex h-2 w-2 transition-opacity duration-300 ${
                      walletConnected ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                </span>
                <span className="font-medium text-black">
                  {walletConnected ? "Connected" : "Connect Wallet"}
                </span>

                {/* Animated particles on hover */}
                <span className="absolute top-0 left-0 w-full h-full">
                  {particles.map((particle, i) => (
                    <span
                      key={i}
                      className="absolute w-1 h-1 bg-white rounded-full opacity-0 group-hover:animate-particle"
                      style={{
                        left: particle.left,
                        top: particle.top,
                        animationDelay: particle.delay,
                        animationDuration: particle.duration,
                      }}
                    />
                  ))}
                </span>
              </span>
            </Button>
          </motion.div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="relative"
            >
              <motion.div
                initial={false}
                animate={{ rotate: mobileMenuOpen ? 90 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.div>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{
          height: mobileMenuOpen ? "auto" : 0,
          opacity: mobileMenuOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="md:hidden overflow-hidden bg-white/10 backdrop-blur-lg"
      >
        <div className="container mx-auto px-6 py-4 space-y-4">
          {navItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => {
                scrollToSection(item.id);
                setMobileMenuOpen(false);
              }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-purple-100/50 transition-colors"
            >
              <span className="p-2 rounded-full bg-purple-100">
                {item.icon}
              </span>
              <span className="font-medium">{item.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.nav>
  );
}
