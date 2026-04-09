/* ============================================================
   Print Static — Refund Policy Page
   ============================================================ */

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function RefundPolicy() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Header */}
      <section className="ink-section py-12">
        <div className="container">
          <p
            className="mono-label mb-3 text-primary"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            /info — refund_policy
          </p>
          <h1
            className="text-4xl md:text-5xl font-bold text-white"
            style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em" }}
          >
            Refund Policy
          </h1>
          <p className="text-white/50 mt-3 text-sm">Last updated: March 2026</p>
        </div>
      </section>

      <main className="flex-1 container py-16 max-w-3xl">
        <div className="prose prose-sm max-w-none space-y-10">

          <section>
            <h2
              className="text-lg font-bold text-foreground mb-3"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              No Refunds on Digital Downloads
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Due to the instant digital delivery nature of our products, <strong className="text-foreground">all sales are final</strong>. Once a digital file has been delivered and made available for download, we are unable to offer refunds, exchanges, or credits.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3">
              By completing a purchase on Print Static, you acknowledge and agree that you are purchasing a digital product and that no physical goods will be shipped. You also confirm that you have read the product description and understand what you are purchasing before completing the transaction.
            </p>
          </section>

          <div className="border-l-4 border-primary pl-6 py-2 bg-primary/5 rounded-r-sm">
            <p className="text-sm text-foreground font-medium">
              We strongly encourage you to review the product preview images and description carefully before purchasing. If you have any questions about a product, please contact us before buying.
            </p>
          </div>

          <section>
            <h2
              className="text-lg font-bold text-foreground mb-3"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Exceptions — Technical Issues
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We stand behind the quality of our products. If you experience any of the following technical issues, we will resolve them at no additional cost:
            </p>
            <ul className="mt-4 space-y-2 text-muted-foreground text-sm">
              {[
                "The file you received is corrupted or cannot be opened",
                "The download link is broken or expired and you cannot access your file",
                "You received the wrong file (different from what was advertised)",
                "The file is missing pages or content that was shown in the product preview",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="text-primary mt-0.5 flex-shrink-0" style={{ fontFamily: "'Space Mono', monospace" }}>→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              To report a technical issue, email us at{" "}
              <a href="mailto:support@printstatic.com" className="text-primary hover:underline">
                support@printstatic.com
              </a>{" "}
              within 7 days of purchase, including your order number and a description of the issue. We will respond within 1 business day.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-bold text-foreground mb-3"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Not Covered
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              The following situations are not eligible for a refund or replacement:
            </p>
            <ul className="mt-4 space-y-2 text-muted-foreground text-sm">
              {[
                "You changed your mind after purchasing",
                "The file does not match your personal aesthetic preferences",
                "You purchased the wrong product by mistake",
                "You do not have the software required to open the file (e.g., Canva, Adobe Reader)",
                "Print quality issues caused by your printer, paper, or print settings",
                "Issues caused by modifications you made to the file",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="text-muted-foreground mt-0.5 flex-shrink-0" style={{ fontFamily: "'Space Mono', monospace" }}>×</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2
              className="text-lg font-bold text-foreground mb-3"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Chargebacks
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              If you initiate a chargeback with your bank or credit card company without first contacting us to resolve the issue, we reserve the right to dispute the chargeback and provide evidence of delivery. We always prefer to resolve issues directly and quickly — please reach out to us first.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-bold text-foreground mb-3"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Contact Us
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have a question about your order or a product, please contact us before purchasing. We are happy to help.
            </p>
            <p className="text-muted-foreground mt-2">
              Email:{" "}
              <a href="mailto:support@printstatic.com" className="text-primary hover:underline">
                support@printstatic.com
              </a>
            </p>
            <p className="text-muted-foreground mt-1">
              Response time: Within 1 business day
            </p>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
