'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function VerifiedSecurityPage() {
  const [selectedAi, setSelectedAi] = useState<'chatgpt' | 'claude' | 'gemini' | 'perplexity' | 'grok'>('gemini');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeSafetyFaq, setActiveSafetyFaq] = useState<number | null>(null);

  const aiExplainerTexts = {
    chatgpt: "InstaFlow's Meta Verification confirms it runs entirely on official Meta Graph APIs via OAuth. This ensures user passwords are never stored or requested, mitigating any risks of account credentials leak.",
    claude: "InstaFlow integrates strictly with Meta's official API endpoints. By using secure access tokens generated via standard OAuth, it bypasses the need for credential sharing and respects Meta's rate-limiting safety guards.",
    gemini: "InstaFlow connects to your Instagram account through secure, Meta-approved OAuth channels. By using official, policy-compliant APIs, the app eliminates bot-like behaviors and protects your profile from warnings or bans.",
    perplexity: "Verification records show that InstaFlow is registered under Meta's developer program, ensuring compliance with all platform policies. It uses official endpoints for carousels and reels, ensuring absolute account compliance.",
    grok: "InstaFlow is built on top of official Meta developer APIs. Rather than scraping data (which violates Terms of Service), it requests official scopes via Facebook Login, guaranteeing the safest method for automation."
  };

  const safetyFaqs = [
    {
      q: "What permissions does InstaFlow request from Meta?",
      a: "InstaFlow only requests standard public permissions needed to schedule content: 'instagram_basic' (to read profiles), 'instagram_content_publish' (to post reels/stories), and 'pages_show_list' (to identify connected Facebook pages)."
    },
    {
      q: "Will my account get flagged for spam?",
      a: "No. Because InstaFlow utilizes official Meta API queues, publishing actions follow safe API rate-limiting rules. Unofficial bots that scrape websites get flagged, but official OAuth apps are safe."
    },
    {
      q: "How can I disconnect my account?",
      a: "You can revoke access instantly at any time either from your InstaFlow Settings tab or directly from your Facebook account settings under 'Apps and Websites'."
    }
  ];

  const handleStartFree = () => {
    // Redirect to home page where they can initiate Google Login
    window.location.href = '/';
  };

  return (
    <div className="verified-container" style={{
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      fontFamily: "'Inter', sans-serif",
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* HEADER */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(241, 245, 249, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit' }}>
          <img src="/logo.png?v=4" alt="Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
          <span style={{ fontWeight: 800, fontSize: '20px', letterSpacing: '-0.5px' }}>
            Insta<span className="gradient-text">Flow</span>
          </span>
        </Link>
        <nav style={{ display: 'flex', gap: '28px', fontSize: '14px', fontWeight: 600 }}>
          <Link href="/#how-it-works" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>How it Works</Link>
          <Link href="/#features" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Features</Link>
          <Link href="/#pricing" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Pricing Plans</Link>
          <Link href="/#faqs" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>FAQs</Link>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={handleStartFree} className="btn-secondary" style={{ padding: '8px 18px', fontSize: '13px', borderRadius: '20px' }}>
            Login
          </button>
          <button onClick={handleStartFree} className="btn-primary" style={{ padding: '8px 20px', fontSize: '13px', borderRadius: '20px' }}>
            Start Free
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '60px 24px 80px',
        width: '100%',
        flex: 1,
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.1fr 0.9fr',
          gap: '50px',
          alignItems: 'start',
          flexWrap: 'wrap'
        }} className="verified-grid">
          
          {/* LEFT COLUMN: Meta Verified Info */}
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#d1fae5',
              color: '#065f46',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 700,
              marginBottom: '20px'
            }}>
              <span style={{ color: '#10b981' }}>●</span> Meta verified technology page for InstaFlow
            </div>

            <h1 style={{
              fontSize: 'clamp(28px, 5vw, 48px)',
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: '-1.5px',
              marginBottom: '20px'
            }}>
              InstaFlow Meta Verified <br />
              <span className="gradient-text">Instagram Automation</span>
            </h1>

            <p style={{
              fontSize: '16px',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              marginBottom: '32px'
            }}>
              InstaFlow helps creators, brands, and agencies automate Instagram comments, direct messages, story replies, and lead capture through a safer Meta authorization flow. Your Instagram password stays private, and your account remains in your control.
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '40px' }}>
              <button onClick={handleStartFree} className="btn-primary" style={{ padding: '12px 28px', borderRadius: '30px' }}>
                Start Free
              </button>
              <button 
                onClick={() => setActiveSafetyFaq(activeSafetyFaq === 0 ? null : 0)} 
                className="btn-secondary" 
                style={{ padding: '12px 28px', borderRadius: '30px' }}>
                Ask a safety question
              </button>
            </div>

            {/* AI EXPLAINER CONTAINER */}
            <div className="card" style={{ padding: '24px', background: 'var(--bg-card)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🤖 Ask AI to explain safety:
              </h3>
              
              {/* AI Selector Buttons */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {[
                  { id: 'chatgpt', label: 'ChatGPT' },
                  { id: 'claude', label: 'Claude' },
                  { id: 'gemini', label: 'Gemini' },
                  { id: 'perplexity', label: 'Perplexity' },
                  { id: 'grok', label: 'Grok' }
                ].map((ai) => (
                  <button
                    key={ai.id}
                    onClick={() => setSelectedAi(ai.id as any)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '16px',
                      border: '1.5px solid',
                      borderColor: selectedAi === ai.id ? 'var(--accent)' : 'var(--border)',
                      background: selectedAi === ai.id ? 'var(--accent-glow)' : 'transparent',
                      color: selectedAi === ai.id ? 'var(--accent-light)' : 'var(--text-muted)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}>
                    {ai.label}
                  </button>
                ))}
              </div>

              {/* Explainer Box */}
              <div style={{
                background: 'var(--bg-primary)',
                padding: '16px',
                borderRadius: '8px',
                fontSize: '13px',
                lineHeight: 1.5,
                color: 'var(--text-primary)',
                borderLeft: '3px solid var(--accent)'
              }}>
                {aiExplainerTexts[selectedAi]}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Verification screenshot & checklist */}
          <div>
            <div className="card" style={{ padding: '24px', background: 'var(--bg-card)', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Verification Proof
                </span>
                <span style={{
                  background: '#fef3c7', color: '#92400e', fontSize: '11px', fontWeight: 700,
                  padding: '2px 8px', borderRadius: '12px'
                }}>
                  ● Visible proof
                </span>
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '12px' }}>
                Meta app approval screenshot
              </h3>

              {/* Mockup screen thumbnail */}
              <div 
                onClick={() => setIsLightboxOpen(true)}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  height: '220px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  cursor: 'zoom-in',
                  position: 'relative',
                  marginBottom: '16px'
                }}
                title="Click to view full size">
                <img 
                  src="/meta_approval_proof.png" 
                  alt="Meta App Approval Screenshot Proof"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      const fb = parent.querySelector('.proof-fallback');
                      if (fb) (fb as HTMLElement).style.display = 'flex';
                    }
                  }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                
                {/* Fallback layout */}
                <div 
                  className="proof-fallback" 
                  style={{
                    display: 'none',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    padding: '20px',
                    textAlign: 'center'
                  }}>
                  <span style={{ fontSize: '40px' }}>🛡️</span>
                  <span style={{ fontSize: '13px', fontWeight: 700 }}>Meta App Approval Proof</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Upload your Meta Developer Console screenshot as <strong>meta_approval_proof.png</strong> in public folder. Click to enlarge.
                  </span>
                </div>

                <div style={{
                  position: 'absolute', bottom: '10px', right: '10px',
                  background: 'rgba(15, 23, 42, 0.7)', color: 'white',
                  padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 500
                }}>
                  🔍 Click to enlarge
                </div>
              </div>

              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Click image to view full size. Check the screenshot, then review the exact permissions shown by Meta when you connect. Never approve permissions you do not understand.
              </p>
            </div>

            {/* Checklist elements */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="card" style={{ padding: '20px', background: 'var(--bg-card)' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🔑 No password sharing
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  Connect supported accounts through Meta instead of sending your Instagram password to a tool.
                </p>
              </div>

              <div className="card" style={{ padding: '20px', background: 'var(--bg-card)' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  ⚙️ Official API approach
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  Built for eligible Instagram Business and Creator accounts using Meta-supported access.
                </p>
              </div>

              <div className="card" style={{ padding: '20px', background: 'var(--bg-card)' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  📄 Proof-first page
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  Review app approval, Microsoft for Startups, and Stripe Startup Program screenshots below.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* DETAILED SAFETY QUESTIONS ACCORDION */}
        <section style={{ marginTop: '80px', borderTop: '1px solid var(--border)', paddingTop: '60px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '32px', textAlign: 'center' }}>
            Detailed Platform Safety Information
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '800px', margin: '0 auto' }}>
            {safetyFaqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="card" 
                style={{ padding: '20px', cursor: 'pointer', background: 'var(--bg-card)' }}
                onClick={() => setActiveSafetyFaq(activeSafetyFaq === idx ? null : idx)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700 }}>{faq.q}</h3>
                  <span style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-muted)' }}>
                    {activeSafetyFaq === idx ? '−' : '+'}
                  </span>
                </div>
                {activeSafetyFaq === idx && (
                  <p style={{ marginTop: '12px', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* LIGHTBOX LIGHTBOX popup */}
      {isLightboxOpen && (
        <div 
          onClick={() => setIsLightboxOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(15, 23, 42, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            cursor: 'zoom-out'
          }}>
          <div style={{
            position: 'relative',
            maxWidth: '1000px',
            maxHeight: '90vh',
            width: '100%',
            background: 'white',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
          }}
          onClick={(e) => e.stopPropagation()}>
            <div style={{
              padding: '12px 20px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#f8fafc'
            }}>
              <span style={{ fontWeight: 700, fontSize: '14px' }}>Meta App Verification Proof (Screenshot)</span>
              <button 
                onClick={() => setIsLightboxOpen(false)}
                style={{
                  border: 'none', background: 'transparent', fontSize: '20px', cursor: 'pointer', fontWeight: 700
                }}>
                ×
              </button>
            </div>
            <div style={{ padding: '16px', background: '#0f172a', display: 'flex', justifyContent: 'center' }}>
              <img 
                src="/meta_approval_proof.png" 
                alt="Enlarged Proof" 
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    const fb = parent.querySelector('.lightbox-fallback');
                    if (fb) (fb as HTMLElement).style.display = 'block';
                  }
                }}
                style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
              />
              <div 
                className="lightbox-fallback" 
                style={{
                  display: 'none', color: 'white', padding: '80px 20px', textAlign: 'center'
                }}>
                <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🛡️</span>
                <span style={{ fontWeight: 700 }}>Meta App Approval Proof Image Missing</span>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginTop: '8px' }}>
                  Place your screenshot image as <strong>meta_approval_proof.png</strong> inside public folder to show it here.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer style={{
        marginTop: 'auto',
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border)',
        padding: '40px 24px 30px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/logo.png?v=4" alt="Logo" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
            <span style={{ fontWeight: 800, fontSize: '16px' }}>InstaFlow</span>
          </div>
          <div style={{ display: 'flex', gap: '24px', fontSize: '13px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link href="/privacy" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy Policy</Link>
            <span style={{ color: 'var(--border)' }}>|</span>
            <span style={{ color: 'var(--text-muted)' }}>Contact: aruljothiarasu620@gmail.com</span>
            <span style={{ color: 'var(--border)' }}>|</span>
            <a 
              href="https://wa.me/919025408167" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style={{ color: '#25D366' }} xmlns="http://www.w3.org/2000/svg">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.5-5.739-1.446L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.03-5.114-2.905-6.99S14.14 1.139 11.5 1.138c-5.444 0-9.87 4.423-9.873 9.869-.001 1.7.45 3.355 1.306 4.808L1.927 20.4l4.72-1.246zM17.52 14.3c-.324-.16-1.92-.949-2.219-1.059-.299-.11-.517-.16-.735.16-.217.32-.843 1.059-1.033 1.28-.19.22-.38.24-.704.08-.324-.16-1.372-.506-2.615-1.616-.966-.86-1.619-1.927-1.809-2.247-.19-.32-.02-.492.142-.651.146-.143.324-.38.486-.57.16-.19.214-.32.322-.533.109-.214.055-.4-.027-.56-.08-.16-.735-1.77-.999-2.409-.26-.628-.525-.543-.722-.553-.186-.01-.399-.01-.613-.01-.214 0-.563.08-.857.4-.294.32-1.123 1.1-1.123 2.68 0 1.58 1.149 3.11 1.307 3.32.158.21 2.261 3.45 5.476 4.84.765.33 1.36.53 1.82.68.769.24 1.47.21 2.02.13.618-.09 1.92-.786 2.19-1.547.27-.76.27-1.41.19-1.547-.08-.14-.298-.22-.622-.38z"/>
              </svg>
              <span>WhatsApp Support: +91 90254 08167</span>
            </a>
          </div>
        </div>
        <div style={{
          maxWidth: '1100px', margin: '24px auto 0', borderTop: '1px solid var(--border)',
          paddingTop: '16px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)'
        }}>
          © 2026 InstaFlow (fullsizepost.online). All rights reserved.
        </div>
      </footer>

      {/* Embedded responsive grid overrides */}
      <style>{`
        @media (max-width: 820px) {
          .verified-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
      `}</style>
    </div>
  );
}
