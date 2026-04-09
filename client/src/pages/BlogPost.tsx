import { trpc } from "@/lib/trpc";
import { Link, useParams } from "wouter";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();

  // Use the public getBlogPosts and filter client-side since we don't have a public getBySlug procedure
  const { data: posts, isLoading } = trpc.marketing.getBlogPosts.useQuery({ publishedOnly: true });
  const post = posts?.find(p => p.slug === slug);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container py-12">
          <div className="max-w-2xl mx-auto animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="space-y-3 mt-8">
              {[1,2,3,4,5].map(i => <div key={i} className="h-4 bg-muted rounded" />)}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Article not found</h1>
          <Link href="/blog" className="text-primary hover:underline">← Back to Blog</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container py-12">
        <div className="max-w-2xl mx-auto">
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>

          <header className="mb-8">
            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
              {post.publishedAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(post.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </span>
              )}
              {post.keyword && (
                <span className="flex items-center gap-1.5 bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                  <Tag className="w-3 h-3" /> {post.keyword}
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight mb-4">{post.title}</h1>
            {post.excerpt && <p className="text-muted-foreground text-lg leading-relaxed">{post.excerpt}</p>}
          </header>

          <div
            className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className="mt-12 pt-8 border-t border-border">
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
              <h3 className="font-bold text-lg mb-2">Ready to get organised?</h3>
              <p className="text-muted-foreground text-sm mb-4">Browse our full collection of premium printable templates — instant download, print at home.</p>
              <Link href="/shop" className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity text-sm">
                Shop Templates →
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
