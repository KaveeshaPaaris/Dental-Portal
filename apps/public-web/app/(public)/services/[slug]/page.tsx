import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown, CalendarCheck } from 'lucide-react';
import { getServiceBySlug, getRelatedServices, SERVICES, REVIEWER_INFO } from '@/data/services';
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
    title: `${service.title} | Charming Dental Clinic - Sri Lanka`,
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

  const relatedServices = getRelatedServices(service.relatedSlugs).slice(0, 3);

  // Schema.org JSON-LD Generation
  const baseUrl = 'https://charmingdentalclinic.com'; // Adjust to actual production URL
  const currentUrl = `${baseUrl}/services/${service.slug}`;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": baseUrl },
      { "@type": "ListItem", "position": 2, "name": "Services", "item": `${baseUrl}/services` },
      { "@type": "ListItem", "position": 3, "name": service.title, "item": currentUrl }
    ]
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": service.title,
    "description": service.shortDesc,
    "provider": {
      "@type": "Organization",
      "name": "Charming Dental Clinic",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Sri Lanka"
      }
    },
    "areaServed": {
      "@type": "Country",
      "name": "Sri Lanka"
    },
    "serviceType": service.category,
    ...(REVIEWER_INFO.name && !REVIEWER_INFO.name.includes('{{') ? {
      "reviewedBy": {
        "@type": "Person",
        "name": REVIEWER_INFO.name
      }
    } : {})
  };

  const faqSchema = service.faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": service.faqs.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  } : null;

  return (
    <div className={styles.page} style={{ color: '#333' }}>
      {/* ── JSON-LD Schemas ───────────────────────────────────── */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}



      {/* ── MAIN EDITORIAL CONTENT ───────────────────────────────────── */}
      <main className="container" style={{ margin: '0 auto', padding: '60px 20px' }}>
        
        {/* 1. H1 & Byline */}
        <h1 style={{ fontSize: '2.5rem', marginBottom: '16px', color: 'var(--color-primary)' }}>{service.title}</h1>
        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '32px', paddingBottom: '16px', borderBottom: '1px solid var(--color-border)' }}>
          <strong>Medically reviewed by {REVIEWER_INFO.name}, {REVIEWER_INFO.credentials}</strong> — Updated {REVIEWER_INFO.dateUpdated}
        </div>

        {/* 2. Intro */}
        <p style={{ fontSize: '1.25rem', lineHeight: '1.6', marginBottom: '32px', color: 'var(--color-text-primary)', fontWeight: '500' }}>
          {service.intro || service.heroSummary}
        </p>

        {/* 3. Jump-To Nav */}
        <nav style={{ background: 'var(--color-surface-2)', padding: '24px', borderRadius: '12px', marginBottom: '40px' }}>
          <h3 style={{ fontSize: '1rem', marginTop: 0, marginBottom: '12px' }}>On this page</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            <li><a href="#what-is" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>What is it?</a></li>
            {service.commonSigns && service.commonSigns.length > 0 && <li><a href="#signs" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>Signs You May Need It</a></li>}
            {service.steps && service.steps.length > 0 && <li><a href="#how-it-works" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>How It Works</a></li>}
            {service.benefits && service.benefits.length > 0 && <li><a href="#benefits" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>Benefits</a></li>}
            {service.afterCare && service.afterCare.length > 0 && <li><a href="#aftercare" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>Aftercare & Recovery</a></li>}
            {service.faqs && service.faqs.length > 0 && <li><a href="#faq" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>FAQ</a></li>}
          </ul>
        </nav>

        {/* 4. What Is It */}
        <section id="what-is" style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '16px' }}>What is {service.title}?</h2>
          <div style={{ lineHeight: '1.8', color: 'var(--color-text-secondary)', fontSize: '1.125rem' }}>
            {(service.whatIs).split('\n\n').map((paragraph, idx) => (
              <p key={idx} style={{ marginBottom: '16px' }}>{paragraph}</p>
            ))}
          </div>
        </section>

        {/* Visual / Image */}
        {service.standaloneImage && (
          <figure style={{ margin: '40px 0' }}>
            <Image
              src={service.standaloneImage}
              alt={`${service.title} procedure representation or clinical diagram`}
              width={800}
              height={450}
              style={{ width: '100%', height: 'auto', borderRadius: '12px' }}
            />
          </figure>
        )}

        {/* 5. Signs You May Need It */}
        {service.commonSigns && service.commonSigns.length > 0 && (
          <section id="signs" style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '16px' }}>Signs You May Need This Treatment</h2>
            <ul style={{ lineHeight: '1.8', color: 'var(--color-text-secondary)', fontSize: '1.125rem', paddingLeft: '24px' }}>
              {service.commonSigns.map((sign, idx) => (
                <li key={idx} style={{ marginBottom: '8px' }}>{sign}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Before / After Slider */}
        {service.showBeforeAfter && service.beforeImage && service.afterImage && (
          <figure style={{ margin: '40px 0' }}>
            <BeforeAfterSlider
              beforeSrc={service.beforeImage}
              afterSrc={service.afterImage}
              caption={`${service.title} Treatment before and after comparison`}
            />
            <figcaption style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '16px', fontStyle: 'italic' }}>
              Individual treatment outcomes vary depending on each patient's oral condition and treatment plan.
            </figcaption>
          </figure>
        )}

        {/* 6. How It Works */}
        {service.steps && service.steps.length > 0 && (
          <section id="how-it-works" style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '16px' }}>How the Treatment Works</h2>
            <ol style={{ lineHeight: '1.8', color: 'var(--color-text-secondary)', fontSize: '1.125rem', paddingLeft: '24px' }}>
              {service.steps.map((step, idx) => (
                <li key={idx} style={{ marginBottom: '16px' }}>
                  <strong>{step.title}:</strong> {step.desc}
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* 7. Benefits */}
        {service.benefits && service.benefits.length > 0 && (
          <section id="benefits" style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '16px' }}>Benefits</h2>
            <ul style={{ lineHeight: '1.8', color: 'var(--color-text-secondary)', fontSize: '1.125rem', paddingLeft: '24px' }}>
              {service.benefits.map((benefit, idx) => (
                <li key={idx} style={{ marginBottom: '8px' }}>
                  {/* Handling legacy array of objects vs strings if necessary, assuming objects based on updated services.ts */}
                  <strong>{typeof benefit === 'string' ? benefit : benefit.title}:</strong> {typeof benefit === 'string' ? '' : benefit.desc}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 8. Aftercare & Recovery */}
        {service.afterCare && service.afterCare.length > 0 && (
          <section id="aftercare" style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '16px' }}>Aftercare & Recovery</h2>
            <ul style={{ lineHeight: '1.8', color: 'var(--color-text-secondary)', fontSize: '1.125rem', paddingLeft: '24px' }}>
              {service.afterCare.map((tip, idx) => (
                <li key={idx} style={{ marginBottom: '8px' }}>{tip}</li>
              ))}
            </ul>
          </section>
        )}

        {/* 9. FAQ */}
        {service.faqs && service.faqs.length > 0 && (
          <section id="faq" style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '24px' }}>Frequently Asked Questions</h2>
            <div className={styles.accordion}>
              {service.faqs.map((faq, i) => (
                <details key={i} className={styles.faqItem}>
                  <summary className={styles.faqQuestion}>
                    {faq.q} <ChevronDown size={20} className={styles.faqIcon} />
                  </summary>
                  <div className={styles.faqAnswer}>
                    <p>{faq.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* 10. The Bottom Line */}
        {service.bottomLine && (
          <section id="bottom-line" style={{ marginBottom: '40px', padding: '24px', background: 'var(--color-surface-2)', borderRadius: '12px' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>The Bottom Line</h2>
            <p style={{ fontSize: '1.125rem', lineHeight: '1.6', color: 'var(--color-text-secondary)', margin: 0 }}>
              {service.bottomLine}
            </p>
          </section>
        )}

        {/* 11. Related Treatments */}
        {relatedServices.length > 0 && (
          <section style={{ marginBottom: '40px', paddingTop: '40px', borderTop: '2px solid var(--color-border)' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Related Treatments</h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexWrap: 'wrap', gap: '32px' }}>
              {relatedServices.map(rs => (
                <li key={rs.slug} style={{ flex: '1 1 220px', maxWidth: '300px' }}>
                  <Link href={`/services/${rs.slug}`} style={{ display: 'flex', flexDirection: 'column', gap: '12px', textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ position: 'relative', width: '100%', height: '160px', borderRadius: '12px', overflow: 'hidden' }}>
                      <Image src={rs.image} alt={`Related treatment: ${rs.title}`} fill style={{ objectFit: 'cover' }} />
                    </div>
                    <span style={{ color: 'var(--color-primary)', textDecoration: 'underline', fontSize: '1.25rem', fontWeight: '500', textAlign: 'center' }}>
                      {rs.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

      </main>

      {/* 12. CTA Banner */}
      <section style={{ background: 'var(--color-primary)', color: '#fff', padding: '60px 20px', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <CalendarCheck size={48} style={{ margin: '0 auto 20px auto', display: 'block' }} />
          <h2 style={{ fontSize: '2rem', marginBottom: '16px', color: '#fff' }}>Ready to transform your smile?</h2>
          <p style={{ fontSize: '1.125rem', marginBottom: '32px', opacity: 0.9 }}>
            Book your consultation today and let our specialists design a personalised treatment plan for you.
          </p>
          <Link href="/book" style={{ display: 'inline-block', background: '#fff', color: 'var(--color-primary)', padding: '16px 32px', borderRadius: '30px', fontWeight: 'bold', textDecoration: 'none', fontSize: '1.125rem' }}>
            Book Appointment Now
          </Link>
        </div>
      </section>

    </div>
  );
}
