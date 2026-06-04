import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Blog — Smile Dental Clinic',
  description: 'Read the latest news, tips, and insights about dental health and oral hygiene from our experts.',
};

const MOCK_BLOGS = [
  {
    id: '1',
    title: '10 Essential Tips for a Brighter, Whiter Smile',
    excerpt: 'Discover simple daily habits and professional treatments that can help you achieve and maintain a dazzling smile.',
    category: 'Oral Hygiene',
    date: 'Oct 15, 2023',
    readTime: '5 min read',
    imageUrl: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=800&h=500',
  },
  {
    id: '2',
    title: 'Understanding Dental Implants: A Complete Guide',
    excerpt: 'Everything you need to know about dental implants, from the procedure and recovery to long-term care and benefits.',
    category: 'Treatments',
    date: 'Oct 02, 2023',
    readTime: '8 min read',
    imageUrl: 'https://images.unsplash.com/photo-1598256989800-fea5ce5146c1?auto=format&fit=crop&q=80&w=800&h=500',
  },
  {
    id: '3',
    title: 'How to Overcome Dental Anxiety',
    excerpt: 'Fear of the dentist is common, but it shouldn’t stop you from getting care. Here are our top tips for a stress-free visit.',
    category: 'Patient Care',
    date: 'Sep 28, 2023',
    readTime: '4 min read',
    imageUrl: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&q=80&w=800&h=500',
  },
  {
    id: '4',
    title: 'The Truth About Sugar and Cavities',
    excerpt: 'We all know sugar causes cavities, but how exactly does it happen? Learn the science behind tooth decay and how to prevent it.',
    category: 'Education',
    date: 'Sep 15, 2023',
    readTime: '6 min read',
    imageUrl: 'https://images.unsplash.com/photo-1629824694420-a682970725a0?auto=format&fit=crop&q=80&w=800&h=500',
  },
  {
    id: '5',
    title: 'Invisalign vs. Traditional Braces: Which is Right for You?',
    excerpt: 'A comprehensive comparison of the two most popular orthodontic treatments to help you make an informed decision.',
    category: 'Orthodontics',
    date: 'Sep 05, 2023',
    readTime: '7 min read',
    imageUrl: 'https://images.unsplash.com/photo-1598256989667-33e50664d603?auto=format&fit=crop&q=80&w=800&h=500',
  },
  {
    id: '6',
    title: 'Why Kids Need Regular Dental Checkups',
    excerpt: 'Early dental visits set the foundation for a lifetime of healthy smiles. Find out when to schedule your child’s first appointment.',
    category: 'Pediatric',
    date: 'Aug 22, 2023',
    readTime: '4 min read',
    imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=800&h=500',
  },
];

export default function BlogsPage() {
  return (
    <div className={styles.page}>
      <div className="container">
        <header className={styles.header}>
          <div className="badge badge-primary" style={{ marginBottom: 16 }}>Latest Updates</div>
          <h1 className={styles.title}>Dental Health Blog</h1>
          <p className={styles.subtitle}>
            Expert insights, tips, and news to help you maintain a healthy, beautiful smile.
          </p>
        </header>

        <div className={styles.grid}>
          {MOCK_BLOGS.map((blog) => (
            <article key={blog.id} className={`card ${styles.card}`}>
              <div className={styles.imageWrapper}>
                <Image
                  src={blog.imageUrl}
                  alt={blog.title}
                  fill
                  className={styles.image}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className={styles.content}>
                <div className={styles.meta}>
                  <span className={styles.category}>{blog.category}</span>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={14} /> {blog.date}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={14} /> {blog.readTime}</span>
                  </div>
                </div>
                <h2 className={styles.postTitle}>{blog.title}</h2>
                <p className={styles.excerpt}>{blog.excerpt}</p>
                {/* For a real app, this would link to /blogs/${blog.id} */}
                <Link href="#" className={styles.readMore}>
                  Read Article <ArrowRight size={16} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
