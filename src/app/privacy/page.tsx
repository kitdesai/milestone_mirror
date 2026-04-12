export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-peach-50">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="font-display text-3xl font-bold text-gray-800 mb-2">
          Privacy Policy
        </h1>
        <p className="text-gray-500 mb-8">Last updated: April 12, 2026</p>

        <div className="bg-white rounded-2xl shadow-sm border border-cream-200 p-8 space-y-6 text-gray-700 leading-relaxed">
          <section>
            <h2 className="font-display text-xl font-semibold text-gray-800 mb-3">
              Who We Are
            </h2>
            <p>
              Milestone Mirror is operated by kitdesai LLC (&quot;we,&quot;
              &quot;us,&quot; or &quot;our&quot;). We provide a web application
              that allows parents to compare photos of their children at the
              same ages. You can reach us at{" "}
              <a
                href="mailto:support@milestonemirror.com"
                className="text-peach-600 hover:text-peach-700"
              >
                support@milestonemirror.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-gray-800 mb-3">
              Information We Collect
            </h2>
            <p className="mb-3">
              We collect the minimum information needed to provide our service:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Email address</strong> &mdash; used for account
                creation, sign-in verification codes, and essential account
                communications.
              </li>
              <li>
                <strong>Photos you upload</strong> &mdash; images you choose to
                upload to your milestone frames. These are stored securely and
                are only accessible to you.
              </li>
              <li>
                <strong>Child profile information</strong> &mdash; names and
                birth dates of children you add, used solely to organize and
                compare photos by age.
              </li>
              <li>
                <strong>Apple account identifier</strong> &mdash; if you sign in
                with Apple, we receive a unique identifier and your email address
                (or Apple&apos;s private relay address). We do not receive your
                Apple password.
              </li>
              <li>
                <strong>Dropbox access</strong> &mdash; if you connect Dropbox
                for photo comparison, we access photos through Dropbox&apos;s API
                with your permission. We do not store copies of your Dropbox
                photos.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-gray-800 mb-3">
              How We Use Your Information
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide and maintain the Milestone Mirror service</li>
              <li>To authenticate your identity and secure your account</li>
              <li>
                To send verification codes and essential account notifications
              </li>
              <li>To display your uploaded photos within your frames</li>
            </ul>
            <p className="mt-3">
              We do not sell, rent, or share your personal information with third
              parties for marketing purposes. We do not use your photos for
              training AI models or any purpose other than displaying them to
              you.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-gray-800 mb-3">
              Data Storage and Security
            </h2>
            <p className="mb-3">
              Your data is stored using Cloudflare&apos;s infrastructure:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Account data is stored in Cloudflare D1 (a distributed SQLite
                database)
              </li>
              <li>
                Uploaded images are stored in Cloudflare R2 (object storage)
              </li>
              <li>All data is encrypted in transit via HTTPS</li>
              <li>
                Session authentication uses secure, HTTP-only cookies
              </li>
            </ul>
            <p className="mt-3">
              While we take reasonable measures to protect your data, no method
              of electronic storage is 100% secure. We encourage you to use
              strong, unique credentials for your account.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-gray-800 mb-3">
              Children&apos;s Privacy
            </h2>
            <p>
              Milestone Mirror is designed for use by parents and guardians. The
              service is not directed at children under 13, and children do not
              create accounts or interact with the service directly. Parents and
              guardians are responsible for the photos and information they
              upload about their children. If you believe a child has provided us
              with personal information directly, please contact us and we will
              delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-gray-800 mb-3">
              Your Rights
            </h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Access</strong> your data &mdash; view all information
                associated with your account
              </li>
              <li>
                <strong>Delete</strong> your data &mdash; request complete
                deletion of your account and all associated data, including
                uploaded images
              </li>
              <li>
                <strong>Export</strong> your data &mdash; request a copy of your
                data in a portable format
              </li>
              <li>
                <strong>Correct</strong> your data &mdash; update your child
                profiles and account information at any time
              </li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, contact us at{" "}
              <a
                href="mailto:support@milestonemirror.com"
                className="text-peach-600 hover:text-peach-700"
              >
                support@milestonemirror.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-gray-800 mb-3">
              Cookies
            </h2>
            <p>
              We use strictly necessary cookies only: a session cookie to keep
              you signed in, and a temporary state cookie during Apple Sign In
              authentication. We do not use tracking cookies, analytics cookies,
              or third-party advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-gray-800 mb-3">
              Third-Party Services
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Cloudflare</strong> &mdash; hosting, database, and image
                storage
              </li>
              <li>
                <strong>Resend</strong> &mdash; email delivery for verification
                codes
              </li>
              <li>
                <strong>Apple</strong> &mdash; Sign in with Apple authentication
                (optional)
              </li>
              <li>
                <strong>Dropbox</strong> &mdash; photo access for comparison
                feature (optional)
              </li>
            </ul>
            <p className="mt-3">
              Each of these services has their own privacy policy. We only share
              the minimum data necessary for each service to function.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-gray-800 mb-3">
              Changes to This Policy
            </h2>
            <p>
              We may update this privacy policy from time to time. We will notify
              you of any material changes by posting the new policy on this page
              and updating the &quot;last updated&quot; date. Your continued use
              of the service after changes constitutes acceptance of the updated
              policy.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-gray-800 mb-3">
              Contact Us
            </h2>
            <p>
              If you have questions about this privacy policy or your data,
              contact us at{" "}
              <a
                href="mailto:support@milestonemirror.com"
                className="text-peach-600 hover:text-peach-700"
              >
                support@milestonemirror.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
