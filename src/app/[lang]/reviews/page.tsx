import TestGoogleReviews from '@/components/TestGoogleReviews';

export const dynamic = 'force-static';

export const metadata = {
  title: 'Google Reviews - Qualitour',
  description: 'Read reviews from our happy customers on Google',
};

export default async function ReviewsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">
            {lang === 'zh' ? '客户评价' : 'Customer Reviews'}
          </h1>
          <p className="text-lg text-gray-600">
            {lang === 'zh' 
              ? '看看我们的客户对我们的评价' 
              : 'See what our customers think about us'}
          </p>
        </div>

        <TestGoogleReviews />
      </div>
    </main>
  );
}
