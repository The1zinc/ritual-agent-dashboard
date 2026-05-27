'use client';

import { useState, useEffect } from 'react';
import { useAccount, useDeployContract, useConfig } from 'wagmi';
import { waitForTransactionReceipt } from '@wagmi/core';
import WalletConnectBtn from '@/components/layout/WalletConnectBtn';
import Link from 'next/link';

// Import compiled Solidity contract artifact
import agentDashboardArtifact from '@/lib/web3/AgentDashboard.json';

export default function DeployContractPage() {
  const { isConnected, address } = useAccount();
  const { deployContractAsync } = useDeployContract();
  const config = useConfig();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const [isDeploying, setIsDeploying] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [deployedAddress, setDeployedAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!mounted) {
    return (
      <div className="wizard-container" style={{ maxWidth: '650px', margin: '40px auto', textAlign: 'center', padding: '40px' }}>
        <div className="pulsing-dot pulsing-dot--checkpointing" style={{ margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading network state...</p>
      </div>
    );
  }

  const handleDeploy = async () => {
    setIsDeploying(true);
    setError(null);
    setTxHash(null);
    setDeployedAddress(null);

    try {
      const bytecode = agentDashboardArtifact.bytecode;
      const formattedBytecode = bytecode.startsWith('0x')
        ? (bytecode as `0x${string}`)
        : (`0x${bytecode}` as `0x${string}`);

      // 1. Trigger deployment transaction on browser wallet
      const hash = await deployContractAsync({
        abi: agentDashboardArtifact.abi,
        bytecode: formattedBytecode,
        args: [], // constructor takes no arguments
      });
      setTxHash(hash);

      // 2. Wait for confirmation receipt
      const receipt = await waitForTransactionReceipt(config, { hash });
      if (receipt.contractAddress) {
        setDeployedAddress(receipt.contractAddress);
      } else {
        throw new Error('Contract address not found in transaction receipt');
      }
    } catch (err: unknown) {
      console.error('Failed to deploy contract:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="wizard-container animate-fade-in" style={{ maxWidth: '650px', margin: '40px auto' }}>
      <div className="page-header" style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 className="page-title">Deploy Agent Registry</h1>
        <p className="page-subtitle">
          Deploy the AgentDashboard smart contract to the Ritual Chain Testnet
        </p>
      </div>

      <div className="glass-card-static" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ padding: '12px', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
          <h3 style={{ fontSize: '14px', color: 'var(--accent-primary)', marginBottom: '6px' }}>Deployment Prerequisite</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            This contract acts as the registry and interface for the 0x0820 precompile. It will track all spawned agents, checkpoints, and lifecycles.
          </p>
        </div>

        {!isConnected ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '14px' }}>
              Please connect your EVM wallet configured for the Ritual Testnet (Chain ID 1979) to deploy the contract.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <WalletConnectBtn />
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Connected Wallet</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{address}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Target Network</span>
              <span style={{ color: 'var(--accent-secondary)', fontWeight: 600 }}>Ritual Chain Testnet</span>
            </div>

            {!deployedAddress ? (
              <button
                className="btn btn-primary btn-lg"
                onClick={handleDeploy}
                disabled={isDeploying}
                style={{ width: '100%', marginTop: '10px' }}
              >
                {isDeploying ? '⏳ Deploying Smart Contract...' : '🚀 Deploy AgentDashboard Contract'}
              </button>
            ) : (
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: 'rgba(6, 214, 160, 0.08)', border: '1px solid var(--accent-secondary)', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', color: 'var(--accent-secondary)', fontWeight: 700, marginBottom: '8px' }}>
                    🎉 Contract Deployed Successfully!
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Contract Address
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', wordBreak: 'break-all', fontSize: '14px', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '4px', marginTop: '6px' }}>
                    {deployedAddress}
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '8px', padding: '16px', border: '1px solid var(--glass-border)', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>Next Step: Set Vercel Env</strong>
                  Copy the contract address above and add it to your environment variables on Vercel as:
                  <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)', marginTop: '6px', fontSize: '12px' }}>
                    NEXT_PUBLIC_DASHBOARD_CONTRACT_ADDRESS=&quot;{deployedAddress}&quot;
                  </div>
                </div>
              </div>
            )}

            {txHash && !deployedAddress && (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
                Transaction broadcasted! Hash:{' '}
                <span style={{ fontFamily: 'var(--font-mono)' }}>{txHash.slice(0, 10)}...{txHash.slice(-10)}</span>
              </div>
            )}

            {error && (
              <div style={{ background: 'rgba(239, 68, 68, 0.08)', color: 'var(--accent-danger)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '12px', fontSize: '13px', marginTop: '10px' }}>
                <strong>Deployment Error:</strong> {error}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
        <Link href="/" className="btn btn-ghost">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
