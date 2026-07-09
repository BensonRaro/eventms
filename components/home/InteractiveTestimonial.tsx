// generate using ai based on a design from dribbble

import { useState } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface Testimonial {
  id: number;
  image: string;
  stars: number;
  author: string;
  quote: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    image: "/images/20a24cb0-af46-4b4f-878d-eb1a6d6f0bb6.jpg",
    stars: 5,
    author: "THOMAS S. – 2024 ATTENDEE",
    quote: "Excellent quality and incredible networking. 100% worth attending",
  },
  {
    id: 2,
    image: "https://picsum.photos/seed/design2/600/400",
    stars: 5,
    author: "SARA L. – 2024 ATTENDEE",
    quote:
      "An absolute masterpiece of staging and organization. The workshops blew my mind.",
  },
  {
    id: 3,
    image: "https://picsum.photos/seed/tech3/600/400",
    stars: 5,
    author: "MARC K. – 2024 ATTENDEE",
    quote:
      "Met my future co-founders at Hatch. The attendee caliber is second to none.",
  },
];

export default function InteractiveTestimonial() {
  const [index, setIndex] = useState(0);

  const nextSlide = () => {
    setIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const prevSlide = () => {
    setIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const current = TESTIMONIALS[index];
  const nextIdx = (index + 1) % TESTIMONIALS.length;
  const nextCard = TESTIMONIALS[nextIdx];

  return (
    <div
      className="relative w-full max-w-[420px] mx-auto select-none"
      id="testimonial-section"
    >
      <div className="relative flex items-center justify-end">
        {/* Main Active Testimonial Card */}
        <motion.div
          key={current.id}
          initial={{ opacity: 0.8, x: 20, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0.8, x: -20, scale: 0.98 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full bg-[#131518]/90 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] relative z-20 group"
          id={`active-testimonial-${current.id}`}
        >
          {/* Attendee Image */}
          <div className="h-[210px] w-full overflow-hidden bg-neutral-900 relative">
            <img
              src={current.image}
              alt={current.author}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover grayscale brightness-90 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700"
            />
            {/* Visual gradient overlay on top of image */}
            <div className="absolute inset-0 bg-linear-to-t from-[#131518] via-[#131518]/10 to-transparent" />
          </div>

          {/* Testimonial info */}
          <div className="p-5 space-y-3 relative">
            {/* Rating Stars - teal/green as requested */}
            <div
              className="flex gap-1 text-[#03C082]"
              aria-label={`${current.stars} Star Rating`}
            >
              {Array.from({ length: current.stars }).map((_, i) => (
                <span
                  key={i}
                  className="text-sm font-semibold tracking-tighter"
                >
                  ★
                </span>
              ))}
            </div>

            {/* Author */}
            <h4 className="font-display font-bold tracking-tight text-[13px] text-white/95 uppercase leading-none">
              {current.author}
            </h4>

            {/* Quote */}
            <p className="text-neutral-400 text-[12.5px] leading-relaxed font-light">
              &ldquo;{current.quote}&rdquo;
            </p>
          </div>
        </motion.div>

        {/* Peek Card at the background (right offset) */}
        <div
          onClick={nextSlide}
          className="absolute right-[-24px] top-[15%] h-[70%] w-[40px] bg-[#131518]/50 border border-white/5 rounded-l-lg overflow-hidden shadow-2xl z-10 opacity-40 cursor-pointer hover:opacity-60 transition-all duration-300 hidden sm:block"
          id="peeking-testimonial-card"
        >
          <img
            src={nextCard.image}
            alt="Next"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover grayscale brightness-50"
          />
        </div>
      </div>

      {/* Control Buttons & Carousel Indicators */}
      <div className="flex items-center justify-between mt-4 px-1">
        {/* Indicators */}
        <div className="flex gap-1.5">
          {TESTIMONIALS.map((t, idx) => (
            <button
              key={t.id}
              onClick={() => setIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === idx
                  ? "w-5 bg-white"
                  : "w-1.5 bg-white/20 hover:bg-white/40"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Navigation arrows */}
        <div className="flex gap-1">
          <button
            onClick={prevSlide}
            className="p-1.5 bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 rounded-lg text-neutral-400 hover:text-white transition"
            aria-label="Previous testimonial"
            id="prev-testimonial-btn"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextSlide}
            className="p-1.5 bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 rounded-lg text-neutral-400 hover:text-white transition"
            aria-label="Next testimonial"
            id="next-testimonial-btn"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
