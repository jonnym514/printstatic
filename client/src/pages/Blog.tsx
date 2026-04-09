import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { ArrowRight, BookOpen, Calendar } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Blog() {
  const { data: posts, isLoading } = trpc.marketing.getBlogPosts.useQuery({ publishedOnly: true });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10">
            <h1 className="text-4xl font-black tracking-tight mb-3">Print Static Blog</h1>
            <p className="text-muted-foreground text-lg">Tips, guides, and inspiration for printable templates and home organisation.</p>
          </div>

          {isLoading && (
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse bg-muted rounded-xl h-32" />
              ))}
            </div>
          )}

          {!isLoading && (!posts || posts.length === 0) && (
            <div className="text-center py-20 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No posts yet</p>
              <p className="text-sm mt-1">Check back soon — new articles are published weekly.</p>
            </div>
          )}

          <div className="space-y-8">
            {posts?.map(post => (
              <article key={post.id} className="group border border-border rounded-xl p-6 hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : ""}</span>
                  {post.keyword && (
                    <>
                      <span>·</span>
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{post.keyword}</span>
                    </>
                  )}
                </div>
                <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{post.title}</h2>
                {post.excerpt && <p className="text-muted-foreground text-sm leading-relaxed mb-4">{post.excerpt}</p>}
                <Link href={`/blog/${post.slug}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all">
                  Read article <ArrowRight className="w-4 h-4" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
