export default function Privacy() {
  return (
    <div className="py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="font-display text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose prose-lg max-w-none space-y-6 text-muted-foreground">
          <p className="text-lg">
            Your privacy is important to us. This policy explains how we collect, use, and protect 
            your personal information.
          </p>

          <section>
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">1. Information We Collect</h2>
            <p>We collect the following types of information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Personal identification information (Name, NIN, BVN, phone number, email)</li>
              <li>Employment information (Employee ID, Ministry/Department, salary details)</li>
              <li>Financial information (Bank account details, loan history)</li>
              <li>Documents (Passport photos, NIN documents, payment slips, signatures)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">2. How We Use Your Information</h2>
            <p>Your information is used to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Process your loan applications</li>
              <li>Verify your identity and employment status</li>
              <li>Communicate with you about your application status</li>
              <li>Comply with regulatory requirements</li>
              <li>Improve our services</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">3. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your personal information. 
              Your data is encrypted during transmission and storage. Access to personal information 
              is restricted to authorized personnel only.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">4. Information Sharing</h2>
            <p>
              We do not sell or rent your personal information to third parties. We may share your 
              information with:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Yobe State Government (for salary deduction authorization)</li>
              <li>Regulatory authorities as required by law</li>
              <li>Credit bureaus for credit reporting purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">5. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal information</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your data (subject to legal requirements)</li>
              <li>Withdraw consent for data processing</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">6. Contact Us</h2>
            <p>
              For privacy-related inquiries, contact us at:<br />
              Phone: 08142576613<br />
              Email: privacy@yobemfb.com
            </p>
          </section>

          <p className="text-sm mt-8">
            Last updated: January 2025
          </p>
        </div>
      </div>
    </div>
  );
}
