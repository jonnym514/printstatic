/**
 * Print Static — Privacy Policy
 * Required for Pinterest app registration, Stripe, and GDPR/CCPA compliance.
 * URL: https://www.printstatic.com/privacy
 */
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const LAST_UPDATED = "March 27, 2026";
const CONTACT_EMAIL = "privacy@printstatic.com";
const SITE_URL = "https://www.printstatic.com";

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container py-16 max-w-3xl">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-mono text-muted-foreground mb-2">// legal.privacy</p>
          <h1
            className="text-4xl font-bold text-foreground mb-3"
            style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em" }}
          >
            Privacy Policy
          </h1>
          <p className="text-muted-foreground text-sm">
            Last updated: <span className="font-medium text-foreground">{LAST_UPDATED}</span>
          </p>
        </div>

        <div className="prose prose-sm max-w-none text-foreground space-y-8">

          {/* Introduction */}
          <section>
            <p className="text-muted-foreground leading-relaxed">
              Print Static ("<strong className="text-foreground">we</strong>", "
              <strong className="text-foreground">us</strong>", or "
              <strong className="text-foreground">our</strong>") operates the website{" "}
              <a href={SITE_URL} className="text-primary hover:underline">
                {SITE_URL}
              </a>{" "}
              (the "<strong className="text-foreground">Service</strong>"). This Privacy Policy
              explains how we collect, use, disclose, and protect your personal information when
              you use our Service. By using Print Static, you agree to the collection and use of
              information in accordance with this policy.
            </p>
          </section>

          {/* Section 1 */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              1. Information We Collect
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We collect the following categories of personal information:
            </p>
            <div className="border border-border rounded-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Category</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Examples</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Account data", "Name, email address, username", "Account creation and authentication"],
                    ["Transaction data", "Order history, items purchased, payment status", "Order fulfillment and download delivery"],
                    ["Payment data", "Billing address, last 4 digits of card", "Processed by Stripe — we never store full card numbers"],
                    ["Usage data", "Pages visited, clicks, session duration", "Site analytics and performance improvement"],
                    ["Cookie data", "Session tokens, preference cookies", "Authentication, cart persistence, and analytics"],
                    ["Communications", "Support emails, feedback", "Customer service"],
                  ].map(([cat, ex, pur], i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="px-4 py-3 font-medium text-foreground">{cat}</td>
                      <td className="px-4 py-3 text-muted-foreground">{ex}</td>
                      <td className="px-4 py-3 text-muted-foreground">{pur}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              2. How We Use Your Information
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We use the information we collect to operate and improve the Service, including to:
            </p>
            <ul className="mt-3 space-y-1.5 text-muted-foreground list-disc list-inside">
              <li>Process and fulfill your digital download purchases</li>
              <li>Send order confirmations and download links by email</li>
              <li>Provide customer support and respond to inquiries</li>
              <li>Send optional marketing emails (you may unsubscribe at any time)</li>
              <li>Detect and prevent fraud or unauthorized access</li>
              <li>Comply with legal obligations</li>
              <li>Analyze usage patterns to improve site performance and product offerings</li>
            </ul>
          </section>

          {/* Section 3 — Cookies */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              3. Cookies and Tracking Technologies
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We use cookies and similar tracking technologies to operate the Service. Cookies are
              small text files stored on your device. You can control cookies through your browser
              settings, though disabling certain cookies may affect site functionality.
            </p>
            <div className="border border-border rounded-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Cookie Type</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Purpose</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Session cookie (__session)", "Keeps you logged in during your visit", "Session"],
                    ["Cart cookie", "Remembers items in your shopping cart", "30 days"],
                    ["Analytics cookie", "Tracks anonymous page views and performance", "12 months"],
                    ["Preference cookie", "Remembers your cookie consent choice", "12 months"],
                  ].map(([type, purpose, duration], i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="px-4 py-3 font-mono text-xs text-foreground">{type}</td>
                      <td className="px-4 py-3 text-muted-foreground">{purpose}</td>
                      <td className="px-4 py-3 text-muted-foreground">{duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 4 — Third parties */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              4. Third-Party Services
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We share data with the following trusted third-party services to operate the
              platform. Each has its own privacy policy governing their use of your data.
            </p>
            <div className="space-y-4">
              {[
                {
                  name: "Stripe",
                  purpose: "Payment processing. Stripe collects and processes payment card data on our behalf. We never store full card numbers.",
                  link: "https://stripe.com/privacy",
                  data: "Name, email, billing address, payment method details",
                },
                {
                  name: "Pinterest",
                  purpose: "We use the Pinterest API to post product pins to our Pinterest Business account for marketing purposes. We access only our own Pinterest account — no user Pinterest data is collected.",
                  link: "https://policy.pinterest.com/en/privacy-policy",
                  data: "Our Pinterest account access token (not your personal Pinterest data)",
                },
                {
                  name: "Amazon Web Services (S3)",
                  purpose: "Secure cloud storage for digital download files. Files are stored encrypted and accessed only via time-limited signed URLs.",
                  link: "https://aws.amazon.com/privacy/",
                  data: "Digital download files associated with your orders",
                },
                {
                  name: "Manus Platform",
                  purpose: "Authentication and hosting infrastructure. Manus OAuth handles sign-in.",
                  link: "https://manus.im/privacy",
                  data: "Name, email address, user ID",
                },
              ].map(({ name, purpose, link, data }) => (
                <div key={name} className="border border-border rounded-sm p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-foreground">{name}</span>
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      Privacy Policy →
                    </a>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{purpose}</p>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Data shared:</span> {data}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 5 — Data retention */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              5. Data Retention
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your personal data for as long as necessary to provide the Service and
              comply with legal obligations. Order records are retained for a minimum of 7 years
              for tax and accounting purposes. You may request deletion of your account and
              associated data at any time by contacting us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">
                {CONTACT_EMAIL}
              </a>
              . Note that we may retain certain data as required by law.
            </p>
          </section>

          {/* Section 6 — Your rights */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              6. Your Rights
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Depending on your jurisdiction, you may have the following rights regarding your
              personal data:
            </p>
            <ul className="space-y-1.5 text-muted-foreground list-disc list-inside">
              <li><strong className="text-foreground">Access:</strong> Request a copy of the personal data we hold about you</li>
              <li><strong className="text-foreground">Correction:</strong> Request correction of inaccurate data</li>
              <li><strong className="text-foreground">Deletion:</strong> Request deletion of your personal data ("right to be forgotten")</li>
              <li><strong className="text-foreground">Portability:</strong> Request your data in a machine-readable format</li>
              <li><strong className="text-foreground">Opt-out:</strong> Unsubscribe from marketing emails at any time via the unsubscribe link</li>
              <li><strong className="text-foreground">Withdraw consent:</strong> Withdraw consent for cookie-based tracking via your browser settings</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              To exercise any of these rights, contact us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">
                {CONTACT_EMAIL}
              </a>
              . We will respond within 30 days.
            </p>
          </section>

          {/* Section 7 — Security */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              7. Security
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement industry-standard security measures including HTTPS encryption, secure
              session tokens, and encrypted cloud storage. Payment processing is handled entirely
              by Stripe — we never transmit or store full payment card numbers. While we take
              reasonable precautions, no method of transmission over the internet is 100% secure,
              and we cannot guarantee absolute security.
            </p>
          </section>

          {/* Section 8 — Children */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              8. Children's Privacy
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service is not directed to children under the age of 13. We do not knowingly
              collect personal information from children under 13. If you believe we have
              inadvertently collected such information, please contact us immediately at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </section>

          {/* Section 9 — Changes */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              9. Changes to This Policy
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any
              material changes by posting the new policy on this page and updating the "Last
              updated" date. We encourage you to review this policy periodically.
            </p>
          </section>

          {/* Section 10 — Contact */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              10. Contact Us
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy or our data practices, please
              contact us:
            </p>
            <div className="mt-3 border border-border rounded-sm p-4 bg-card text-sm space-y-1">
              <p className="text-foreground font-medium">Print Static</p>
              <p className="text-muted-foreground">
                Email:{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">
                  {CONTACT_EMAIL}
                </a>
              </p>
              <p className="text-muted-foreground">
                Website:{" "}
                <a href={SITE_URL} className="text-primary hover:underline">
                  {SITE_URL}
                </a>
              </p>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
