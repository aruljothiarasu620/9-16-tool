'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';

interface LandingPageProps {
  handleLogin: () => void;
  signingIn: boolean;
  error: string;
}

export default function LandingPage({ handleLogin, signingIn, error }: LandingPageProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  
  // Pricing toggle settings loaded from Firestore
  const [showPricing, setShowPricing] = useState(true);
  const [loadingPricing, setLoadingPricing] = useState(true);

  useEffect(() => {
    const fetchPricingToggle = async () => {
      try {
        const { doc, getDoc } = await import('firebase/firestore');
        const docRef = doc(db, 'config', 'settings');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setShowPricing(snap.data().showPricing !== false);
        }
      } catch (err) {
        console.warn('Error loading pricing config:', err);
      } finally {
        setLoadingPricing(false);
      }
    };
    fetchPricingToggle();
  }, []);

  const setupSteps = [
    {
      step: 1,
      title: 'Ensure Instagram is Public',
      desc: 'Verify that your Instagram account is set to Public under privacy settings. Meta automation APIs do not support private accounts.',
      details: 'Open Instagram ➔ Settings and Activity ➔ Account Privacy ➔ Ensure "Private Account" toggle is OFF.',
      img: '/step1_public.png',
      fallbackIcon: '🔓'
    },
    {
      step: 2,
      title: 'Switch to Professional/Creator Account',
      desc: 'Convert your personal account to a Professional (Creator or Business) account. This is free and takes just a minute.',
      details: 'Why? Meta only allows official publishing permissions, calendar scheduler access, and analytics logs to Professional/Business accounts.',
      img: '/step2_professional.png',
      fallbackIcon: '⚙️'
    },
    {
      step: 3,
      title: 'Link to a Facebook Page',
      desc: 'Link your Instagram Professional profile to a Facebook Page owned by you.',
      details: 'Meta uses Facebook Page permissions as a secure gateway for external apps. Under Instagram Edit Profile ➔ Public Business Information ➔ Page ➔ Connect/Create Page.',
      img: '/step3_facebook.png',
      fallbackIcon: '👥'
    },
    {
      step: 4,
      title: 'Log in to FullSizePost (PC Recommended)',
      desc: 'Visit fullsizepost.online and log in using your Google or Facebook account.',
      details: 'For initial setup, authorization, and workflow configuration, using a Desktop/PC is highly recommended for a smoother experience.',
      img: '/step4_pc_login.png',
      fallbackIcon: '💻'
    },
    {
      step: 5,
      title: 'Configure Scenarios & Post',
      desc: 'Connect your Instagram account via secure Meta OAuth, build your layout templates, schedule, and let it auto-post!',
      details: 'InstaFlow will manage automatic publishing, ad-free layouts (on premium plans), and crossposting while you focus on content.',
      img: '/step5_publish_schedule.png',
      fallbackIcon: '🚀'
    }
  ];

  const features = [
    {
      title: 'Actionable Performance Analytics',
      subtitle: 'Monitor growth, track runs calendar, and analyze engagement metrics from one clean dashboard.',
      desc: 'Our analytics system gives you full transparency into how your scenarios perform. Track subscriber rates, view a visual calendar of successful/failed scheduled runs, and inspect diagnostic execution logs to keep your content funnel operating smoothly.',
      img: '/feature_analytics.png',
      alt: 'Analytics Dashboard Overview screenshot',
      badge: '📊 Statistics Console'
    },
    {
      title: 'Instant Image-to-URL Utility',
      subtitle: 'Convert high-resolution graphics into secure, shareable static URLs within seconds.',
      desc: 'Easily convert any visual asset into a web link. Perfect for scenario nodes, dynamic layout templates, or webhook payloads. Simply drag and drop your image, and copy the instantly generated CDN-backed static URL.',
      img: '/feature_img_to_url.png',
      alt: 'Image to URL tool upload interface screenshot',
      badge: '🔗 CDN Link Generator'
    }
  ];

  const plans = [
    {
      name: '7-Day Free Trial',
      price: '₹0',
      period: '7 days',
      trial: '₹0 Trial',
      features: [
        '1 Connected Instagram Account',
        '2 Automation Scenarios',
        '1 Image per Post limit',
        'Includes Auto-Promotion ad slide',
        'Standard execution queues',
      ],
      cta: 'Start 7-Day Free Trial',
      popular: false,
      glow: false,
    },
    {
      name: 'Monthly Pro',
      price: '₹29',
      period: 'month',
      trial: 'Standard Pack',
      features: [
        'Up to 3 Connected Accounts',
        '10 Automation Scenarios',
        '9 Images per Post limit',
        'Includes Auto-Promotion ad slide',
        'Priority execution queues',
      ],
      cta: 'Go Pro Monthly',
      popular: false,
      glow: false,
    },
    {
      name: 'Yearly Saver',
      price: '₹199',
      period: 'year',
      trial: 'Save 40%',
      features: [
        'Up to 5 Connected Accounts',
        'Unlimited Scenarios',
        '10 Images per Post limit',
        'No watermark / Ad-free posts',
        'Instant 2x faster auto-runs',
      ],
      cta: 'Go Pro Yearly',
      popular: true,
      glow: true,
    },
    {
      name: 'Unlimited Lifetime',
      price: '₹299',
      period: 'one-time',
      trial: 'Best Value',
      features: [
        'Unlimited Connected Accounts',
        'Unlimited Scenarios',
        '10 Images per Post limit',
        'No watermark / Ad-free posts',
        '15-minute auto-runs interval',
        'Lifetime updates & support',
      ],
      cta: 'Get Lifetime Access',
      popular: false,
      glow: false,
    },
  ];

  const faqs = [
    {
      q: 'How does the 7-Day Free Trial work?',
      a: 'Our Free Trial plan costs ₹0 and is valid for 7 days. You get to connect 1 Instagram account, configure up to 2 scenarios, and test all publishing features. No credit card is required to start your trial. After 7 days, you can choose to upgrade to a Monthly, Yearly, or Lifetime plan to keep your automations running.',
    },
    {
      q: 'How does InstaFlow automate posts?',
      a: 'InstaFlow uses a visual drag-and-drop builder to connect events. For example, you can set a schedule module that triggers at a specific time, hooks it to your image database, applies post layouts, and publishes to Instagram, Facebook, and Threads simultaneously.',
    },
    {
      q: 'Is my Instagram account safe with InstaFlow?',
      a: 'Absolutely. InstaFlow connects securely to the official Meta Graph API using secure OAuth login. We never ask for, access, or store your Instagram password, fully complying with Meta platform security policies.',
    },
    {
      q: 'What is the Watermark / Promotion Ad slide on Free Trial and Monthly Pro plans?',
      a: 'To support our platform costs, posts generated under the 7-Day Free Trial and Monthly Pro plans append a short, non-intrusive promotional slide at the end (or as slide 2) that points to fullsizepost.online. To publish clean, ad-free posts, you can upgrade to the Yearly or Lifetime plan.',
    },
    {
      q: 'Can I cancel my subscription at any time?',
      a: 'Yes, absolutely. There are no contract locks or hidden cancellation fees. You can upgrade, downgrade, or cancel your monthly or yearly subscription at any time right from your settings page.',
    },
  ];

  return (
    <div className="landing-container" style={{
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      fontFamily: "'Inter', sans-serif",
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflowX: 'hidden',
    }}>
      {/* Background blobs */}
      <div className="bg-blob-glow" style={{
        position: 'absolute', top: '5%', right: '-15%', width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(6, 148, 148, 0.08) 0%, transparent 70%)',
        zIndex: 0, pointerEvents: 'none'
      }} />
      <div className="bg-blob-glow-2" style={{
        position: 'absolute', top: '45%', left: '-15%', width: '700px', height: '700px',
        background: 'radial-gradient(circle, rgba(224, 51, 143, 0.06) 0%, transparent 70%)',
        zIndex: 0, pointerEvents: 'none'
      }} />

      {/* HEADER */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(241, 245, 249, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        padding: '16px 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/logo.png?v=4" alt="Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
          <span style={{ fontWeight: 800, fontSize: '20px', letterSpacing: '-0.5px' }}>
            Insta<span className="gradient-text">Flow</span>
          </span>
        </div>
        <nav className="desktop-nav" style={{ display: 'flex', gap: '28px', fontSize: '14px', fontWeight: 600 }}>
          <a href="#how-it-works" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }} 
             onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
             onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>How it Works</a>
          <a href="#features" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}
             onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
             onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>Features</a>
          {showPricing && (
            <a href="#pricing" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}
               onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
               onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>Pricing Plans</a>
          )}
          <a href="#faqs" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}
             onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
             onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>FAQs</a>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            className="btn-secondary" 
            onClick={handleLogin}
            disabled={signingIn}
            style={{ padding: '8px 18px', fontSize: '13px', borderRadius: '20px' }}>
            Login
          </button>
          <button 
            className="btn-primary" 
            onClick={handleLogin}
            disabled={signingIn}
            style={{ padding: '8px 20px', fontSize: '13px', borderRadius: '20px', background: 'linear-gradient(135deg, var(--accent), var(--pink))' }}>
            Start Free
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section style={{
        padding: '80px 24px 20px',
        maxWidth: '1100px',
        margin: '0 auto',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'var(--bg-card)', border: '1.5px solid var(--border)',
          padding: '6px 14px', borderRadius: '20px', marginBottom: '24px',
          fontSize: '12px', fontWeight: 600, color: 'var(--accent)'
        }}>
          <span>🎁</span> Start your 7-Day Free Trial at ₹0
        </div>
        
        <h1 style={{
          fontSize: 'clamp(32px, 6.5vw, 64px)',
          fontWeight: 900,
          lineHeight: 1.1,
          letterSpacing: '-1.5px',
          marginBottom: '20px',
          maxWidth: '900px',
          margin: '0 auto 20px'
        }}>
          Automate Instagram Scenarios <br />
          <span style={{ background: 'linear-gradient(135deg, var(--accent), var(--pink))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            While You Keep Creating
          </span>
        </h1>

        <p style={{
          fontSize: 'clamp(15px, 2.5vw, 18px)',
          color: 'var(--text-muted)',
          maxWidth: '650px',
          margin: '0 auto 36px',
          lineHeight: 1.6
        }}>
          Design drag-and-drop visual workflows to publish, schedule, and cross-post full-size 9:16 posts, reels, and stories automatically. Try for free today.
        </p>

        {error && (
          <div style={{
            maxWidth: '360px', margin: '0 auto 20px', padding: '10px 14px',
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: '10px', color: '#dc2626', fontSize: '13px'
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
          <button 
            className="btn-primary" 
            onClick={handleLogin}
            disabled={signingIn}
            style={{ 
              padding: '14px 36px', 
              fontSize: '16px', 
              borderRadius: '30px', 
              background: 'linear-gradient(135deg, var(--accent), var(--pink))',
              display: 'flex', alignItems: 'center', gap: '10px'
            }}>
            {signingIn ? 'Connecting...' : 'Start 7-Day Free Trial (₹0)'} 
            <span>➔</span>
          </button>
        </div>

        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '40px' }}>
          🔒 Secure Instagram OAuth login • No credit card required • Cancel anytime
        </p>
      </section>

      {/* HOW IT WORKS (STEP-BY-STEP SETUP GUIDE) */}
      <section id="how-it-works" style={{
        padding: '80px 24px',
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 800, marginBottom: '12px' }}>
              How to Set Up InstaFlow
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '16px', maxWidth: '600px', margin: '0 auto' }}>
              Follow these simple configurations to link your accounts and launch automated visual publishing.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '80px' }}>
            {setupSteps.map((step, idx) => (
              <div 
                key={step.step} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  gap: '40px',
                  flexDirection: idx % 2 === 0 ? 'row' : 'row-reverse',
                  flexWrap: 'wrap'
                }}>
                
                {/* Text Block */}
                <div style={{ flex: '1 1 400px', minWidth: '320px' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px'
                  }}>
                    <span style={{
                      background: 'var(--accent-glow)', color: 'var(--accent)',
                      fontSize: '14px', fontWeight: 800, width: '32px', height: '32px',
                      borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {step.step}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                      Setup Phase
                    </span>
                  </div>
                  
                  <h3 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '12px', color: 'var(--text-primary)' }}>
                    {step.title}
                  </h3>
                  
                  <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.6, marginBottom: '16px' }}>
                    {step.desc}
                  </p>
                  
                  <div style={{
                    background: 'var(--bg-primary)', borderLeft: '3px solid var(--accent)',
                    padding: '12px 16px', borderRadius: '0 8px 8px 0', fontSize: '13px',
                    color: 'var(--text-primary)', lineHeight: 1.5, fontWeight: 500
                  }}>
                    💡 {step.details}
                  </div>
                </div>

                {/* Illustration / Image Block */}
                <div style={{ 
                  flex: '1 1 350px', 
                  minWidth: '300px',
                  display: 'flex', 
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <div className="card" style={{
                    width: '100%',
                    maxWidth: '400px',
                    height: '240px',
                    background: '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    position: 'relative',
                    borderColor: 'var(--border)'
                  }}>
                    {/* Render actual image if uploaded, otherwise fallback to premium graphic placeholder */}
                    <img 
                      src={step.img} 
                      alt={step.title} 
                      onError={(e) => {
                        // Hide broken image placeholder and show fallback graphic
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          const fallback = parent.querySelector('.fallback-graphic');
                          if (fallback) (fallback as HTMLElement).style.display = 'flex';
                        }
                      }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    
                    {/* Fallback Graphic */}
                    <div 
                      className="fallback-graphic" 
                      style={{
                        display: 'none',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        padding: '24px',
                        textAlign: 'center',
                        width: '100%',
                        height: '100%'
                      }}>
                      <span style={{ fontSize: '48px' }}>{step.fallbackIcon}</span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
                        Screenshot Placeholder ({step.img})
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', maxWidth: '280px' }}>
                        Upload your Instagram setup screenshot as <strong>{step.img.replace('/', '')}</strong> into public folder to show it here.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CORE FEATURES */}
      <section id="features" style={{
        padding: '80px 24px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 800, marginBottom: '12px' }}>
              Advanced Builder Capabilities
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '16px', maxWidth: '600px', margin: '0 auto' }}>
              Deep dive into the utility features powering your social automation.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '100px' }}>
            {features.map((feature, idx) => (
              <div 
                key={feature.title} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  gap: '50px',
                  flexDirection: idx % 2 === 0 ? 'row' : 'row-reverse',
                  flexWrap: 'wrap'
                }}>
                
                {/* Text Block */}
                <div style={{ flex: '1 1 450px', minWidth: '320px' }}>
                  <span style={{
                    background: 'var(--accent-glow)', color: 'var(--accent)',
                    padding: '6px 14px', borderRadius: '20px', fontSize: '12px',
                    fontWeight: 700, display: 'inline-block', marginBottom: '16px'
                  }}>
                    {feature.badge}
                  </span>
                  
                  <h3 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '12px', lineHeight: 1.2 }}>
                    {feature.title}
                  </h3>
                  
                  <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--pink)', marginBottom: '16px', lineHeight: 1.4 }}>
                    {feature.subtitle}
                  </h4>
                  
                  <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.6 }}>
                    {feature.desc}
                  </p>
                </div>

                {/* Mockup Image Block */}
                <div style={{ 
                  flex: '1 1 400px', 
                  minWidth: '320px',
                  display: 'flex', 
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <div className="card" style={{
                    width: '100%',
                    maxWidth: '520px',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08)',
                    borderColor: 'var(--border)'
                  }}>
                    <img 
                      src={feature.img} 
                      alt={feature.alt}
                      style={{ width: '100%', height: 'auto', display: 'block' }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SAFE & COMPLIANT TRUST SECTION */}
      <section id="trust" style={{
        padding: '60px 24px',
        maxWidth: '1100px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          background: 'linear-gradient(165deg, #0b0f17 0%, #171c26 50%, #070a10 100%)',
          borderRadius: '24px',
          border: '1.5px solid var(--border)',
          padding: '48px 40px',
          color: '#ffffff',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '40px',
          flexWrap: 'wrap'
        }}>
          {/* Left info column */}
          <div style={{ flex: '1 1 500px', minWidth: '320px' }}>
            <span style={{
              color: 'var(--accent-light)', fontSize: '12px', fontWeight: 800,
              textTransform: 'uppercase', letterSpacing: '1.5px', display: 'block', marginBottom: '16px'
            }}>
              Safe & Compliant
            </span>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 900, marginBottom: '16px', lineHeight: 1.2 }}>
              Official Meta APIs. <br />No bots. No password sharing.
            </h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '15px', lineHeight: 1.6, marginBottom: '28px', maxWidth: '520px' }}>
              Automate Instagram conversations through secure OAuth and policy-aware platform connections.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                'Meta approved Tech Provider & Business Partner',
                'Official Instagram APIs and platform policies',
                'API-limit safeguards for safer automation',
                'Secure OAuth for Business & Creator accounts'
              ].map((item) => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                  <span style={{ color: 'var(--accent-light)', fontWeight: 900 }}>✓</span>
                  <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right badge/screenshot column */}
          <div style={{ 
            flex: '1 1 350px', 
            minWidth: '300px',
            display: 'flex', 
            flexDirection: 'column', 
            gap: '16px' 
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              {/* Large logo box */}
              <div style={{
                background: 'black',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '28px 16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                position: 'relative'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* Original Meta Logo loop */}
                  <svg viewBox="0 0 24 24" width="36" height="36" fill="#0064e0" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                    <path d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.358-2.602zm-10.201.553c1.265 0 2.058.791 2.675 1.446.307.327.737.871 1.234 1.579l-1.02 1.566c-.757 1.163-1.882 3.017-2.837 4.338-1.191 1.649-1.81 1.817-2.486 1.817-.524 0-1.038-.237-1.383-.794-.263-.426-.464-1.13-.464-2.046 0-2.221.63-4.535 1.66-6.088.454-.687.964-1.226 1.533-1.533a2.264 2.264 0 0 1 1.088-.285z"/>
                  </svg>
                  <span style={{ 
                    fontSize: '28px', 
                    fontWeight: 700, 
                    color: '#ffffff', 
                    fontFamily: '"Optimistic Display", "Optimistic Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                    letterSpacing: '-1px'
                  }}>
                    meta
                  </span>
                </div>
                <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Tech Provider
                </span>
              </div>

              {/* Three smaller badges grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {[
                  { icon: '🚀', text: 'Microsoft for Startups' },
                  { icon: '💳', text: 'Stripe Startup Partner' },
                  { icon: '🛡️', text: 'Meta Verified' }
                ].map((badge) => (
                  <div key={badge.text} style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '10px 6px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    textAlign: 'center'
                  }}>
                    <span style={{ fontSize: '18px' }}>{badge.icon}</span>
                    <span style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.6)', lineHeight: 1.2, fontWeight: 500 }}>
                      {badge.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Know More Button */}
              <a href="/verified" style={{ textDecoration: 'none' }}>
                <button style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '14px',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}>
                  <span>Know More</span>
                  <span style={{ fontSize: '16px' }}>↗</span>
                </button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING PLANS */}
      {showPricing && (
        <section id="pricing" style={{
          padding: '80px 24px',
          borderTop: '1px solid var(--border)',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, marginBottom: '8px' }}>
                Simple, Scale-as-you-grow Pricing
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>
                Start for free to boost your reach, and upgrade only when you need more power.
              </p>
            </div>

            <div className="responsive-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '24px',
              alignItems: 'stretch'
            }}>
              {plans.map((plan) => (
                <div 
                  key={plan.name} 
                  className="card plan-card" 
                  style={{
                    padding: '28px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    border: plan.glow ? '2.5px solid var(--accent)' : '1.5px solid var(--border)',
                    transform: plan.glow ? 'scale(1.02)' : 'none',
                    boxShadow: plan.glow ? '0 12px 30px var(--accent-glow)' : '0 2px 8px rgba(15, 23, 42, 0.05)'
                  }}>
                  
                  {plan.popular && (
                    <span style={{
                      position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)',
                      background: 'linear-gradient(135deg, var(--accent), var(--pink))', color: 'white',
                      padding: '4px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase'
                    }}>
                      Most Popular
                    </span>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {plan.name}
                    </h3>
                    <span style={{
                      fontSize: '11px', fontWeight: 700, color: 'var(--accent)',
                      background: 'var(--accent-glow)', padding: '2px 8px', borderRadius: '12px'
                    }}>
                      {plan.trial}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', margin: '20px 0 8px' }}>
                    <span style={{ fontSize: '38px', fontWeight: 900 }}>{plan.price}</span>
                    <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>/{plan.period}</span>
                  </div>

                  <div style={{ height: '1.5px', background: 'var(--border)', margin: '16px 0' }} />

                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px', flex: 1, fontSize: '13px' }}>
                    {plan.features.map((f, i) => (
                      <li key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        <span style={{ color: 'var(--accent)', fontWeight: 800 }}>✓</span>
                        <span style={{ color: 'var(--text-primary)', lineHeight: 1.4 }}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <button 
                    className="btn-primary" 
                    onClick={handleLogin}
                    disabled={signingIn}
                    style={{ 
                      width: '100%', 
                      borderRadius: '20px',
                      background: plan.glow ? 'linear-gradient(135deg, var(--accent), var(--pink))' : 'var(--text-primary)',
                      color: 'white',
                      padding: '10px 14px',
                      fontSize: '13px'
                    }}>
                    {plan.cta}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQS SECTION */}
      <section id="faqs" style={{
        padding: '60px 24px 80px',
        maxWidth: '750px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>
            Frequently Asked Questions
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
            Everything you need to know about setting up your automations.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className="card" 
              style={{ padding: '20px', cursor: 'pointer' }}
              onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700 }}>{faq.q}</h3>
                <span style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {activeFaq === idx ? '−' : '+'}
                </span>
              </div>
              {activeFaq === idx && (
                <p style={{ marginTop: '12px', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

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
            <a href="/privacy" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy Policy</a>
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

      {/* Embedded Styles for animations */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .plan-card {
            transform: none !important;
            margin-bottom: 12px;
          }
        }
      `}</style>
    </div>
  );
}
