'use client';

import { useState, useRef, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { truncateAddress } from '@/lib/utils';

export default function WalletConnectBtn() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors, error } = useConnect();
  const { disconnect } = useDisconnect();
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const handleConnect = (connector: any) => {
    connect({ connector });
    setDropdownOpen(false);
  };

  if (isConnecting) {
    return (
      <button className="btn btn-secondary" disabled style={{ opacity: 0.8, minWidth: '150px' }}>
        <span className="pulsing-dot pulsing-dot--checkpointing" style={{ marginRight: '8px', display: 'inline-block' }} />
        Connecting...
      </button>
    );
  }

  if (isConnected && address) {
    return (
      <div className="dropdown" ref={dropdownRef} style={{ position: 'relative' }}>
        <button
          className="btn btn-secondary"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--glass-bg)',
            borderColor: 'var(--accent-primary)',
            color: 'var(--text-primary)',
            boxShadow: 'var(--shadow-glow)',
          }}
        >
          <span className="pulsing-dot pulsing-dot--active" style={{ display: 'inline-block' }} />
          {truncateAddress(address)}
          <span style={{ fontSize: '10px', transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'none' }}>▼</span>
        </button>

        {dropdownOpen && (
          <div
            className="glass-card-static"
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '8px',
              minWidth: '200px',
              zIndex: 1000,
              padding: '12px',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Connected Wallet
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
              {address}
            </div>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => {
                disconnect();
                setDropdownOpen(false);
              }}
              style={{ width: '100%', marginTop: '8px' }}
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="dropdown" ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        className="btn btn-primary"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        🔌 Connect Wallet
      </button>

      {dropdownOpen && (
        <div
          className="glass-card-static animate-scale-in"
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            minWidth: '220px',
            zIndex: 1000,
            padding: '16px',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
            Choose Wallet
          </div>
          {connectors.map((connector) => (
            <button
              key={connector.id}
              onClick={() => handleConnect(connector)}
              className="btn btn-secondary btn-sm"
              style={{
                width: '100%',
                justifyContent: 'flex-start',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
              }}
            >
              <span>{connector.name === 'Injected' ? '🦊' : '🛡️'}</span>
              {connector.name}
            </button>
          ))}
          {error && (
            <div style={{ color: 'var(--accent-danger)', fontSize: '11px', marginTop: '4px' }}>
              {error.message}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
