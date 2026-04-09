/* ============================================================
   Print Static — Terms of Use Page
   ============================================================ */

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: `By accessing or using the Print Static website and purchasing any digital products, you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use our site or purchase our products.`,
  },
  {
    title: "2. Digital Products & Delivery",
    content: `Print Static sells digital downloadable files including PDF printables, Canva templates, Microsoft Word templates, and other digital assets. All products are delivered electronically via download link immediately after purchase. No physical goods are shipped. You are responsible for ensuring your device and software are compatible with the file formats offered before purchasing.`,
  },
  {
    title: "3. Personal Use License",
    content: `All products sold on Print Static are licensed for personal, non-commercial use only. Your purchase grants you a non-exclusive, non-transferable license to:\n\n• Download and save the file to your personal devices\n• Print the file for your own personal use\n• Print multiple copies for personal use\n\nYou may NOT:\n\n• Resell, redistribute, or share the digital files in any form\n• Use the files for commercial purposes (e.g., reselling printed copies, using in client work) without a commercial license\n• Claim the designs as your own original work\n• Upload the files to any file-sharing platform or digital marketplace`,
  },
  {
    title: "4. Commercial Use",
    content: `If you wish to use our products for commercial purposes — including but not limited to reselling printed copies, using templates in work for paying clients, or incorporating designs into products you sell — you must purchase a commercial license. Please contact us at support@printstatic.com to inquire about commercial licensing.`,
  },
  {
    title: "5. Refund Policy",
    content: `All sales are final due to the instant digital delivery nature of our products. Please review our full Refund Policy for details on technical issue exceptions and how to contact us for support.`,
  },
  {
    title: "6. Intellectual Property",
    content: `All designs, graphics, layouts, and content sold on Print Static are the intellectual property of Print Static and its designers. They are protected by copyright law. Unauthorized reproduction, distribution, or modification of our products is strictly prohibited and may result in legal action.`,
  },
  {
    title: "7. Accuracy of Product Descriptions",
    content: `We make every effort to accurately describe and display our products, including preview images. However, colors may appear differently on different screens and printers. We do not guarantee that your printed output will exactly match what you see on your screen due to variations in monitor calibration and printer settings.`,
  },
  {
    title: "8. Limitation of Liability",
    content: `Print Static shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our products or website, including but not limited to printing errors, incompatibility with your software, or loss of data. Our total liability to you for any claim arising from your purchase shall not exceed the amount you paid for the product in question.`,
  },
  {
    title: "9. Privacy",
    content: `We collect only the information necessary to process your order (name, email, payment details processed by Stripe). We do not sell or share your personal information with third parties except as required to fulfill your order or comply with legal obligations. Payment information is processed securely by Stripe and is never stored on our servers.`,
  },
  {
    title: "10. Changes to Terms",
    content: `We reserve the right to update these Terms of Use at any time. Changes will be posted on this page with an updated date. Continued use of our website after changes are posted constitutes your acceptance of the revised terms.`,
  },
  {
    title: "11. Contact",
    content: `If you have any questions about these Terms of Use, please contact us at support@printstatic.com.`,
  },
];

export default function Terms() {
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
            /info — terms_of_use
          </p>
          <h1
            className="text-4xl md:text-5xl font-bold text-white"
            style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em" }}
          >
            Terms of Use
          </h1>
          <p className="text-white/50 mt-3 text-sm">Last updated: March 2026</p>
        </div>
      </section>

      <main className="flex-1 container py-16 max-w-3xl">
        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2
                className="text-base font-bold text-foreground mb-3"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {section.title}
              </h2>
              <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {section.content}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-16 border-t border-border pt-8">
          <p className="text-xs text-muted-foreground" style={{ fontFamily: "'Space Mono', monospace" }}>
            © 2026 PRINT_STATIC — printstatic.com · All rights reserved
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
