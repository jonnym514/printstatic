import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4 p-8">
        <h1 className="text-6xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          404
        </h1>
        <p className="text-xl text-muted-foreground">
          Page not found
        </p>
        <p className="text-sm text-muted-foreground max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link href="/">
          <a className="inline-block mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium">
            Back to Home
          </a>
        </Link>
      </div>
    </div>
  );
}
