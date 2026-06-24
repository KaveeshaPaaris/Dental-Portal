import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, ChevronDown, CalendarCheck } from 'lucide-react';
import { getServiceBySlug, getRelatedServices, SERVICES } from '@/data/services';
import BeforeAfterSlider from '@/components/BeforeAfterSlider';
import styles from './page.module.css';
import { Metadata } from 'next';

export async function generateStaticParams() {
  return SERVICES.map((service) => ({
    slug: service.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = await params;
  const service = getServiceBySlug(p.slug);
  if (!service) return { title: 'Service Not Found' };
  
  return {
    title: `${service.title} | Charming Dental Clinic`,
    description: service.shortDesc,
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const p = await params;
  const service = getServiceBySlug(p.slug);
  
  if (!service) {
    notFound();
  }

  const relatedServices = getRelatedServices(service.relatedSlugs);

  return (
    <div className={styles.page}>
      {/* ── SECTION 1 & 2: Split Hero ────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className="container">
            <div className={styles.heroText}>
              <Link href="/services" className={styles.backLink}>
                &larr; Back to Services
              </Link>
              <div className={styles.badge}>{service.category}</div>
              <h1 className={styles.heroTitle}>{service.title}</h1>
              <p className={styles.heroSub}>{service.heroSummary}</p>
              <div className={styles.heroActions}>
                <Link href="/book" className="btn btn-primary btn-lg">
                  Book Consultation
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.heroImageWrap}>
          <Image
            src={service.heroImage}
            alt={service.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className={styles.heroImage}
          />
        </div>
      </section>

      {/* ── SECTION 3: What Is It? ───────────────────────────── */}
      <section className={styles.sectionWhatIs}>
        <div className="container">
          <div className={styles.contentGrid}>
            <div className={styles.mainContent}>
              <h2 className={styles.sectionTitle}>What is {service.title}?</h2>
              <div className={styles.richText}>
                <p>{service.whatIs}</p>
              </div>
              
              {/* Before/After Slider (if applicable) */}
              {service.showBeforeAfter && service.beforeImage && service.afterImage && (
                <div className={styles.beforeAfterWrap}>
                  <h3 className={styles.subTitle}>Real Results</h3>
                  <BeforeAfterSlider
                    beforeSrc={service.beforeImage}
                    afterSrc={service.afterImage}
                    caption={`${service.title} Treatment`}
                  />
                </div>
              )}
            </div>

            {/* ── SECTION 4: Who is it for? ──────────────────────── */}
            <div className={styles.sidebar}>
              <div className={styles.whoBox}>
                <h3 className={styles.whoTitle}>Who is this suitable for?</h3>
                <ul className={styles.whoList}>
                  {service.whoBenefits.map((benefit, i) => (
                    <li key={i}>
                      <CheckCircle2 size={18} className={styles.checkIcon} aria-hidden="true" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 5: Benefits ──────────────────────────────── */}
      <section className={styles.sectionBenefits}>
        <div className="container">
          <div className={styles.sectionHeaderCenter}>
            <h2>Benefits of Treatment</h2>
            <p>Why patients choose this procedure at Charming Dental Clinic.</p>
          </div>
          <div className={styles.benefitsGrid}>
            {service.benefits.map((benefit, i) => (
              <div key={i} className={styles.benefitCard}>
                <div className={styles.benefitIconWrap}>
                  <benefit.icon size={28} />
                </div>
                <h3>{benefit.title}</h3>
                <p>{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 6: Treatment Steps ───────────────────────── */}
      <section className={styles.sectionSteps}>
        <div className="container">
          <div className={styles.sectionHeaderCenter}>
            <h2>The Treatment Process</h2>
            <p>What to expect when you visit us for {service.title.toLowerCase()}.</p>
          </div>
          <div className={styles.timeline}>
            {service.steps.map((step, i) => (
              <div key={i} className={styles.timelineItem}>
                <div className={styles.timelineNumber}>{i + 1}</div>
                <div className={styles.timelineContent}>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 7: Recovery & Aftercare ──────────────────── */}
      <section className={styles.sectionCare}>
        <div className="container">
          <div className={styles.careGrid}>
            <div className={styles.careBox}>
              <h3>Before Treatment</h3>
              <ul>
                {service.beforeCare.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
            <div className={styles.careBox}>
              <h3>Aftercare & Recovery</h3>
              <ul>
                {service.afterCare.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 8: FAQs ──────────────────────────────────── */}
      {service.faqs.length > 0 && (
        <section className={styles.sectionFaq}>
          <div className="container">
            <div className={styles.faqWrapper}>
              <h2>Frequently Asked Questions</h2>
              <div className={styles.accordion}>
                {service.faqs.map((faq, i) => (
                  <details key={i} className={styles.faqItem}>
                    <summary className={styles.faqQuestion}>
                      {faq.q}
                      <ChevronDown size={20} className={styles.faqIcon} />
                    </summary>
                    <div className={styles.faqAnswer}>
                      <p>{faq.a}</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── SECTION 9: Related Treatments ────────────────────── */}
      {relatedServices.length > 0 && (
        <section className={styles.sectionRelated}>
          <div className="container">
            <h2>Related Treatments</h2>
            <div className={styles.relatedGrid}>
              {relatedServices.map((rs) => (
                <Link key={rs.slug} href={`/services/${rs.slug}`} className={styles.relatedCard}>
                  <div className={styles.relatedImgWrap}>
                    <Image
                      src={rs.image}
                      alt={rs.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className={styles.relatedImg}
                    />
                  </div>
                  <div className={styles.relatedBody}>
                    <h3>{rs.title}</h3>
                    <span className={styles.relatedCta}>
                      Learn More <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── SECTION 10: CTA ──────────────────────────────────── */}
      <section className={styles.sectionCta}>
        <div className="container">
          <div className={styles.ctaBox}>
            <div className={styles.ctaIcon}>
              <CalendarCheck size={40} />
            </div>
            <h2>Ready to transform your smile?</h2>
            <p>Book your consultation today and let our specialists design a personalised treatment plan for you.</p>
            <Link href="/book" className="btn btn-primary btn-xl">
              Book Appointment Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
