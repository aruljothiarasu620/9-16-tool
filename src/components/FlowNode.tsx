'use client';

import { Handle, Position, NodeProps } from 'reactflow';
import { MODULE_CONFIG } from '@/lib/utils';
import { ModuleType } from '@/lib/store';

interface FlowNodeData {
  type: ModuleType;
  label: string;
  config: Record<string, unknown>;
  selected: boolean;
}

export default function FlowNode({ data, selected }: NodeProps<FlowNodeData>) {
  const meta = MODULE_CONFIG[data.type];
  if (!meta) return null;

  const isIfElse = data.type === 'if_else';
  const isTrigger = meta.category === 'trigger';

  return (
    <div
      className="flow-node"
      style={{
        borderColor: selected ? meta.color : undefined,
        boxShadow: selected ? `0 0 20px ${meta.color}44` : undefined,
      }}
    >
      {/* Incoming handle (not for triggers) */}
      {!isTrigger && (
        <Handle
          type="target"
          position={Position.Left}
          style={{ background: meta.color, borderColor: 'var(--bg-card)', width: 12, height: 12 }}
        />
      )}

      {/* Header */}
      <div className="flow-node-header" style={{ background: meta.color + '22' }}>
        <span style={{
          fontSize: '16px',
          background: meta.color + '33',
          padding: '5px',
          borderRadius: '6px',
        }}>
          {meta.icon}
        </span>
        <div>
          <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>
            {data.label || meta.label}
          </div>
          <div style={{ fontSize: '10px', color: meta.color, textTransform: 'uppercase', fontWeight: 600 }}>
            {meta.category}
          </div>
        </div>
      </div>

      {/* Body - show key config */}
      <div className="flow-node-body">
        {data.type === 'schedule' && Boolean(data.config.interval) && (
          <span>🕐 {data.config.interval as string} @ {(data.config.time as string) || '09:00'}</span>
        )}
        {data.type === 'webhook' && (
          <span>🔗 Awaiting request</span>
        )}
        {data.type === 'carousel_post' && (
          <span>🎠 {((data.config.images as string[]) || ['']).length} images</span>
        )}
        {data.type === 'single_post' && (
          <span>📸 {data.config.imageUrl ? 'Image set' : 'No image'}</span>
        )}
        {data.type === 'reel' && (
          <span>🎬 {data.config.videoUrl ? 'Video set' : 'No video'}</span>
        )}
        {data.type === 'caption_tags' && (
          <span>✍️ {data.config.caption ? 'Caption added' : 'No caption'}</span>
        )}
        {data.type === 'tag_location' && (
          <span>📍 {(data.config.locationName as string) || 'No location'}</span>
        )}
        {data.type === 'if_else' && (
          <span>⚡ {(data.config.conditionVar as string) || 'condition'} {(data.config.operator as string) || 'equals'} {(data.config.value as string) || '?'}</span>
        )}
      </div>

      {/* Output handle(s) */}
      {!isIfElse ? (
        <Handle
          type="source"
          position={Position.Right}
          style={{ background: meta.color, borderColor: 'var(--bg-card)', width: 12, height: 12 }}
        />
      ) : (
        <>
          <Handle
            id="true"
            type="source"
            position={Position.Right}
            style={{ background: 'var(--success)', borderColor: 'var(--bg-card)', top: '40%', width: 12, height: 12 }}
          />
          <Handle
            id="false"
            type="source"
            position={Position.Bottom}
            style={{ background: '#ef4444', borderColor: 'var(--bg-card)', width: 12, height: 12 }}
          />
        </>
      )}
    </div>
  );
}
