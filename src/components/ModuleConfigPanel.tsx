'use client';

import { Module } from '@/lib/store';
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
      <Field label={`Images (${images.length}/10)`}>
        {images.map((img, i) => (
          <div key={i} style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
            <input className="input" placeholder={`Image ${i + 1} URL`}
              value={img} onChange={(e) => updateImage(i, e.target.value)}
              style={{ flex: 1 }} />
            {images.length > 1 && (
              <button onClick={() => set('images', images.filter((_, j) => j !== i))}
                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', color: '#ef4444', padding: '0 10px', cursor: 'pointer' }}>
                ✕
              </button>
            )}
          </div>
        ))}
        {images.length < 10 && (
          <button onClick={() => set('images', [...images, ''])}
            style={{ width: '100%', padding: '8px', background: 'rgba(124,58,237,0.1)', border: '1px dashed var(--accent)', borderRadius: '6px', color: 'var(--accent-light)', cursor: 'pointer', fontSize: '13px' }}>
            + Add Image
          </button>
        )}
      </Field>
      <CaptionHashtagFields config={config} set={set} />
      <Field label="Schedule Time">
        <input type="datetime-local" className="input"
          value={(config.scheduleTime as string) || ''}
          onChange={(e) => set('scheduleTime', e.target.value)} />
      </Field>
    </>
  );
}

function SinglePostConfig({ config, set }: { config: Record<string, unknown>; set: (k: string, v: unknown) => void }) {
  return (
    <>
      <Field label="Image URL">
        <input className="input" placeholder="https://example.com/image.jpg"
          value={(config.imageUrl as string) || ''}
          onChange={(e) => set('imageUrl', e.target.value)} />
      </Field>
      <CaptionHashtagFields config={config} set={set} />
    </>
  );
}

function ReelConfig({ config, set }: { config: Record<string, unknown>; set: (k: string, v: unknown) => void }) {
  return (
    <>
      <Field label="Video URL">
        <input className="input" placeholder="https://example.com/reel.mp4"
          value={(config.videoUrl as string) || ''}
          onChange={(e) => set('videoUrl', e.target.value)} />
      </Field>
      <Field label="Cover Image URL">
        <input className="input" placeholder="https://example.com/cover.jpg"
          value={(config.coverUrl as string) || ''}
          onChange={(e) => set('coverUrl', e.target.value)} />
      </Field>
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
