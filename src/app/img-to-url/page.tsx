'use client';

import { useState } from 'react';
import { ExternalLink, Image as ImageIcon, Info } from 'lucide-react';

export default function ImgToUrlPage() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', padding: '32px' }} className="dashboard-page animate-fade-in">
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        marginBottom: '24px',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1, minWidth: '280px' }}>
          <h1 style={{ fontSize: 'clamp(20px, 5vw, 28px)', fontWeight: 800, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}
            className="gradient-text">
            <ImageIcon size={28} style={{ color: 'var(--accent-light)' }} />
            Image to URL Converter
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Convert your local images to public URL links for your automation scenarios.
          </p>
        </div>
        <a 
          href="https://img-to-url-gamma.vercel.app/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="btn-secondary"
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            textDecoration: 'none',
            fontSize: '13px',
            padding: '10px 16px',
            whiteSpace: 'nowrap'
          }}
        >
          <span>Open in New Tab</span>
          <ExternalLink size={14} />
        </a>
      </div>

      {/* Info Card */}
      <div className="card" style={{ 
        padding: '16px', 
        marginBottom: '24px', 
        background: 'rgba(124, 58, 237, 0.05)', 
        borderColor: 'rgba(124, 58, 237, 0.2)',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start'
      }}>
        <Info size={20} style={{ color: 'var(--accent-light)', flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.5' }}>
          <strong style={{ color: 'var(--accent-light)' }}>How it works:</strong> Drag and drop your image file into the converter frame below. Once uploaded, copy the generated public URL and paste it into modules like your <strong>Instagram Post Creator</strong> or other flow attachments in the builder.
        </div>
      </div>

      {/* Iframe Container */}
      <div className="card" style={{ 
        height: 'calc(100vh - 260px)', 
        minHeight: '600px', 
        overflow: 'hidden', 
        position: 'relative',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        {isLoading && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'var(--bg-card)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            zIndex: 10,
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid var(--border)',
              borderTopColor: 'var(--accent)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
            <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500 }}>
              Loading image uploader...
            </div>
          </div>
        )}
        <iframe
          src="https://img-to-url-gamma.vercel.app/"
          title="Image to URL Converter"
          style={{ 
            width: '100%', 
            height: '100%', 
            border: 'none',
            background: 'transparent'
          }}
          onLoad={() => setIsLoading(false)}
          allow="clipboard-write"
        />
      </div>
    </div>
  );
}
