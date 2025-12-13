'use client';

import Container from '@/components/ui/Container';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main>
      <Container className="py-16">
        <h1 className="text-2xl font-semibold text-gray-900">Something went wrong</h1>
        <p className="mt-3 text-gray-700">
          The site hit an unexpected error while rendering this page.
        </p>
        <div className="mt-6 rounded-md border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm font-medium text-gray-900">Error</p>
          <p className="mt-1 break-words font-mono text-sm text-gray-700">{error.message}</p>
          {error.digest ? (
            <p className="mt-2 text-xs text-gray-500">Digest: {error.digest}</p>
          ) : null}
        </div>
        <div className="mt-6">
          <button
            type="button"
            className="rounded-md bg-[#f7941e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#e68a1c]"
            onClick={() => reset()}
          >
            Try again
          </button>
        </div>
      </Container>
    </main>
  );
}
