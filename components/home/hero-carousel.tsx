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

export function HeroCarousel() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  const go = useCallback((direction: number) => {
    setIndex((current) => (current + direction + slides.length) % slides.length)
  }, [])

  useEffect(() => {
    if (paused) return
    const timer = setInterval(() => go(1), AUTOPLAY_MS)
    return () => clearInterval(timer)
  }, [paused, go])

  return (
    <div className="relative h-[360px] w-full overflow-hidden bg-gray-100 md:h-[460px]">
      <motion.div
        className="flex h-full w-full"
        animate={{ x: `-${index * 100}%` }}
        transition={{ type: 'spring', stiffness: 260, damping: 34 }}
      >
        {slides.map((slide, i) => (
          <div key={slide.src} className="relative h-full w-full shrink-0">
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
            />
          </div>
        ))}
      </motion.div>

      <button
        type="button"
        aria-label="Previous slide"
        onClick={() => go(-1)}
        className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-xl text-gray-700 shadow hover:bg-white"
      >
        ‹
      </button>
      <button
        type="button"
        aria-label="Next slide"
        onClick={() => go(1)}
        className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-xl text-gray-700 shadow hover:bg-white"
      >
        ›
      </button>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-3">
        <div className="flex items-center gap-2">
          {slides.map((slide, i) => (
            <button
              key={slide.src}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? 'w-8 bg-emerald-600' : 'w-4 bg-white/70 hover:bg-white'
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          aria-label={paused ? 'Play' : 'Pause'}
          onClick={() => setPaused((value) => !value)}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-xs text-gray-700 shadow hover:bg-white"
        >
          {paused ? '▶' : '❚❚'}
        </button>
      </div>
    </div>
  )
}
