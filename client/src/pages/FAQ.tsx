/* ============================================================
   Print Static — FAQ Page
   ============================================================ */

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "wouter";

const faqs = [
  {
    category: "Downloads & Delivery",
    questions: [
      {
        q: "How do I receive my files after purchase?",
        a: "Immediately after your payment is confirmed, you will be redirected to the Order Success page where your download links are available. You can also access all your past purchases at any time from your Order History page.",
      },
      {
        q: "What file formats do you provide?",
        a: "Most products are delivered as high-resolution PDF files, ready to print at home or at a professional print shop. Some template products also include Canva or Microsoft Word editable versions — this is noted in each product description.",
      },
      {
        q: "Can I re-download my files if I lose them?",
        a: "Yes. Sign in to your account and visit the Order History page (/orders) to re-download any file you have purchased at any time.",
      },
      {
        q: "How large are the files?",
        a: "Most PDF files are between 1–15 MB, making them fast to download on any connection. Canva template links are cloud-based and require no download.",
      },
    ],
  },
  {
    category: "Printing",
    questions: [
      {
        q: "What paper size are the files designed for?",
        a: "All planners and printables are designed for US Letter (8.5\" × 11\") by default. Many products also include A4 versions. Check the product description for details.",
      },
      {
        q: "What printer settings should I use?",
        a: "For best results, print at 100% scale (do not scale to fit), use the highest quality setting on your printer, and select the correct paper size. We recommend printing on 24 lb or heavier paper for planners.",
      },
      {
        q: "Can I print these at a print shop like FedEx or Staples?",
        a: "Yes. Simply bring the PDF file on a USB drive or email it to the print shop. Our files are print-ready at 300 DPI resolution.",
      },
      {
        q: "Can I print multiple copies?",
        a: "Yes. Your purchase grants you a personal use license to print as many copies as you need for personal use. Commercial printing or resale is not permitted.",
      },
    ],
  },
  {
    category: "Editing & Customization",
    questions: [
      {
        q: "Can I edit the files?",
        a: "Products marked as 'Canva Template' or 'Editable' can be customized in Canva (free account required) or Microsoft Word. Standard PDF files are not editable but are designed to be filled in by hand after printing.",
      },
      {
        q: "Can I change the colors or fonts?",
        a: "Yes, for Canva templates. Open the template in Canva and use the built-in editor to change colors, fonts, and text. Standard PDFs cannot be edited digitally.",
      },
    ],
  },
  {
    category: "Payments & Refunds",
    questions: [
      {
        q: "What payment methods do you accept?",
        a: "We accept all major credit and debit cards (Visa, Mastercard, American Express, Discover) through our secure Stripe checkout. Apple Pay and Google Pay are also supported on compatible devices.",
      },
      {
        q: "Is my payment information secure?",
        a: "Yes. All payments are processed by Stripe, a PCI-DSS Level 1 certified payment processor. We never store your card details on our servers.",
      },
      {
        q: "Do you offer refunds?",
        a: "Due to the instant digital delivery nature of our products, all sales are final and we do not offer refunds once a file has been downloaded. If you experience a technical issue with your file (e.g., corrupted download), please contact us at support@printstatic.com and we will resolve it immediately.",
      },
      {
        q: "Can I use a discount code?",
        a: "Yes. Enter your promo code on the Stripe checkout page before completing your purchase. Discount codes cannot be applied after a purchase is complete.",
      },
    ],
  },
  {
    category: "Licensing & Usage",
    questions: [
      {
        q: "Can I use these files for my business?",
        a: "All products come with a Personal Use License. This allows you to print and use the files for personal, non-commercial purposes. If you need a commercial license (e.g., to use templates in client work or resell printed copies), please contact us.",
      },
      {
        q: "Can I share or resell the files?",
        a: "No. Sharing, redistributing, or reselling our digital files — in original or modified form — is strictly prohibited and a violation of our license terms.",
      },
      {
        q: "Can I use wall art prints for my office or studio?",
        a: "Yes. Personal use includes decorating your home, office, or personal studio. Commercial use (e.g., decorating a business you charge clients to enter, or selling prints) requires a commercial license.",
      },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left py-5 flex items-start justify-between gap-4 group"
      >
        <span
          className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {q}
        </span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5 group-hover:text-primary transition-colors" />
        )}
      </button>
      {open && (
        <p className="text-sm text-muted-foreground pb-5 leading-relaxed pr-8">{a}</p>
      )}
    </div>
  );
}

export default function FAQ() {
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
            /info — faq
          </p>
          <h1
            className="text-4xl md:text-5xl font-bold text-white"
            style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em" }}
          >
            Frequently Asked Questions
          </h1>
          <p className="text-white/50 mt-3 text-sm max-w-xl">
            Everything you need to know about purchasing, downloading, and printing your files.
          </p>
        </div>
      </section>

      <main className="flex-1 container py-16 max-w-3xl">
        <div className="space-y-12">
          {faqs.map((section) => (
            <div key={section.category}>
              <h2
                className="text-xs font-bold text-primary mb-4 tracking-widest uppercase"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                {section.category}
              </h2>
              <div className="border border-border rounded-sm px-6">
                {section.questions.map((item) => (
                  <FAQItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Still have questions */}
        <div className="mt-16 border border-primary/20 bg-primary/5 rounded-sm p-8 text-center">
          <h3
            className="text-lg font-bold text-foreground mb-2"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Still have a question?
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            We typically respond within 24 hours on business days.
          </p>
          <a
            href="mailto:support@printstatic.com"
            className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background font-semibold text-sm hover:bg-primary hover:text-white transition-all"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Contact Support
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
