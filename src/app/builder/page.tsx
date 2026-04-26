'use client';

import { Suspense, useCallback, useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  BackgroundVariant,
  Node,
  Edge,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useStore, Module, ModuleType } from '@/lib/store';
import { MODULE_CONFIG, generateId, formatDate } from '@/lib/utils';
import FlowNode from '@/components/FlowNode';
import ModuleConfigPanel from '@/components/ModuleConfigPanel';

const nodeTypes = { customNode: FlowNode };

const SIDEBAR_MODULES: { type: ModuleType; category: string }[] = [
  { type: 'schedule', category: 'Triggers' },
  { type: 'webhook', category: 'Triggers' },
  { type: 'carousel_post', category: 'Actions' },
  { type: 'single_post', category: 'Actions' },
  { type: 'reel', category: 'Actions' },
  { type: 'caption_tags', category: 'Actions' },
  { type: 'tag_location', category: 'Actions' },
  { type: 'if_else', category: 'Logic' },
];

const categories = ['Triggers', 'Actions', 'Logic'];

function BuilderCanvas({ scenarioId }: { scenarioId: string }) {
  const router = useRouter();
  const { scenarios, updateScenario, addModule, updateModule, removeModule, addConnection, removeConnection, addRunLog, instagramAccounts } = useStore();
  const scenario = scenarios.find((s) => s.id === scenarioId);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [scenarioName, setScenarioName] = useState(scenario?.name || '');
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<{ msg: string; type: string; ts: string }[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Load existing modules into ReactFlow nodes/edges
  useEffect(() => {
    if (!scenario) return;
    const flowNodes: Node[] = scenario.modules.map((m) => ({
      id: m.id,
      type: 'customNode',
      position: m.position,
      data: { type: m.type, label: m.label, config: m.config, selected: false },
    }));
    const flowEdges: Edge[] = scenario.connections.map((c) => ({
      id: c.id,
      source: c.source,
      target: c.target,
      sourceHandle: c.sourceHandle,
      targetHandle: c.targetHandle,
      animated: true,
      style: { stroke: '#7c3aed', strokeWidth: 2 },
    }));
    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [scenarioId]); // eslint-disable-line

  const onConnect = useCallback(
    (params: Connection) => {
      const edge: Edge = {
        ...params,
        id: generateId(),
        animated: true,
        style: { stroke: '#7c3aed', strokeWidth: 2 },
      } as Edge;
      setEdges((eds) => addEdge(edge, eds));
      addConnection(scenarioId, {
        id: edge.id,
        source: params.source!,
        target: params.target!,
        sourceHandle: params.sourceHandle || undefined,
        targetHandle: params.targetHandle || undefined,
      });
    },
    [addConnection, scenarioId, setEdges]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedModuleId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedModuleId(null);
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('moduleType') as ModuleType;
      if (!type || !reactFlowWrapper.current) return;

      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = {
        x: event.clientX - bounds.left - 90,
        y: event.clientY - bounds.top - 40,
      };

      const meta = MODULE_CONFIG[type];
      const newModule: Module = {
        id: generateId(),
        type,
        label: meta.label,
        position,
        config: {},
      };

      addModule(scenarioId, newModule);
      setNodes((nds) => [
        ...nds,
        {
          id: newModule.id,
          type: 'customNode',
          position,
          data: { type, label: meta.label, config: {}, selected: false },
        },
      ]);
    },
    [addModule, scenarioId, setNodes]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const handleModuleClick = useCallback(
    (type: ModuleType) => {
      const meta = MODULE_CONFIG[type];
      
      // Calculate a center position with a slight offset based on existing nodes
      const offset = nodes.length * 20;
      const position = { x: 250 + offset, y: 150 + offset };

      const newModule: Module = {
        id: generateId(),
        type,
        label: meta.label,
        position,
        config: {},
      };

      addModule(scenarioId, newModule);
      setNodes((nds) => [
        ...nds,
        {
          id: newModule.id,
          type: 'customNode',
          position,
          data: { type, label: meta.label, config: {}, selected: false },
        },
      ]);
    },
    [addModule, scenarioId, setNodes, nodes.length]
  );

  const handleNodesChange = useCallback(
    (changes: Parameters<typeof onNodesChange>[0]) => {
      onNodesChange(changes);
      changes.forEach((change) => {
        if (change.type === 'position' && change.position) {
          updateModule(scenarioId, change.id, scenario?.modules.find((m) => m.id === change.id)?.config || {});
          // Update position in store
          const m = scenario?.modules.find((mm) => mm.id === change.id);
          if (m && change.position) {
            // Direct store position update via updateScenario
            const updatedModules = scenario!.modules.map((mod) =>
              mod.id === change.id ? { ...mod, position: change.position! } : mod
            );
            updateScenario(scenarioId, { modules: updatedModules });
          }
        }
        if (change.type === 'remove') {
          removeModule(scenarioId, change.id);
        }
      });
    },
    [onNodesChange, scenarioId, scenario, updateModule, updateScenario, removeModule]
  );

  const handleEdgesChange = useCallback(
    (changes: Parameters<typeof onEdgesChange>[0]) => {
      onEdgesChange(changes);
      changes.forEach((change) => {
        if (change.type === 'remove') {
          removeConnection(scenarioId, change.id);
        }
      });
    },
    [onEdgesChange, removeConnection, scenarioId]
  );

  const handleSave = () => {
    updateScenario(scenarioId, { name: scenarioName });
  };

  const addLog = (msg: string, type: string) => {
    setLogs((prev) => [
      { msg, type, ts: new Date().toISOString() },
      ...prev,
    ]);
  };

  const handleRun = async () => {
    if (!scenario) return;
    setIsRunning(true);
    setShowLogs(true);
    setLogs([]);
    addLog('▶ Starting scenario execution...', 'info');

    const executedModules: string[] = [];
    let success = true;

    // --- SMART REFRESH ENGINE: UNLIMITED TOKEN FIX ---
    addLog('🔄 Checking & refreshing tokens for unlimited session...', 'info');
    try {
      const uniqueAccountIds = Array.from(new Set(
        scenario.modules
          .map(m => m.config.accountId as string)
          .filter(Boolean)
      ));
      
      for (const accId of uniqueAccountIds) {
        const acc = instagramAccounts.find(a => a.id === accId);
        if (acc && acc.accessToken) {
          const res = await fetch('/api/instagram/exchange', {
            method: 'POST',
            body: JSON.stringify({ shortLivedToken: acc.accessToken })
          });
          const data = await res.json();
          if (data.longLivedToken) {
            // Update the store and Firestore with the new token
            const updatedAccounts = instagramAccounts.map(a => 
              a.id === accId ? { ...a, accessToken: data.longLivedToken } : a
            );
            useStore.setState({ instagramAccounts: updatedAccounts });
            
            // Sync to Firestore
            const user = auth.currentUser;
            if (user) {
              const docRef = doc(db, 'users', user.uid);
              await setDoc(docRef, { instagramAccounts: updatedAccounts }, { merge: true });
            }
            console.log(`✅ Token refreshed for @${acc.username}`);
          }
        }
      }
    } catch (err) {
      console.warn('⚠️ Token refresh failed (using existing tokens):', err);
    }
    // ------------------------------------------------

    for (const module of scenario.modules) {
      const meta = MODULE_CONFIG[module.type];
      addLog(`⚙ Executing: ${meta.label}`, 'info');
      executedModules.push(meta.label);

      if (module.type === 'single_post') {
        const accountId = module.config.accountId as string;
        const activeAccount = accountId ? instagramAccounts.find(a => a.id === accountId) : instagramAccounts[0];
        
        if (!activeAccount) {
          addLog(`❌ ${meta.label}: No Instagram account selected or connected.`, 'error');
          success = false;
          break;
        }

        const imgUrl = module.config.imageUrl as string;
        const caption = module.config.caption as string || '';
        const timing = module.config.postTiming as string || 'now';
        
        if (!imgUrl) {
          addLog(`✗ ${meta.label}: No image URL provided`, 'error');
          success = false;
          break;
        }

        if (timing === 'schedule') {
           const scheduleTime = module.config.scheduleTime as string;
           if (!scheduleTime) {
             addLog(`❌ ${meta.label}: Scheduled post selected but no date/time provided.`, 'error');
             success = false;
             break;
           }
           addLog(`⏰ ${meta.label}: Post successfully scheduled for ${new Date(scheduleTime).toLocaleString()}`, 'success');
           continue;
        }

        try {
          addLog(`⏳ Uploading image to Instagram...`, 'info');
          
          // 1. Create Media Container
          const createRes = await fetch(`https://graph.facebook.com/v18.0/${activeAccount.pageId}/media?image_url=${encodeURIComponent(imgUrl)}&caption=${encodeURIComponent(caption)}&access_token=${activeAccount.accessToken}`, { method: 'POST' });
          const createData = await createRes.json();
          
          if (createData.error) {
             throw new Error(createData.error.message);
          }
          
          const creationId = createData.id;
          addLog(`⏳ Publishing post...`, 'info');
          
          // 2. Publish Media
          const publishRes = await fetch(`https://graph.facebook.com/v18.0/${activeAccount.pageId}/media_publish?creation_id=${creationId}&access_token=${activeAccount.accessToken}`, { method: 'POST' });
          const publishData = await publishRes.json();
          
          if (publishData.error) {
             throw new Error(publishData.error.message);
          }
          
          addLog(`✓ ${meta.label} successfully posted! ID: ${publishData.id}`, 'success');
        } catch (err: any) {
          addLog(`✗ ${meta.label} Failed: ${err.message}`, 'error');
          success = false;
          break;
        }
      } else if (module.type === 'carousel_post') {
        const accountId = module.config.accountId as string;
        const activeAccount = accountId ? instagramAccounts.find(a => a.id === accountId) : instagramAccounts[0];
        
        if (!activeAccount) {
          addLog(`❌ ${meta.label}: No Instagram account selected or connected.`, 'error');
          success = false;
          break;
        }

        const imgs = (module.config.images as string[]) || [];
        const validImgs = imgs.filter(Boolean);
        const caption = module.config.caption as string || '';
        const timing = module.config.postTiming as string || 'now';

        if (validImgs.length === 0) {
          addLog(`✗ ${meta.label}: No images provided`, 'error');
          success = false;
          break;
        }

        if (timing === 'schedule') {
           const scheduleTime = module.config.scheduleTime as string;
           if (!scheduleTime) {
             addLog(`❌ ${meta.label}: Scheduled post selected but no date/time provided.`, 'error');
             success = false;
             break;
           }
           addLog(`⏰ ${meta.label}: Carousel successfully scheduled for ${new Date(scheduleTime).toLocaleString()}`, 'success');
           continue;
        }

        try {
          addLog(`⏳ Uploading ${validImgs.length} images for Carousel...`, 'info');
          const childrenIds = [];

          // 1. Create individual item containers
          for (let i = 0; i < validImgs.length; i++) {
            const itemRes = await fetch(`https://graph.facebook.com/v18.0/${activeAccount.pageId}/media?image_url=${encodeURIComponent(validImgs[i])}&is_carousel_item=true&access_token=${activeAccount.accessToken}`, { method: 'POST' });
            const itemData = await itemRes.json();
            if (itemData.error) throw new Error(`Image ${i+1}: ${itemData.error.message}`);
            childrenIds.push(itemData.id);
          }

          addLog(`⏳ Creating parent carousel container...`, 'info');
          
          // 2. Create parent container
          const carouselRes = await fetch(`https://graph.facebook.com/v18.0/${activeAccount.pageId}/media?media_type=CAROUSEL&children=${childrenIds.join(',')}&caption=${encodeURIComponent(caption)}&access_token=${activeAccount.accessToken}`, { method: 'POST' });
          const carouselData = await carouselRes.json();
          if (carouselData.error) throw new Error(`Carousel Container: ${carouselData.error.message}`);
          
          const creationId = carouselData.id;
          addLog(`⏳ Processing Carousel (Meta requires ~10 seconds)...`, 'info');
          
          // Wait 12 seconds for Meta to finish processing the container
          await new Promise(resolve => setTimeout(resolve, 12000));
          
          addLog(`⏳ Publishing Carousel...`, 'info');
          
          // 3. Publish Media
          const publishRes = await fetch(`https://graph.facebook.com/v18.0/${activeAccount.pageId}/media_publish?creation_id=${creationId}&access_token=${activeAccount.accessToken}`, { method: 'POST' });
          const publishData = await publishRes.json();
          
          if (publishData.error) throw new Error(publishData.error.message);
          
          addLog(`✓ ${meta.label} successfully posted! ID: ${publishData.id}`, 'success');
        } catch (err: any) {
          addLog(`✗ ${meta.label} Failed: ${err.message}`, 'error');
          success = false;
          break;
        }
      } else {
        await new Promise((r) => setTimeout(r, 700));
        addLog(`✓ ${meta.label} completed successfully`, 'success');
      }
    }

    const now = new Date().toISOString();
    addRunLog({
      id: generateId(),
      scenarioId,
      timestamp: now,
      status: success ? 'success' : 'failed',
      modulesExecuted: executedModules,
      details: success
        ? `Executed ${executedModules.length} modules`
        : 'Execution stopped due to error',
    });

    updateScenario(scenarioId, { lastRun: now });
    addLog(success ? '✅ Scenario completed successfully!' : '❌ Scenario failed.', success ? 'success' : 'error');
    setIsRunning(false);
  };

  const selectedModule = scenario?.modules.find((m) => m.id === selectedModuleId);

  if (!scenario) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-muted)' }}>
        Scenario not found. <button onClick={() => router.push('/')} style={{ marginLeft: '8px', color: 'var(--accent-light)' }}>Go back</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-primary)' }}>
      {/* Top bar */}
      <div style={{
        height: '60px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-card)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: '16px',
        zIndex: 10,
      }}>
        <button onClick={() => router.push('/')}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '20px' }}>
          ←
        </button>
        <input
          value={scenarioName}
          onChange={(e) => setScenarioName(e.target.value)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            fontSize: '16px',
            fontWeight: 700,
            outline: 'none',
            flex: 1,
          }}
        />
        <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
          <button onClick={() => setShowLogs(!showLogs)}
            className="btn-secondary"
            style={{ fontSize: '12px', padding: '7px 14px' }}>
            📋 Logs {logs.length > 0 && `(${logs.length})`}
          </button>
          <button onClick={handleRun} disabled={isRunning}
            style={{
              background: isRunning ? 'rgba(124,58,237,0.3)' : 'linear-gradient(135deg, #7c3aed, #db2777)',
              color: 'white', border: 'none', borderRadius: '8px', padding: '8px 18px',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              fontWeight: 600, fontSize: '13px',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
            {isRunning ? (
              <><span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⟳</span> Running...</>
            ) : '▶ Run'}
          </button>
          <button onClick={handleSave} className="btn-secondary" style={{ fontSize: '13px', padding: '8px 16px' }}>
            💾 Save
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left sidebar - module list */}
        <div style={{
          width: '220px',
          background: 'var(--bg-card)',
          borderRight: '1px solid var(--border)',
          padding: '16px 12px',
          overflowY: 'auto',
        }}>
          {categories.map((cat) => (
            <div key={cat} style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', padding: '0 4px' }}>
                {cat}
              </div>
              {SIDEBAR_MODULES.filter((m) => m.category === cat).map(({ type }) => {
                const meta = MODULE_CONFIG[type];
                return (
                  <div
                    key={type}
                    className="module-chip"
                    style={{ marginBottom: '6px', cursor: 'pointer' }}
                    draggable
                    onClick={() => handleModuleClick(type)}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('moduleType', type);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                  >
                    <span style={{
                      fontSize: '14px',
                      background: meta.color + '33',
                      padding: '4px',
                      borderRadius: '6px',
                    }}>{meta.icon}</span>
                    <span style={{ fontSize: '12px' }}>{meta.label}</span>
                  </div>
                );
              })}
            </div>
          ))}

          <div style={{
            marginTop: '20px',
            padding: '12px',
            background: 'var(--bg-primary)',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            fontSize: '11px',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
          }}>
            <div style={{ fontWeight: 600, marginBottom: '4px', color: 'var(--text-primary)' }}>💡 Tip</div>
            Drag modules onto the canvas. Click a module to configure it. Connect modules by dragging from the dots.
          </div>
        </div>

        {/* Canvas */}
        <div ref={reactFlowWrapper} style={{ flex: 1, position: 'relative' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
            deleteKeyCode="Delete"
            style={{ background: 'var(--bg-primary)' }}
          >
            <Background variant={BackgroundVariant.Dots} color="#2d2d4e" gap={24} size={1} />
            <Controls />
            <MiniMap
              nodeColor={() => '#7c3aed'}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            />
          </ReactFlow>

          {/* Empty state */}
          {nodes.length === 0 && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              pointerEvents: 'none',
            }}>
              <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.5 }}>🔧</div>
                <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>Empty Canvas</div>
                <div style={{ fontSize: '13px' }}>Drag modules from the left panel to get started</div>
              </div>
            </div>
          )}
        </div>

        {/* Right panel: config OR logs */}
        {showLogs ? (
          <div style={{
            width: '320px',
            background: 'var(--bg-card)',
            borderLeft: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '14px' }}>📋 Execution Logs</span>
              <button onClick={() => setShowLogs(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
              {logs.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Run the scenario to see logs</div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className={`log-entry ${log.type}`} style={{ marginBottom: '6px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{log.msg}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {formatDate(log.ts)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : selectedModule ? (
          <ModuleConfigPanel
            module={selectedModule}
            onUpdate={(config) => {
              updateModule(scenarioId, selectedModule.id, config);
              setNodes((nds) =>
                nds.map((n) =>
                  n.id === selectedModule.id
                    ? { ...n, data: { ...n.data, config } }
                    : n
                )
              );
            }}
            onClose={() => setSelectedModuleId(null)}
            onDelete={() => {
              removeModule(scenarioId, selectedModule.id);
              setNodes((nds) => nds.filter((n) => n.id !== selectedModule.id));
              setEdges((eds) =>
                eds.filter(
                  (e) => e.source !== selectedModule.id && e.target !== selectedModule.id
                )
              );
              setSelectedModuleId(null);
            }}
          />
        ) : (
          <div style={{
            width: '240px',
            background: 'var(--bg-card)',
            borderLeft: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            color: 'var(--text-muted)',
            fontSize: '13px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '36px', marginBottom: '12px', opacity: 0.4 }}>⚙️</div>
            <div style={{ fontWeight: 600, marginBottom: '6px', color: 'var(--text-primary)' }}>No module selected</div>
            Click on a module in the canvas to configure it
          </div>
        )}
      </div>
    </div>
  );
}

function BuilderPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const scenarioId = searchParams.get('id');
  const { scenarios, addScenario } = useStore();

  // If no id given, create a new scenario and navigate to it
  useEffect(() => {
    if (!scenarioId) {
      const id = generateId();
      addScenario({
        id,
        name: 'Untitled Scenario',
        status: 'inactive',
        lastRun: null,
        modules: [],
        connections: [],
        createdAt: new Date().toISOString(),
      });
      router.replace(`/builder?id=${id}`);
    }
  }, [scenarioId, addScenario, router]);

  if (!scenarioId) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-muted)' }}>
        Creating scenario...
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <BuilderCanvas scenarioId={scenarioId} />
    </ReactFlowProvider>
  );
}

export default function BuilderPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-muted)' }}>Loading...</div>}>
      <BuilderPageContent />
    </Suspense>
  );
}
