import { VerificationBanner } from '@/components/common/verification-banner'
import { FlightSearch } from '@/components/home/flight-search'
import { HeroCarousel } from '@/components/home/hero-carousel'
import { SiteHeader } from '@/components/layout/site-header'
import { getCurrentAccount } from '@/lib/auth/session'
import { airports } from '@/constants/airports'

const sortedAirports = [...airports].sort((a, b) => a.city.localeCompare(b.city))

export default async function HomePage() {
  const account = await getCurrentAccount()

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader account={account} />

      {account && !account.emailVerifiedAt && (
        <div className="mx-auto max-w-6xl px-6 pt-4">
          <VerificationBanner />
        </div>
      )}

      <section className="relative">
        <HeroCarousel />

        <div className="relative z-40 mx-auto -mt-20 max-w-4xl px-4 pb-16">
          <FlightSearch airports={sortedAirports} />
        </div>
      </section>
    </div>
  )
}
