'use client';

import { useState, useRef, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useSwitchChain, Connector } from 'wagmi';
import { truncateAddress } from '@/lib/utils';
import { ritualTestnet } from '@/lib/web3/chains';

export default function WalletConnectBtn() {
  const { address, isConnected, isConnecting, chainId } = useAccount();
  const { connect, connectors, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleConnect = (connector: Connector) => {
    connect({ connector });
    setDropdownOpen(false);
  };

  const handleSwitchNetwork = () => {
    switchChain({ chainId: ritualTestnet.id });
  };

  if (!mounted) {
    return (
      <button
        className="btn btn-primary"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 18px',
          borderRadius: 'var(--radius-md)',
          fontSize: '14px',
          fontWeight: 600,
          background: 'var(--gradient-primary)',
          color: 'white',
          boxShadow: 'var(--shadow-glow)',
          border: 'none',
        }}
      >
        🔌 Connect Wallet
      </button>
    );
  }

  if (isConnecting) {
    return (
      <button 
        className="btn" 
        disabled 
        style={{ 
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          color: 'var(--text-muted)',
          padding: '8px 16px',
          borderRadius: 'var(--radius-md)',
          minWidth: '150px'
        }}
      >
        <span className="pulsing-dot pulsing-dot--checkpointing" style={{ marginRight: '8px', display: 'inline-block' }} />
        Connecting...
      </button>
    );
  }

  // Network mismatch (connected but to a wrong chain like Arbitrum Sepolia)
  if (isConnected && chainId !== ritualTestnet.id) {
    return (
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          className="btn"
          onClick={handleSwitchNetwork}
          style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #a855f7 100%)',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.35)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.25)';
          }}
        >
          ⚠️ Switch to Ritual
        </button>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => disconnect()}
          style={{ 
            fontSize: '12px',
            padding: '6px 12px',
            background: 'transparent',
            borderColor: 'var(--glass-border)',
            color: 'var(--text-secondary)'
          }}
        >
          Disconnect
        </button>
      </div>
    );
  }

  // Connected state
  if (isConnected && address) {
    return (
      <div className="dropdown" ref={dropdownRef} style={{ position: 'relative' }}>
        <button
          className="btn"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            color: 'var(--text-primary)',
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: 'var(--shadow-sm)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent-primary)';
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          }}
          onMouseLeave={(e) => {
            if (!dropdownOpen) {
              e.currentTarget.style.borderColor = 'var(--glass-border)';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }
          }}
        >
          <span className="pulsing-dot pulsing-dot--active" style={{ display: 'inline-block', width: '8px', height: '8px' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 500 }}>
            {truncateAddress(address)}
          </span>
          <span style={{ 
            fontSize: '9px', 
            color: 'var(--text-muted)',
            marginLeft: '4px',
            transition: 'transform 0.2s ease', 
            transform: dropdownOpen ? 'rotate(180deg)' : 'none' 
          }}>
            ▼
          </span>
        </button>

        {dropdownOpen && (
          <div
            className="glass-card-static animate-scale-in"
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              minWidth: '220px',
              zIndex: 1000,
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--glass-border)',
              background: 'var(--glass-bg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>
                Active Wallet
              </span>
              <span style={{ 
                fontFamily: 'var(--font-mono)', 
                fontSize: '12px', 
                color: 'var(--text-secondary)', 
                wordBreak: 'break-all',
                background: 'rgba(0,0,0,0.05)',
                padding: '6px 8px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(0,0,0,0.03)'
              }}>
                {address}
              </span>
            </div>
            
            <button
              className="btn btn-danger btn-sm"
              onClick={() => {
                disconnect();
                setDropdownOpen(false);
              }}
              style={{ 
                width: '100%', 
                display: 'flex', 
                justifyContent: 'center',
                padding: '8px',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              🚪 Disconnect Wallet
            </button>
          </div>
        )}
      </div>
    );
  }

  // Disconnected state
  return (
    <div className="dropdown" ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        className="btn btn-primary"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 18px',
          borderRadius: 'var(--radius-md)',
          fontSize: '14px',
          fontWeight: 600,
          background: 'var(--gradient-primary)',
          color: 'white',
          boxShadow: 'var(--shadow-glow)',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.45)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
        }}
      >
        🔌 Connect Wallet
      </button>

      {dropdownOpen && (
        <div
          className="glass-card-static animate-scale-in"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            minWidth: '240px',
            zIndex: 1000,
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--glass-border)',
            background: 'var(--glass-bg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600, marginBottom: '4px' }}>
            Select Provider
          </div>
          {connectors.map((connector) => (
            <button
              key={connector.id}
              onClick={() => handleConnect(connector)}
              className="btn"
              style={{
                width: '100%',
                justifyContent: 'flex-start',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                background: 'rgba(139, 92, 246, 0.05)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                fontWeight: 500
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.12)';
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.05)';
                e.currentTarget.style.borderColor = 'var(--glass-border)';
              }}
            >
              <span style={{ fontSize: '16px' }}>
                {connector.name.toLowerCase().includes('injected') || connector.name.toLowerCase().includes('metamask') ? '🦊' : '🛡️'}
              </span>
              <span>{connector.name === 'Injected' ? 'Browser Wallet' : connector.name}</span>
            </button>
          ))}
          {error && (
            <div style={{ color: 'var(--accent-danger)', fontSize: '11px', marginTop: '6px', textAlign: 'center' }}>
              {error.message}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
