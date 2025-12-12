import { getPostBySlug, getPosts } from '@/lib/wordpress';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface PostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const posts = await getPosts({ per_page: 100 });
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen p-8 sm:p-20">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="text-[#f7941e] hover:text-[#d67a1a] mb-8 inline-block"
        >
          ← Back to posts
        </Link>

        <article className="prose prose-lg max-w-none">
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{post.title.rendered}</h1>
            <div className="flex items-center gap-4 text-gray-600">
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
              {post._embedded?.author?.[0] && (
                <span>By {post._embedded.author[0].name}</span>
              )}
            </div>
          </header>

          {post._embedded?.['wp:featuredmedia']?.[0] && (
            <div className="mb-8">
              <img
                src={post._embedded['wp:featuredmedia'][0].source_url}
                alt={post._embedded['wp:featuredmedia'][0].alt_text || post.title.rendered}
                className="w-full h-auto rounded-lg"
              />
            </div>
          )}

          <div
            className="content"
            dangerouslySetInnerHTML={{ __html: post.content.rendered }}
          />
        </article>
      </div>
    </main>
  );
}
