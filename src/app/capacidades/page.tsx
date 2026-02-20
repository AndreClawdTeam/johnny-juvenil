'use client';

import Link from 'next/link';

const capabilities = [
  {
    icon: '📧',
    title: 'Email Monitor',
    description: 'Monitor IMAP contínuo para ProtonMail via Hydroxide bridge, armazenando emails em SQLite.',
    href: '/capacidades/email-monitor',
    accent: '#10b981',
  },
  {
    icon: '📬',
    title: 'Email Digest',
    description: 'Agrupa emails não enviados do SQLite e manda resumo batched no Telegram. Idempotente.',
    href: '/capacidades/email-digest',
    accent: '#6366f1',
  },
  {
    icon: '🎙️',
    title: 'Whisper CLI',
    description: 'Transcrição de áudio local com Whisper open-source — sem API, sem custo, sem limites.',
    href: '/capacidades/whisper-cli',
    accent: '#f59e0b',
  },
  {
    icon: '🤖',
    title: 'Whisper Server',
    description: 'Servidor HTTP que imita a API do Deepgram, permitindo transcrição de voz via Whisper local.',
    href: '/capacidades/whisper-server',
    accent: '#3b82f6',
  },
  {
    icon: '🔧',
    title: 'Sub-agent Fix',
    description: 'Troubleshoot do bug "pairing required" que bloqueava o lançamento de sub-agents.',
    href: '/capacidades/subagent-fix',
    accent: '#ec4899',
  },
];

export default function CapacidadesPage() {
  return (
    <>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cap-card {
          animation: fadeSlideUp 0.5s ease both;
          position: relative;
          background: #18181b;
          border: 1px solid #27272a;
          border-radius: 16px;
          padding: 28px 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          text-decoration: none;
          transition: border-color 0.25s, box-shadow 0.25s, transform 0.25s;
          cursor: pointer;
          overflow: hidden;
        }
        .cap-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 16px;
          opacity: 0;
          transition: opacity 0.3s;
          pointer-events: none;
        }
        .cap-card:hover {
          transform: translateY(-3px);
          border-color: var(--accent, #52525b);
        }
        .cap-card:hover::before {
          opacity: 1;
          box-shadow: 0 0 30px 0 var(--accent-glow, rgba(82,82,91,0.15));
        }
        .cap-card:hover {
          box-shadow: 0 0 24px 0 var(--accent-glow, rgba(82,82,91,0.2));
        }
        .cap-arrow {
          margin-left: auto;
          color: #52525b;
          font-size: 1.2rem;
          transition: transform 0.2s, color 0.2s;
        }
        .cap-card:hover .cap-arrow {
          transform: translateX(4px);
          color: #a1a1aa;
        }
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #71717a;
          font-size: 0.875rem;
          text-decoration: none;
          transition: color 0.2s;
          margin-bottom: 32px;
        }
        .back-link:hover { color: #e4e4e7; }
        .grid {
          display: grid;
          grid-template-columns: repeat(1, 1fr);
          gap: 16px;
        }
        @media (min-width: 640px) {
          .grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 1024px) {
          .grid { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>

      <main style={{ minHeight: '100vh', background: '#09090b', color: '#fafafa', padding: '64px 24px' }}>
        <div style={{ maxWidth: 1024, margin: '0 auto' }}>
          <Link href="/" className="back-link">
            ← Voltar ao início
          </Link>

          <div style={{ marginBottom: 48 }}>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 700, color: '#f4f4f5', marginBottom: 12, letterSpacing: '-0.02em' }}>
              Capacidades
            </h1>
            <p style={{ color: '#71717a', fontSize: '1rem', maxWidth: 480, lineHeight: 1.6 }}>
              Scripts, servidores e automações que compõem o stack do Johnny Juvenil.
              Cada página detalha o problema, a solução e o código para download.
            </p>
          </div>

          <div className="grid">
            {capabilities.map((cap, i) => (
              <Link
                key={cap.href}
                href={cap.href}
                className="cap-card"
                style={{
                  animationDelay: `${i * 80}ms`,
                  // @ts-expect-error CSS custom property
                  '--accent': cap.accent,
                  '--accent-glow': cap.accent + '33',
                }}
              >
                <span style={{ fontSize: '2rem' }}>{cap.icon}</span>
                <div>
                  <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#f4f4f5', marginBottom: 6 }}>
                    {cap.title}
                  </h2>
                  <p style={{ fontSize: '0.875rem', color: '#71717a', lineHeight: 1.6 }}>
                    {cap.description}
                  </p>
                </div>
                <span className="cap-arrow">→</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
