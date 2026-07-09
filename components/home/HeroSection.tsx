"use client";
// also generated using ai

import { motion } from "motion/react";
import { Ticket, ArrowRight, Star } from "lucide-react";
import InteractiveTestimonial from "@/components/home/InteractiveTestimonial";

const HeroSection = () => {
  const HERO_BG = "/images/5332f2a0-4efd-4262-87cc-c5f442dc43e4.jpg";

  return (
    <div className="min-h-screen relative">
      {/* Background Speaker Spotlight Image + Gradients */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={HERO_BG}
          alt="Speaker Spotlight Backdrop"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-90 scale-105 pointer-events-none filter brightness-[1] contrast-[0.5]"
        />
        {/* Dynamic Dark Gradient Overlays */}
        <div className="absolute inset-0 bg-linear-to-t from-[#07080a] via-[#07080a]/65 to-[#07080a]/30" />
        <div className="absolute inset-0 bg-linear-to-r from-[#07080a]/95 via-[#07080a]/50 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-44 bg-linear-to-b from-[#07080a]/90 to-transparent" />
      </div>

      <main
        className="relative z-30 flex-1 flex flex-col justify-center max-w-7xl mx-auto w-full px-6 sm:px-8 lg:px-12 py-12 md:py-10 lg:py-12"
        id="hero-container"
      >
        {/* Subtle top banner/tag */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 bg-white/5 border border-white/10 w-fit px-3 py-1.5 rounded-full text-[11px] font-mono tracking-widest text-neutral-400 uppercase mb-6 sm:mb-8"
        >
          <span className="w-1.5 h-1.5 bg-[#03C082] rounded-full animate-ping" />
          <span>Europe’s Premium UX & Design Summit</span>
        </motion.div>

        {/* Two Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center w-full">
          {/* Left Hero Column */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-left max-w-2xl">
            {/* Title Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, type: "spring", damping: 20 }}
              className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-[68px] tracking-tight leading-[0.95] text-white"
              id="hero-heading"
            >
              HATCH IDEAS THAT <br />
              <span className="text-white">CHANGE THE WORLD</span>
            </motion.h1>

            {/* Description Paragraph */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-neutral-400 text-base sm:text-lg leading-relaxed font-light max-w-xl"
              id="hero-description"
            >
              The event where experienced UX & Design Professionals in Europe
              meet to learn, get inspired and connect. Tickets on sale.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col xs:flex-row gap-4"
              id="hero-ctas"
            >
              <button
                className="bg-white text-black font-semibold px-6 py-3.5 rounded-xl text-sm hover:bg-neutral-100 transition shadow-[0_4px_20px_rgba(255,255,255,0.15)] flex items-center justify-center gap-2 cursor-pointer"
                id="hero-apply-btn"
              >
                <span>Apply for an Invite</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                className="border border-white/20 bg-black/20 backdrop-blur-md text-white font-semibold px-6 py-3.5 rounded-xl text-sm hover:bg-white/10 hover:border-white/40 transition flex items-center justify-center gap-2 cursor-pointer"
                id="hero-tickets-btn"
              >
                <Ticket className="w-4 h-4 text-neutral-400" />
                <span>Get Tickets</span>
              </button>
            </motion.div>
          </div>

          {/* Right Hero Column (Overlapping Card Stack Design) */}
          <div className="lg:col-span-5 relative order-1 lg:order-2 flex justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, type: "spring", stiffness: 120 }}
              className="w-full max-w-[500px]"
            >
              <div className="relative w-full aspect-4/3 flex items-center justify-center select-none py-6">
                {/* BACKGROUND ORBIT LOOPS */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-visible">
                  {/* Large outer dashed orbit loop */}
                  <div className="absolute w-[115%] h-[105%] border-2 border-dashed border-white/5 rounded-[50%] -rotate-12" />
                  {/* Inner thin solid orbit loop */}
                  <div className="absolute w-[98%] h-[88%] border border-white/10 rounded-[50%] rotate-15" />
                </div>

                {/* FLOATING SPARKLES / STARS FROM THE SCREENSHOT */}
                <motion.div
                  className="absolute top-[2%] right-[8%] text-white/40 z-0"
                  animate={{ y: [0, -6, 0], scale: [1, 1.15, 1] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Star className="w-5 h-5 fill-white/10" />
                </motion.div>

                <motion.div
                  className="absolute top-[32%] right-[0%] text-white/30 z-0"
                  animate={{ y: [0, 5, 0], scale: [0.9, 1.1, 0.9] }}
                  transition={{
                    duration: 3.5,
                    delay: 1,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Star className="w-4 h-4 fill-white/5" />
                </motion.div>

                <motion.div
                  className="absolute bottom-[20%] left-[-6%] text-white/40 z-0"
                  animate={{ y: [0, -5, 0], rotate: [0, 45, 0] }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Star className="w-4 h-4" />
                </motion.div>

                {/* MIDDLE STRAIGHT CARD - CURRENT CAROUSEL OF REVIEWS */}
                <div
                  className="relative w-[85%] sm:w-[82%] z-10 translate-x-[8%] translate-y-[4%]"
                  id="middle-straight-carousel"
                >
                  <InteractiveTestimonial />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HeroSection;
