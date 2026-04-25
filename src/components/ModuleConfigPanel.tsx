'use client';

import { useStore, Module } from '@/lib/store';
import { MODULE_CONFIG } from '@/lib/utils';
import { useState } from 'react';

interface Props {
  module: Module;
  onUpdate: (config: Record<string, unknown>) => void;
  onClose: () => void;
  onDelete: () => void;
}

export default function ModuleConfigPanel({ module, onUpdate, onClose, onDelete }: Props) {
  const meta = MODULE_CONFIG[module.type];
  const [config, setConfig] = useState<Record<string, unknown>>(module.config || {});

  const set = (key: string, value: unknown) => {
    const next = { ...config, [key]: value };
    setConfig(next);
    onUpdate(next);
  };

  return (
    <div style={{
      width: '320px',
      background: 'var(--bg-card)',
      borderLeft: '1px solid var(--border)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: `linear-gradient(135deg, ${meta.color}22, transparent)`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            fontSize: '20px',
            background: meta.color + '33',
            padding: '6px',
            borderRadius: '8px',
          }}>{meta.icon}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px' }}>{meta.label}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
              {meta.category}
            </div>
          </div>
        </div>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', color: 'var(--text-muted)',
          cursor: 'pointer', fontSize: '18px', padding: '4px',
        }}>✕</button>
      </div>

      {/* Config fields */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
        {module.type === 'schedule' && (
          <ScheduleConfig config={config} set={set} />
        )}
        {module.type === 'webhook' && (
          <WebhookConfig config={config} set={set} />
        )}
        {module.type === 'carousel_post' && (
          <CarouselConfig config={config} set={set} />
        )}
        {module.type === 'single_post' && (
          <SinglePostConfig config={config} set={set} />
        )}
        {module.type === 'reel' && (
          <ReelConfig config={config} set={set} />
        )}
        {module.type === 'caption_tags' && (
          <CaptionTagsConfig config={config} set={set} />
        )}
        {module.type === 'tag_location' && (
          <TagLocationConfig config={config} set={set} />
        )}
        {module.type === 'if_else' && (
          <IfElseConfig config={config} set={set} />
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
        <button onClick={onDelete}
          style={{
            width: '100%', padding: '10px',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '8px',
            color: '#ef4444',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
          }}>
          🗑 Remove Module
        </button>
      </div>
    </div>
  );
}

// ========= Components =========

function MediaUpload({ 
  value, 
  onChange, 
  label, 
  type = 'image' 
}: { 
  value: string; 
  onChange: (url: string) => void; 
  label: string;
  type?: 'image' | 'video' 
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.url) {
        onChange(data.url);
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase' }}>
        {label}
      </label>
      
      {value && (
        <div style={{ 
          marginBottom: '10px', 
          position: 'relative', 
          borderRadius: '8px', 
          overflow: 'hidden', 
          border: '1px solid var(--border)',
          aspectRatio: type === 'video' ? '16/9' : '1/1',
          background: 'black',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {type === 'image' ? (
            <img src={value} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          ) : (
            <video src={value} controls style={{ width: '100%', height: '100%' }} />
          )}
          <button 
            onClick={() => onChange('')}
            style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', color: 'white', width: '24px', height: '24px', cursor: 'pointer' }}
          >✕</button>
        </div>
      )}

      <div style={{ position: 'relative' }}>
        <input 
          type="file" 
          accept={type === 'image' ? "image/*" : "video/*"}
          onChange={handleUpload}
          style={{ display: 'none' }}
          id={`upload-${label}`}
          disabled={uploading}
        />
        <label 
          htmlFor={`upload-${label}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px',
            background: uploading ? 'var(--bg-card)' : 'rgba(124,58,237,0.1)',
            border: `1px dashed ${uploading ? 'var(--border)' : 'var(--accent)'}`,
            borderRadius: '8px',
            cursor: uploading ? 'wait' : 'pointer',
            fontSize: '13px',
            color: uploading ? 'var(--text-muted)' : 'var(--accent-light)',
            transition: 'all 0.2s'
          }}
        >
          {uploading ? '⏳ Uploading...' : `📤 Click to Upload ${type === 'image' ? 'Image' : 'Video'}`}
        </label>
        {error && <div style={{ color: 'var(--error)', fontSize: '11px', marginTop: '4px' }}>{error}</div>}
      </div>
      
      {value && (
        <div style={{ marginTop: '8px' }}>
          <input 
            className="input" 
            value={value} 
            readOnly 
            style={{ fontSize: '10px', opacity: 0.6, height: '28px' }}
          />
        </div>
      )}
    </div>
  );
}

// ========= Sub-configs =========

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function AccountSelector({ config, set }: { config: Record<string, unknown>; set: (k: string, v: unknown) => void }) {
  const { instagramAccounts } = useStore();
  
  return (
    <Field label="Instagram Account *">
      <select 
        className="input" 
        value={(config.accountId as string) || ''}
        onChange={(e) => set('accountId', e.target.value)}
        style={{ background: 'var(--bg-primary)' }}
      >
        <option value="" disabled>Select an account...</option>
        {instagramAccounts.map(acc => (
          <option key={acc.id} value={acc.id}>
            @{acc.username}
          </option>
        ))}
      </select>
    </Field>
  );
}

function PostTimingSelector({ config, set }: { config: Record<string, unknown>; set: (k: string, v: unknown) => void }) {
  const postTiming = (config.postTiming as string) || 'now';
  
  return (
    <>
      <Field label="Publish Options">
        <div style={{ display: 'flex', gap: '16px', background: 'var(--bg-primary)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: postTiming === 'now' ? 'var(--text-primary)' : 'var(--text-muted)' }}>
            <input type="radio" name={`timing_${Math.random()}`} value="now" 
              checked={postTiming === 'now'} 
              onChange={() => set('postTiming', 'now')} 
              style={{ accentColor: 'var(--accent)' }} />
            🚀 Post Now
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: postTiming === 'schedule' ? 'var(--text-primary)' : 'var(--text-muted)' }}>
            <input type="radio" name={`timing_${Math.random()}`} value="schedule" 
              checked={postTiming === 'schedule'} 
              onChange={() => set('postTiming', 'schedule')}
              style={{ accentColor: 'var(--accent)' }} />
            ⏰ Schedule
          </label>
        </div>
      </Field>
      
      {postTiming === 'schedule' && (
        <Field label="Schedule Date & Time">
          <input type="datetime-local" className="input"
            value={(config.scheduleTime as string) || ''}
            onChange={(e) => set('scheduleTime', e.target.value)} />
        </Field>
      )}
    </>
  );
}

function ScheduleConfig({ config, set }: { config: Record<string, unknown>; set: (k: string, v: unknown) => void }) {
  return (
    <>
      <Field label="Interval">
        <select className="input" value={(config.interval as string) || 'daily'}
          onChange={(e) => set('interval', e.target.value)}
          style={{ background: 'var(--bg-primary)' }}>
          <option value="hourly">Hourly</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </Field>
      <Field label="Time">
        <input type="time" className="input" value={(config.time as string) || '09:00'}
          onChange={(e) => set('time', e.target.value)} />
      </Field>
      {config.interval === 'weekly' && (
        <Field label="Day of Week">
          <select className="input" value={(config.dayOfWeek as string) || 'monday'}
            onChange={(e) => set('dayOfWeek', e.target.value)}
            style={{ background: 'var(--bg-primary)' }}>
            {['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map((d) => (
              <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
            ))}
          </select>
        </Field>
      )}
      <Field label="Timezone">
        <select className="input" value={(config.timezone as string) || 'UTC'}
          onChange={(e) => set('timezone', e.target.value)}
          style={{ background: 'var(--bg-primary)' }}>
          {['UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Asia/Kolkata', 'Asia/Tokyo'].map((tz) => (
            <option key={tz} value={tz}>{tz}</option>
          ))}
        </select>
      </Field>
    </>
  );
}

function WebhookConfig({ config, set }: { config: Record<string, unknown>; set: (k: string, v: unknown) => void }) {
  const url = (config.url as string) || `https://instaflow.app/webhook/${Math.random().toString(36).slice(2, 10)}`;
  return (
    <>
      <Field label="Webhook URL">
        <div style={{ position: 'relative' }}>
          <input className="input" readOnly value={url}
            style={{ paddingRight: '70px', fontSize: '11px' }} />
          <button onClick={() => navigator.clipboard?.writeText(url)}
            style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'var(--accent)', border: 'none', borderRadius: '4px', color: 'white', padding: '4px 8px', cursor: 'pointer', fontSize: '11px' }}>
            Copy
          </button>
        </div>
      </Field>
      <Field label="HTTP Method">
        <select className="input" value={(config.method as string) || 'POST'}
          onChange={(e) => set('method', e.target.value)}
          style={{ background: 'var(--bg-primary)' }}>
          <option>POST</option>
          <option>GET</option>
          <option>PUT</option>
        </select>
      </Field>
      <Field label="Secret Key">
        <input className="input" type="password" placeholder="Optional secret key"
          value={(config.secret as string) || ''}
          onChange={(e) => set('secret', e.target.value)} />
      </Field>
    </>
  );
}

function CarouselConfig({ config, set }: { config: Record<string, unknown>; set: (k: string, v: unknown) => void }) {
  const images = (config.images as string[]) || [''];
  const updateImage = (idx: number, val: string) => {
    const next = [...images];
    next[idx] = val;
    set('images', next);
  };
  return (
    <>
      <AccountSelector config={config} set={set} />
      <AccountSelector config={config} set={set} />
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase' }}>
          Images (${images.length}/10)
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {images.map((img, i) => (
            <div key={i} style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border)' }}>
              {img ? (
                <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🖼️</div>
              )}
              <button onClick={() => set('images', images.filter((_, j) => j !== i))}
                style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(239,68,68,0.8)', border: 'none', borderRadius: '50%', color: 'white', width: '16px', height: '16px', cursor: 'pointer', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
          ))}
          {images.length < 10 && (
            <div style={{ position: 'relative', width: '60px', height: '60px' }}>
              <input 
                type="file" 
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const formData = new FormData();
                  formData.append('file', file);
                  const res = await fetch('/api/upload', { method: 'POST', body: formData });
                  const data = await res.json();
                  if (data.url) set('images', [...images.filter(img => img !== ''), data.url]);
                }}
                style={{ display: 'none' }}
                id="carousel-upload"
              />
              <label htmlFor="carousel-upload" style={{ width: '100%', height: '100%', background: 'rgba(124,58,237,0.1)', border: '1px dashed var(--accent)', borderRadius: '6px', color: 'var(--accent-light)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>+</label>
            </div>
          )}
        </div>
      </div>
      <CaptionHashtagFields config={config} set={set} />
      <PostTimingSelector config={config} set={set} />
    </>
  );
}

function SinglePostConfig({ config, set }: { config: Record<string, unknown>; set: (k: string, v: unknown) => void }) {
  return (
    <>
      <AccountSelector config={config} set={set} />
      <MediaUpload 
        label="Image Upload" 
        value={(config.imageUrl as string) || ''} 
        onChange={(url) => set('imageUrl', url)} 
      />
      <CaptionHashtagFields config={config} set={set} />
      <PostTimingSelector config={config} set={set} />
    </>
  );
}

function ReelConfig({ config, set }: { config: Record<string, unknown>; set: (k: string, v: unknown) => void }) {
  return (
    <>
      <AccountSelector config={config} set={set} />
      <MediaUpload 
        label="Video Upload" 
        type="video"
        value={(config.videoUrl as string) || ''} 
        onChange={(url) => set('videoUrl', url)} 
      />
      <MediaUpload 
        label="Cover Image Upload" 
        value={(config.coverUrl as string) || ''} 
        onChange={(url) => set('coverUrl', url)} 
      />
      <Field label="Caption">
        <textarea className="input" rows={4} placeholder="Write your reel caption..."
          value={(config.caption as string) || ''}
          onChange={(e) => set('caption', e.target.value)}
          style={{ resize: 'vertical' }} />
      </Field>
      <Field label="Share to Feed">
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
          <label className="toggle">
            <input type="checkbox" checked={!!(config.shareToFeed)}
              onChange={(e) => set('shareToFeed', e.target.checked)} />
            <span className="toggle-slider" />
          </label>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Share to Feed</span>
        </label>
      </Field>
      <PostTimingSelector config={config} set={set} />
    </>
  );
}

function CaptionTagsConfig({ config, set }: { config: Record<string, unknown>; set: (k: string, v: unknown) => void }) {
  return (
    <>
      <CaptionHashtagFields config={config} set={set} />
      <Field label="Mentions (@username)">
        <textarea className="input" rows={2} placeholder="@username1 @username2"
          value={(config.mentions as string) || ''}
          onChange={(e) => set('mentions', e.target.value)}
          style={{ resize: 'vertical' }} />
      </Field>
    </>
  );
}

function TagLocationConfig({ config, set }: { config: Record<string, unknown>; set: (k: string, v: unknown) => void }) {
  return (
    <>
      <Field label="Location Name">
        <input className="input" placeholder="e.g. New York, USA"
          value={(config.locationName as string) || ''}
          onChange={(e) => set('locationName', e.target.value)} />
      </Field>
      <Field label="Latitude">
        <input className="input" type="number" placeholder="40.7128"
          value={(config.lat as string) || ''}
          onChange={(e) => set('lat', e.target.value)} />
      </Field>
      <Field label="Longitude">
        <input className="input" type="number" placeholder="-74.0060"
          value={(config.lng as string) || ''}
          onChange={(e) => set('lng', e.target.value)} />
      </Field>
    </>
  );
}

function IfElseConfig({ config, set }: { config: Record<string, unknown>; set: (k: string, v: unknown) => void }) {
  return (
    <>
      <Field label="Condition Variable">
        <select className="input" value={(config.conditionVar as string) || 'time'}
          onChange={(e) => set('conditionVar', e.target.value)}
          style={{ background: 'var(--bg-primary)' }}>
          <option value="time">Time of Day</option>
          <option value="day">Day of Week</option>
          <option value="follower_count">Follower Count</option>
          <option value="engagement_rate">Engagement Rate</option>
        </select>
      </Field>
      <Field label="Operator">
        <select className="input" value={(config.operator as string) || 'equals'}
          onChange={(e) => set('operator', e.target.value)}
          style={{ background: 'var(--bg-primary)' }}>
          <option value="equals">Equals</option>
          <option value="greater_than">Greater Than</option>
          <option value="less_than">Less Than</option>
          <option value="contains">Contains</option>
        </select>
      </Field>
      <Field label="Value">
        <input className="input" placeholder="e.g. morning, 10000, monday"
          value={(config.value as string) || ''}
          onChange={(e) => set('value', e.target.value)} />
      </Field>
      <div style={{
        padding: '12px',
        background: 'var(--bg-primary)',
        borderRadius: '8px',
        fontSize: '12px',
        color: 'var(--text-muted)',
        border: '1px solid var(--border)',
      }}>
        <div style={{ marginBottom: '6px', color: 'var(--success)', fontWeight: 600 }}>✓ True Path → Next module</div>
        <div style={{ color: '#ef4444', fontWeight: 600 }}>✗ False Path → Skip or alternate module</div>
      </div>
    </>
  );
}

function CaptionHashtagFields({ config, set }: { config: Record<string, unknown>; set: (k: string, v: unknown) => void }) {
  return (
    <>
      <Field label="Caption">
        <textarea className="input" rows={4} placeholder="Write your caption here..."
          value={(config.caption as string) || ''}
          onChange={(e) => set('caption', e.target.value)}
          style={{ resize: 'vertical' }} />
      </Field>
      <Field label="Hashtags">
        <textarea className="input" rows={2} placeholder="#instagram #automation #post"
          value={(config.hashtags as string) || ''}
          onChange={(e) => set('hashtags', e.target.value)}
          style={{ resize: 'vertical' }} />
      </Field>
    </>
  );
}
