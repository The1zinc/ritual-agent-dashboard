'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAgents } from '@/lib/agents/store';
import {
  CreateAgentFormData,
  DEFAULT_SOUL,
  DEFAULT_MEMORY,
  DEFAULT_STORAGE,
} from '@/lib/agents/types';

const STEPS = ['Soul', 'Memory', 'Storage', 'Deploy'];

export default function CreateAgentPage() {
  const router = useRouter();
  const { createAgent } = useAgents();
  const [step, setStep] = useState(0);
  const [isDeploying, setIsDeploying] = useState(false);

  const [formData, setFormData] = useState<CreateAgentFormData>({
    soul: { ...DEFAULT_SOUL },
    memory: { ...DEFAULT_MEMORY },
    storage: { ...DEFAULT_STORAGE },
  });

  const updateSoul = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      soul: { ...prev.soul, [field]: value },
    }));
  };

  const updateMemory = (field: string, value: string | boolean | number) => {
    setFormData((prev) => ({
      ...prev,
      memory: { ...prev.memory, [field]: value },
    }));
  };

  const updateStorage = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      storage: { ...prev.storage, [field]: value },
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 0:
        return formData.soul.name.trim() && formData.soul.purpose.trim();
      case 1:
        return true;
      case 2:
        return true;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleDeploy = async () => {
    setIsDeploying(true);
    // Simulate a brief deployment delay
    await new Promise((r) => setTimeout(r, 1500));
    const agent = createAgent(formData);
    router.push(`/agents/${agent.id}`);
  };

  return (
    <div className="wizard-container animate-fade-in">
      <div className="page-header" style={{ textAlign: 'center' }}>
        <h1 className="page-title">Deploy New Agent</h1>
        <p className="page-subtitle">
          Configure your autonomous AI agent for deployment on Ritual Chain
        </p>
      </div>

      {/* Step Indicator */}
      <div className="step-indicator">
        {STEPS.map((label, i) => (
          <div key={label} className="step-indicator-item">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                className={`step-circle ${
                  i === step ? 'active' : i < step ? 'completed' : ''
                }`}
              >
                {i < step ? '✓' : i + 1}
              </div>
              <div
                className={`step-label ${
                  i === step ? 'active' : i < step ? 'completed' : ''
                }`}
              >
                {label}
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`step-line ${i < step ? 'completed' : ''}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="glass-card-static animate-scale-in" key={step}>
        {/* Step 0: Soul */}
        {step === 0 && (
          <div>
            <div className="detail-section-title">
              <span>🧠</span> Define Agent Soul
            </div>
            <p
              style={{
                fontSize: '13px',
                color: 'var(--text-secondary)',
                marginBottom: 'var(--space-lg)',
              }}
            >
              The soul defines your agent&apos;s identity, purpose, and behavioral boundaries.
            </p>

            <div className="form-group">
              <label className="form-label" htmlFor="agent-name">Agent Name *</label>
              <input
                id="agent-name"
                className="form-input"
                type="text"
                placeholder="e.g., DeFi Sentinel, Governance Oracle..."
                value={formData.soul.name}
                onChange={(e) => updateSoul('name', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="agent-purpose">Purpose *</label>
              <textarea
                id="agent-purpose"
                className="form-textarea"
                placeholder="What should this agent do? Describe its primary mission and goals..."
                value={formData.soul.purpose}
                onChange={(e) => updateSoul('purpose', e.target.value)}
              />
              <div className="form-hint">
                This becomes the agent&apos;s core directive on-chain.
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="agent-constraints">Behavioral Constraints</label>
              <textarea
                id="agent-constraints"
                className="form-textarea"
                placeholder="Define limits and rules for the agent. e.g., Never trade above 5% portfolio value..."
                value={formData.soul.constraints}
                onChange={(e) => updateSoul('constraints', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="agent-model">AI Model</label>
              <select
                id="agent-model"
                className="form-select"
                value={formData.soul.model}
                onChange={(e) => updateSoul('model', e.target.value)}
              >
                <option value="ritual-llm-v1">Ritual LLM v1 (Default)</option>
                <option value="ritual-llm-v2">Ritual LLM v2 (Advanced)</option>
                <option value="ritual-onnx-v1">Ritual ONNX (Classical ML)</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 1: Memory */}
        {step === 1 && (
          <div>
            <div className="detail-section-title">
              <span>💾</span> Configure Memory
            </div>
            <p
              style={{
                fontSize: '13px',
                color: 'var(--text-secondary)',
                marginBottom: 'var(--space-lg)',
              }}
            >
              Memory determines how your agent accumulates and retains knowledge across interactions.
            </p>

            <div className="form-group">
              <label className="form-label" htmlFor="memory-type">Memory Type</label>
              <select
                id="memory-type"
                className="form-select"
                value={formData.memory.type}
                onChange={(e) =>
                  updateMemory('type', e.target.value as 'ephemeral' | 'persistent')
                }
              >
                <option value="persistent">Persistent (Survives restarts)</option>
                <option value="ephemeral">Ephemeral (Session only)</option>
              </select>
              <div className="form-hint">
                Persistent memory is stored on-chain and can be restored via CID.
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="initial-knowledge">Initial Knowledge</label>
              <textarea
                id="initial-knowledge"
                className="form-textarea"
                placeholder="Seed the agent with domain knowledge, context, or instructions..."
                value={formData.memory.initialKnowledge}
                onChange={(e) => updateMemory('initialKnowledge', e.target.value)}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="max-tokens">Max Tokens</label>
                <select
                  id="max-tokens"
                  className="form-select"
                  value={formData.memory.maxTokens}
                  onChange={(e) => updateMemory('maxTokens', Number(e.target.value))}
                >
                  <option value={2048}>2,048</option>
                  <option value={4096}>4,096</option>
                  <option value={8192}>8,192</option>
                  <option value={16384}>16,384</option>
                  <option value={32768}>32,768</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Conversation History</label>
                <div
                  className="form-toggle"
                  onClick={() =>
                    updateMemory(
                      'conversationHistory',
                      !formData.memory.conversationHistory
                    )
                  }
                >
                  <div
                    className={`toggle-switch ${
                      formData.memory.conversationHistory ? 'active' : ''
                    }`}
                  />
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    {formData.memory.conversationHistory ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Storage */}
        {step === 2 && (
          <div>
            <div className="detail-section-title">
              <span>📦</span> Storage & Persistence
            </div>
            <p
              style={{
                fontSize: '13px',
                color: 'var(--text-secondary)',
                marginBottom: 'var(--space-lg)',
              }}
            >
              Configure where agent state is persisted for durability and revival.
            </p>

            <div className="form-group">
              <label className="form-label" htmlFor="storage-provider">Storage Provider</label>
              <select
                id="storage-provider"
                className="form-select"
                value={formData.storage.provider}
                onChange={(e) =>
                  updateStorage('provider', e.target.value as 'ipfs' | 'gcs' | 'huggingface')
                }
              >
                <option value="ipfs">IPFS (Decentralized)</option>
                <option value="gcs">Google Cloud Storage</option>
                <option value="huggingface">HuggingFace Spaces</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="checkpoint-interval">
                Auto-Checkpoint Interval (seconds)
              </label>
              <select
                id="checkpoint-interval"
                className="form-select"
                value={formData.storage.autoCheckpointInterval}
                onChange={(e) =>
                  updateStorage('autoCheckpointInterval', Number(e.target.value))
                }
              >
                <option value={60}>Every 1 minute</option>
                <option value={120}>Every 2 minutes</option>
                <option value={300}>Every 5 minutes</option>
                <option value={600}>Every 10 minutes</option>
                <option value={900}>Every 15 minutes</option>
              </select>
              <div className="form-hint">
                How often the agent automatically saves its state.
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="restore-cid">Restore from CID (Optional)</label>
              <input
                id="restore-cid"
                className="form-input"
                type="text"
                placeholder="QmXoypiz... (leave empty for a fresh agent)"
                value={formData.storage.restoreFromCid}
                onChange={(e) => updateStorage('restoreFromCid', e.target.value)}
              />
              <div className="form-hint">
                Enter a previous checkpoint CID to revive an agent from its saved state.
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review & Deploy */}
        {step === 3 && (
          <div>
            <div className="detail-section-title">
              <span>🚀</span> Review & Deploy
            </div>
            <p
              style={{
                fontSize: '13px',
                color: 'var(--text-secondary)',
                marginBottom: 'var(--space-lg)',
              }}
            >
              Review your agent configuration before deploying to Ritual Chain.
            </p>

            <div className="review-section">
              <div className="review-section-title">🧠 Soul</div>
              <div className="review-row">
                <span className="review-label">Name</span>
                <span className="review-value">{formData.soul.name || '—'}</span>
              </div>
              <div className="review-row">
                <span className="review-label">Purpose</span>
                <span className="review-value">{formData.soul.purpose || '—'}</span>
              </div>
              <div className="review-row">
                <span className="review-label">Constraints</span>
                <span className="review-value">{formData.soul.constraints || 'None'}</span>
              </div>
              <div className="review-row">
                <span className="review-label">Model</span>
                <span className="review-value">{formData.soul.model}</span>
              </div>
            </div>

            <div className="review-section">
              <div className="review-section-title">💾 Memory</div>
              <div className="review-row">
                <span className="review-label">Type</span>
                <span className="review-value" style={{ textTransform: 'capitalize' }}>
                  {formData.memory.type}
                </span>
              </div>
              <div className="review-row">
                <span className="review-label">Max Tokens</span>
                <span className="review-value">
                  {formData.memory.maxTokens.toLocaleString()}
                </span>
              </div>
              <div className="review-row">
                <span className="review-label">Conversation History</span>
                <span className="review-value">
                  {formData.memory.conversationHistory ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>

            <div className="review-section">
              <div className="review-section-title">📦 Storage</div>
              <div className="review-row">
                <span className="review-label">Provider</span>
                <span className="review-value" style={{ textTransform: 'uppercase' }}>
                  {formData.storage.provider}
                </span>
              </div>
              <div className="review-row">
                <span className="review-label">Checkpoint Interval</span>
                <span className="review-value">
                  {formData.storage.autoCheckpointInterval}s
                </span>
              </div>
              <div className="review-row">
                <span className="review-label">Restore CID</span>
                <span
                  className="review-value"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                  }}
                >
                  {formData.storage.restoreFromCid || 'None (fresh agent)'}
                </span>
              </div>
            </div>

            <div className="review-section" style={{ background: 'rgba(139, 92, 246, 0.06)' }}>
              <div className="review-section-title">⛽ Estimated Costs</div>
              <div className="review-row">
                <span className="review-label">Deployment Gas</span>
                <span className="review-value">~0.002 RITUAL</span>
              </div>
              <div className="review-row">
                <span className="review-label">Precompile Target</span>
                <span className="review-value" style={{ fontFamily: 'var(--font-mono)' }}>
                  0x0820
                </span>
              </div>
              <div className="review-row">
                <span className="review-label">Network</span>
                <span className="review-value">Ritual Chain Testnet (1979)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 'var(--space-lg)',
        }}
      >
        <button
          className="btn btn-ghost"
          onClick={() => (step > 0 ? setStep(step - 1) : router.push('/'))}
        >
          {step > 0 ? '← Back' : '← Cancel'}
        </button>

        {step < 3 ? (
          <button
            className="btn btn-primary"
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
            style={{ opacity: canProceed() ? 1 : 0.5 }}
          >
            Next →
          </button>
        ) : (
          <button
            className="btn btn-primary btn-lg"
            onClick={handleDeploy}
            disabled={isDeploying}
            style={{
              minWidth: 200,
              opacity: isDeploying ? 0.7 : 1,
            }}
          >
            {isDeploying ? (
              <>
                <span style={{ animation: 'pulse-purple 1s ease-in-out infinite' }}>◉</span>
                Deploying to 0x0820...
              </>
            ) : (
              <>🚀 Deploy Agent</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
