import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronDown, CalendarCheck } from 'lucide-react';
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

      {/* ── Top bar ──────────────────────────────────────────── */}
      <div className={styles.topBar}>
        <div className="container">
          <Link href="/services" className={styles.backLink}>
            &larr; Back to Services
          </Link>
          <span className={styles.badge}>{service.category}</span>
        </div>
      </div>

      {/* ── SECTION 1: What Is It? ────────────────────────────── */}
      <section className={styles.sectionWhatIs}>
        <div className="container">
          <h2 className={styles.sectionTitle}>What is {service.title}?</h2>
          <p className={styles.richText}>{service.whatIs}</p>

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
      </section>

      {/* ── SECTION 3: Benefits ───────────────────────────────── */}
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

      {/* ── SECTION 4: FAQs ──────────────────────────────────── */}
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

      {/* ── SECTION 5: Related Treatments ────────────────────── */}
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

      {/* ── SECTION 6: CTA ──────────────────────────────────── */}
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
