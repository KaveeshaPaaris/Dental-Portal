'use client';

import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import styles from '../../../app/(public)/contact/page.module.css';

export default function MapSection() {
  const [isSatellite, setIsSatellite] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const baseSrc = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63333.71501809776!2d79.77092724863276!3d7.200025499999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae2ef7ab25a6c1b%3A0xc69391f9fb930206!2sDental%20Clinic%20-%20Dr%20Chaminda%20Paris!5e0!3m2!1sen!2slk!4v1781681815874!5m2!1sen!2slk";
  
  // Replacing !5e0 with !5e1 forces satellite view in Google Maps embeds
  const src = isSatellite ? baseSrc.replace('!5e0', '!5e1') : baseSrc;

  // The images for the thumbnail toggle
  const satelliteThumb = 'url("https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=100&q=80")';
  const mapThumb = 'url("https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&w=100&q=80")';

  return (
    <div className={styles.mapWrapper} style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
      <a
        href="https://www.google.com/maps/search/?api=1&query=Dental+Clinic+-+Dr+Chaminda+Paris+Negombo"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          background: '#fff',
          color: '#1a73e8',
          padding: '10px 16px',
          borderRadius: '2px',
          fontSize: '14px',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: 'rgba(0, 0, 0, 0.3) 0px 1px 4px -1px',
          textDecoration: 'none',
          zIndex: 10,
          fontFamily: 'Roboto, Arial, sans-serif'
        }}
      >
        Open in Maps
        <ExternalLink size={16} />
      </a>

      <button
        onClick={() => setIsSatellite(!isSatellite)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title={isSatellite ? "Map imagery" : "Satellite imagery"}
        style={{
          position: 'absolute',
          bottom: '24px',
          left: '24px',
          width: '46px',
          height: '46px',
          border: '2px solid #fff',
          borderRadius: '4px',
          boxShadow: 'rgba(0, 0, 0, 0.3) 0px 1px 4px -1px',
          backgroundImage: isSatellite ? mapThumb : satelliteThumb,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#fff',
          zIndex: 10,
          cursor: 'pointer',
          display: 'block',
          overflow: 'hidden',
          padding: 0,
          transition: 'transform 0.1s ease-in-out'
        }}
        aria-label="Toggle map type"
      >
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          color: '#fff',
          fontSize: '10px',
          textAlign: 'center',
          padding: '4px 0',
          fontFamily: 'Roboto, Arial, sans-serif',
          display: isHovered ? 'block' : 'none'
        }}>
          {isSatellite ? 'Map' : 'Satellite'}
        </div>
      </button>

      <iframe
        src={src}
        width="100%"
        height="100%"
        style={{ border: 0, minHeight: '400px' }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>
  );
}
