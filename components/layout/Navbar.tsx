'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Dashboard', icon: '◉' },
    { href: '/agents', label: 'Agents', icon: '⬡' },
    { href: '/create', label: 'Create', icon: '✦' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="navbar-logo">R</div>
        <div>
          <div className="navbar-title">Ritual Agents</div>
          <div className="navbar-subtitle">Autonomous Agent Dashboard</div>
        </div>
      </div>

      <ul className="navbar-nav">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={`navbar-link ${pathname === link.href ? 'active' : ''}`}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="navbar-actions">
        <div className="navbar-network">
          <span className="pulsing-dot pulsing-dot--active" />
          Ritual Testnet
        </div>
        <ConnectButton
          showBalance={false}
          chainStatus="icon"
          accountStatus="avatar"
        />
      </div>
    </nav>
  );
}
