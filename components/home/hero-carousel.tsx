'use client'

import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import { motion } from 'motion/react'

const slides = [
  { src: '/hero/slide-1.jpg', alt: 'City skyline at dusk' },
  { src: '/hero/slide-2.jpg', alt: 'Coastal travel destination' },
  { src: '/hero/slide-3.jpg', alt: 'Local cuisine' },
  { src: '/hero/slide-4.jpg', alt: 'Mountain landscape' },
  { src: '/hero/slide-5.jpg', alt: 'Tropical beach' },
]

const AUTOPLAY_MS = 5000
const SLIDE_PCT = 72

export function HeroCarousel() {
  const [index, setIndex] = useState(0)

  const go = useCallback((direction: number) => {
    setIndex((current) => (current + direction + slides.length) % slides.length)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => go(1), AUTOPLAY_MS)
    return () => clearInterval(timer)
  }, [go])

  return (
    <div className="relative h-80 w-full overflow-hidden md:h-100">
      <motion.div
        className="flex h-full"
        animate={{ x: `${50 - (index + 0.5) * SLIDE_PCT}%` }}
        transition={{ type: 'spring', stiffness: 260, damping: 34 }}
      >
        {slides.map((slide, i) => (
          <div key={slide.src} style={{ width: `${SLIDE_PCT}%` }} className="h-full shrink-0 px-1">
            <div
              className={`relative h-full w-full overflow-hidden transition-opacity duration-300 ${i === index ? 'opacity-100' : 'opacity-50'}`}
            >
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                priority={i === 0}
                sizes="72vw"
                className="object-cover"
              />
            </div>
          </div>
        ))}
      </motion.div>

      <button
        type="button"
        aria-label="Previous slide"
        onClick={() => go(-1)}
        className="absolute left-4 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl text-gray-700 shadow hover:bg-white"
      >
        ‹
      </button>
      <button
        type="button"
        aria-label="Next slide"
        onClick={() => go(1)}
        className="absolute right-4 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl text-gray-700 shadow hover:bg-white"
      >
        ›
      </button>

      <div className="absolute bottom-24 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2">
        {slides.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all ${i === index ? 'w-8 bg-emerald-600' : 'w-4 bg-white/80 hover:bg-white'}`}
          />
        ))}
      </div>
    </div>
  )
}
