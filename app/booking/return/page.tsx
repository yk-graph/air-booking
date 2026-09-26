import Link from 'next/link'

export default async function ReturnPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const params = await searchParams

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="mb-4 text-2xl font-semibold">Return date — coming soon</h1>
      <p className="mb-6 text-gray-600">This step will let you pick the return date.</p>
      <pre className="mb-6 overflow-x-auto rounded bg-gray-100 p-4 text-sm">
        {JSON.stringify(params, null, 2)}
      </pre>
      <Link href="/" className="text-emerald-700 underline">
        Back to home
      </Link>
    </main>
  )
}
