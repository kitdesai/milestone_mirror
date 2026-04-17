import Link from "next/link";
import { AuthNavButton } from "@/components/AuthNavButton";
import { ScrollFadeIn } from "@/components/ScrollFadeIn";
import s from "./home.module.css";

export const metadata = {
  title: "Milestone Mirror — Compare Your Children at the Same Ages",
  description:
    "Create milestone frames to compare your children's photos side by side. See the resemblance, cherish the differences.",
  openGraph: {
    title: "Milestone Mirror — Compare Your Children at the Same Ages",
    description:
      "Create milestone frames to compare your children's photos side by side.",
    url: "https://milestonemirror.com",
    type: "website",
  },
};

export default function Home() {
  return (
    <div className={s.page}>
      {/* NAV */}
      <nav className={s.nav}>
        <Link href="/" className={s.navBrand}>
          <img src="/icon.svg" alt="" width={36} height={36} />
          Milestone Mirror
        </Link>
        <div className={s.navLinks}>
          <Link href="#how-it-works" className={s.navLink}>How It Works</Link>
          <Link href="#pricing" className={s.navLink}>Pricing</Link>
          <Link href="/blog" className={s.navLink}>Blog</Link>
          <AuthNavButton />
        </div>
      </nav>

      {/* HERO */}
      <section className={s.hero}>
        <div className={s.heroText}>
          <h1>See the <em>resemblance</em>, cherish the difference</h1>
          <p>Compare your children&apos;s photos at the same ages. First smile, first steps, first day of school — side by side, instantly.</p>
          <Link href="/auth" className={s.heroCta}>
            Get Started Free
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
          <p className={s.heroSub}>Free forever for up to 5 frames. No credit card required.</p>
        </div>
        <div className={s.heroVisual}>
          <div className={s.blob1} />
          <div className={s.blob2} />
          <div className={s.phoneMockup}>
            <div className={s.phoneInner}>
              <div className={s.phoneNotch} />
              <div className={s.phoneHeader}>Your Frames</div>
              <div className={s.phoneFrameLabel}>
                <span>First Day</span>
                <span style={{ fontSize: "0.75rem", color: "#6B6360" }}>⠿</span>
              </div>
              <div className={s.phonePhotos}>
                <div className={s.phonePhoto}>
                  <img src="/first_day_1.png" alt="Emma first day" className={s.phonePhotoImage} />
                  <div className={s.phonePhotoPlaceholder}>
                    <span className={s.phonePhotoName}>Emma</span>
                  </div>
                </div>
                <div className={s.phonePhoto}>
                  <img src="/first_day_2.png" alt="Liam first day" className={s.phonePhotoImage} />
                  <div className={s.phonePhotoPlaceholder}>
                    <span className={s.phonePhotoName}>Liam</span>
                  </div>
                </div>
              </div>
              <div className={s.phoneFrameLabel} style={{ marginTop: 4 }}>
                <span>First Steps</span>
                <span style={{ fontSize: "0.75rem", color: "#6B6360" }}>⠿</span>
              </div>
              <div className={s.phonePhotos} style={{ paddingBottom: 24 }}>
                <div className={s.phonePhoto}>
                  <img src="/first_steps_1.png" alt="Emma taking first steps" className={s.phonePhotoImage} />
                  <div className={s.phonePhotoPlaceholder}>
                    <span className={s.phonePhotoName}>Emma</span>
                  </div>
                </div>
                <div className={s.phonePhoto}>
                  <img src="/first_steps_2.png" alt="Liam taking first steps" className={s.phonePhotoImage} />
                  <div className={s.phonePhotoPlaceholder}>
                    <span className={s.phonePhotoName}>Liam</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className={s.proof}>
        <div className={s.proofInner}>
          <blockquote className={s.proofQuote}>&ldquo;I always thought my kids looked alike as babies, but seeing them side by side at the same age? It&apos;s uncanny.&rdquo;</blockquote>
          <cite className={s.proofCite}>— Built by a dad of three who got tired of scrolling through 10,000 photos</cite>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className={`${s.section} ${s.howItWorks}`} id="how-it-works">
        <div className={s.sectionLabel}>How It Works</div>
        <h2 className={s.sectionTitle}>Three steps. Zero friction.</h2>
        <p className={s.sectionSubtitle}>No passwords to remember, no complicated setup. Just your photos and your children.</p>
        <div className={s.steps}>
          <ScrollFadeIn className={s.step}>
            <div className={`${s.stepIcon} ${s.stepIcon1}`}>👶</div>
            <span className={s.stepNum}>Step 1</span>
            <h3>Add Your Children</h3>
            <p>Enter each child&apos;s name and birthday. That&apos;s all Milestone Mirror needs to organize your comparisons.</p>
          </ScrollFadeIn>
          <ScrollFadeIn className={s.step}>
            <div className={`${s.stepIcon} ${s.stepIcon2}`}>🖼️</div>
            <span className={s.stepNum}>Step 2</span>
            <h3>Create Frames</h3>
            <p>Name your milestone — &ldquo;First Smile,&rdquo; &ldquo;6 Months Old,&rdquo; &ldquo;Halloween&rdquo; — and upload a photo of each child.</p>
          </ScrollFadeIn>
          <ScrollFadeIn className={s.step}>
            <div className={`${s.stepIcon} ${s.stepIcon3}`}>✨</div>
            <span className={s.stepNum}>Step 3</span>
            <h3>Compare Instantly</h3>
            <p>Swipe between photos on mobile or view side by side on desktop. Share the comparison with family.</p>
          </ScrollFadeIn>
        </div>
      </section>

      {/* SHOWCASE */}
      <section className={`${s.section} ${s.showcase}`}>
        <div className={s.sectionLabel}>See It in Action</div>
        <h2 className={s.sectionTitle}>Built for the moments that matter</h2>
        <p className={s.sectionSubtitle}>Every frame is a comparison. Every comparison is a memory.</p>

        <ScrollFadeIn className={s.showcaseGrid}>
          <div className={s.showcaseMockup}>
            <div className={s.showcaseFrameHeader}>
              <span className={s.showcaseFrameTitle}>First Food</span>
              <div className={s.showcaseFrameIcons}>
                <span className={s.showcaseFrameIcon}>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
              </svg>
                </span>
                <span className={s.showcaseFrameIcon}>⬇</span>
              </div>
            </div>
            <div className={s.showcasePhotos}>
              <div className={s.showcasePhoto}>
                <img src="/first_food_1.png" alt="Miles first food" className={s.showcasePhotoImage} />
                <span className={s.showcasePhotoName}>Miles</span>
              </div>
              <div className={s.showcasePhoto}>
                <img src="/first_food_2.png" alt="Anna first food" className={s.showcasePhotoImage} />
                <span className={s.showcasePhotoName}>Anna</span>
              </div>
              <div className={s.showcasePhoto}>
                <img src="/first_food_3.png" alt="Max first food" className={s.showcasePhotoImage} />
                <span className={s.showcasePhotoName}>Max</span>
              </div>
            </div>
          </div>
          <div className={s.showcaseText}>
            <h3>Side by side on desktop. Swipe on mobile.</h3>
            <p>On larger screens, see all your children&apos;s photos at once. On your phone, swipe through each child&apos;s photo in a carousel — the comparison just clicks.</p>
            <p>Works beautifully whether you have two kids or five.</p>
          </div>
        </ScrollFadeIn>

        <hr className={s.showcaseDivider} />

        <ScrollFadeIn className={`${s.showcaseGrid} ${s.showcaseGridReverse}`}>
          <div className={s.showcaseMockup}>
            <div className={s.showcaseFrameHeader}>
              <span className={s.showcaseFrameTitle}>Your Frames</span>
            </div>
            <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
              <div className={s.frameListItem} style={{ background: "var(--peach)" }}>
                <span>🏥 First Day</span><span style={{ color: "#6B6360", fontSize: "0.75rem" }}>⠿</span>
              </div>
              <div className={s.frameListItem} style={{ background: "#DDE8D6" }}>
                <span>😊 3 Months Old</span><span style={{ color: "#6B6360", fontSize: "0.75rem" }}>⠿</span>
              </div>
              <div className={s.frameListItem} style={{ background: "#D6DEE8" }}>
                <span>🎃 First Halloween</span><span style={{ color: "#6B6360", fontSize: "0.75rem" }}>⠿</span>
              </div>
              <div className={s.frameListItem} style={{ background: "#E8D6D6" }}>
                <span>🎂 First Birthday</span><span style={{ color: "#6B6360", fontSize: "0.75rem" }}>⠿</span>
              </div>
              <div className={s.frameListItem} style={{ background: "#E8E4D6" }}>
                <span>👣 First Steps</span><span style={{ color: "#6B6360", fontSize: "0.75rem" }}>⠿</span>
              </div>
            </div>
          </div>
          <div className={s.showcaseText}>
            <h3>Drag, drop, reorder. Your story, your way.</h3>
            <p>Arrange your milestone frames however tells your family&apos;s story best. Chronological, by season, by resemblance — you decide.</p>
            <p>Share individual frames with grandparents, or download clean side-by-side images to post anywhere.</p>
          </div>
        </ScrollFadeIn>
      </section>

      {/* FEATURES */}
      <section className={`${s.section} ${s.features}`} id="features">
        <div className={s.sectionLabel}>Why Parents Love It</div>
        <h2 className={s.sectionTitle}>Simple by design</h2>
        <p className={s.sectionSubtitle}>Not a photo album. Not a social network. Just comparison, done perfectly.</p>
        <div className={s.featuresGrid}>
          <ScrollFadeIn className={s.featureCard}>
            <span className={s.featureEmoji}>🔐</span>
            <h3>Private & Encrypted</h3>
            <p>Your photos are encrypted and only accessible to you. No social features, no ads, no data selling. Ever.</p>
          </ScrollFadeIn>
          <ScrollFadeIn className={s.featureCard}>
            <span className={s.featureEmoji}>⚡</span>
            <h3>No Password Needed</h3>
            <p>Sign in with Google, Apple, or a magic code sent to your email. One less password to forget.</p>
          </ScrollFadeIn>
          <ScrollFadeIn className={s.featureCard}>
            <span className={s.featureEmoji}>📱</span>
            <h3>Mobile First</h3>
            <p>Upload straight from your camera roll. Swipe through comparisons with your thumb. Built for how parents actually use their phones.</p>
          </ScrollFadeIn>
          <ScrollFadeIn className={s.featureCard}>
            <span className={s.featureEmoji}>🎯</span>
            <h3>Any Age, Any Milestone</h3>
            <p>Not just babies. Compare school photos, sports pictures, holiday portraits — at any age, for any occasion.</p>
          </ScrollFadeIn>
        </div>
      </section>

      {/* PRICING */}
      <section className={`${s.section} ${s.pricing}`} id="pricing">
        <div className={s.sectionLabel}>Pricing</div>
        <h2 className={s.sectionTitle}>Start free. Grow as they do.</h2>
        <p className={s.sectionSubtitle}>Create your first milestone comparisons at no cost.</p>
        <div className={s.pricingCards}>
          <ScrollFadeIn className={s.pricingCard}>
            <h3>Free</h3>
            <div className={s.pricingPrice}>$0 <span>/ forever</span></div>
            <span className={s.pricingAnnual}>&nbsp;</span>
            <ul className={s.pricingFeatures}>
              <li>Up to <strong>5 frames</strong></li>
              <li>Up to <strong>2 children</strong></li>
              <li>Swipe & side-by-side comparison</li>
              <li>Drag & drop reorder</li>
              <li>Share & download frames</li>
            </ul>
            <Link href="/auth" className={`${s.pricingBtn} ${s.pricingBtnOutline}`}>Get Started</Link>
          </ScrollFadeIn>
          <ScrollFadeIn className={`${s.pricingCard} ${s.pricingCardPopular}`}>
            <div className={s.popularBadge}>Most Popular</div>
            <h3>Premium</h3>
            <div className={s.pricingPrice}>$4.99 <span>/ month</span></div>
            <span className={s.pricingAnnual}>or $49.99/year — save 17%</span>
            <ul className={s.pricingFeatures}>
              <li><strong>Unlimited</strong> frames</li>
              <li><strong>Unlimited</strong> children</li>
              <li>Everything in Free</li>
              <li>Priority support</li>
            </ul>
            <Link href="/auth" className={`${s.pricingBtn} ${s.pricingBtnFill}`}>Start Free, Upgrade Later</Link>
          </ScrollFadeIn>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className={s.finalCta}>
        <div className={s.finalCtaBg} />
        <div className={s.finalCtaContent}>
          <h2>Start capturing milestones today</h2>
          <p>Free to start. No credit card required.</p>
          <Link href="/auth" className={s.finalCtaLink}>
            Get Started Free
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={s.footer}>
        <div className={s.footerLinks}>
          <Link href="/blog" className={s.footerLink}>Blog</Link>
          <Link href="/privacy" className={s.footerLink}>Privacy Policy</Link>
          <Link href="/terms" className={s.footerLink}>Terms of Service</Link>
        </div>
        <p>Milestone Mirror — Your photos, your memories, your privacy.</p>
      </footer>
    </div>
  );
}
