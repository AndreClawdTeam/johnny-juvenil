'use client';

import Link from 'next/link';
import { useState } from 'react';

const FIX_COMMANDS = `openclaw devices list
openclaw devices approve <requestId>`;

export default function SubagentFixPage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(FIX_COMMANDS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse-glow { 0%,100% { box-shadow:0 0 16px #f43f5e22; } 50% { box-shadow:0 0 32px #f43f5e44; } }
        .page-wrap { animation: fadeIn 0.4s ease both; }
        .accent-bar { background: linear-gradient(90deg, #f43f5e, #e11d48); height: 3px; border-radius: 2px; margin-bottom: 32px; }
        .section-card { background:#18181b; border:1px solid #27272a; border-radius:14px; padding:28px; margin-bottom:20px; }
        .section-card h2 { font-size:0.75rem; font-weight:600; letter-spacing:0.1em; color:#f43f5e; text-transform:uppercase; margin-bottom:12px; }
        .step-item { display:flex; gap:14px; align-items:flex-start; padding:10px 0; border-bottom:1px solid #27272a; }
        .step-item:last-child { border-bottom:none; }
        .step-num { width:28px; height:28px; border-radius:50%; background:#f43f5e22; border:1px solid #f43f5e44; color:#f43f5e; font-size:0.75rem; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .code-wrap { position:relative; background:#0d0d0f; border:1px solid #27272a; border-radius:12px; overflow:hidden; }
        .code-header { display:flex; justify-content:space-between; align-items:center; padding:10px 16px; background:#18181b; border-bottom:1px solid #27272a; }
        .code-lang { font-size:0.75rem; color:#71717a; font-family:monospace; }
        .copy-btn { font-size:0.75rem; padding:4px 12px; border-radius:6px; border:1px solid #3f3f46; background:#27272a; color:#a1a1aa; cursor:pointer; transition:all 0.2s; }
        .copy-btn:hover { background:#3f3f46; color:#f4f4f5; }
        .code-scroll { overflow-x:auto; padding:20px; }
        pre { margin:0; font-family:'JetBrains Mono',monospace; font-size:0.82rem; line-height:1.7; color:#d4d4d8; white-space:pre; }
        .back-link { display:inline-flex; align-items:center; gap:6px; color:#71717a; font-size:0.875rem; text-decoration:none; transition:color 0.2s; margin-bottom:32px; }
        .back-link:hover { color:#e4e4e7; }
        .badge { display:inline-block; font-size:0.7rem; padding:2px 8px; border-radius:999px; background:#f43f5e22; color:#f43f5e; border:1px solid #f43f5e44; font-weight:600; margin-left:8px; vertical-align:middle; }
        code { color:#f43f5e; background:#f43f5e15; padding:1px 6px; border-radius:4px; }
        .highlight { color:#f4f4f5; }
        .lesson-box { background:#f43f5e0d; border:1px solid #f43f5e33; border-radius:10px; padding:16px 20px; margin-top:12px; }
        .lesson-box p { color:#fda4af; font-size:0.875rem; line-height:1.7; margin:0; }
        .error-box { background:#27272a; border-left:3px solid #f43f5e; border-radius:0 8px 8px 0; padding:12px 16px; margin-top:12px; font-family:monospace; font-size:0.8rem; color:#fca5a5; }
      `}</style>

      <main className="page-wrap" style={{ minHeight:'100vh', background:'#09090b', color:'#fafafa', padding:'64px 24px' }}>
        <div style={{ maxWidth:800, margin:'0 auto' }}>
          <Link href="/capacidades" className="back-link">← Capacidades</Link>

          <div style={{ marginBottom:32 }}>
            <span style={{ fontSize:'2.5rem' }}>🔧</span>
            <h1 style={{ fontSize:'2rem', fontWeight:700, color:'#f4f4f5', marginTop:8, letterSpacing:'-0.02em' }}>
              Sub-agent Fix <span className="badge">troubleshoot</span>
            </h1>
          </div>

          <div className="accent-bar" />

          <div className="section-card">
            <h2>Objetivo</h2>
            <p style={{ color:'#a1a1aa', lineHeight:1.7 }}>
              Documentar o troubleshoot de um bug crítico onde <code>sessions_spawn</code> falhava
              com o erro <strong className="highlight">&quot;pairing required&quot;</strong> — impedindo o
              lançamento de qualquer sub-agent mesmo com a plataforma totalmente configurada.
            </p>
          </div>

          <div className="section-card">
            <h2>O Problema</h2>
            <p style={{ color:'#a1a1aa', lineHeight:1.7 }}>
              Ao tentar lançar sub-agents via <code>sessions_spawn</code>, o OpenClaw retornava
              o erro abaixo mesmo com tudo configurado corretamente:
            </p>
            <div className="error-box">
              Error: pairing required — device not approved
            </div>
            <p style={{ color:'#a1a1aa', lineHeight:1.7, marginTop:16 }}>
              Nenhuma configuração de API key, modelo ou permissão resolvia. O erro persistia
              independente das tentativas de reconfigurações.
            </p>
          </div>

          <div className="section-card">
            <h2>Causa Raiz</h2>
            <p style={{ color:'#a1a1aa', lineHeight:1.7 }}>
              Havia um <strong className="highlight">device approval pendente</strong> no OpenClaw
              que precisava ser aprovado manualmente antes de qualquer operação de spawn funcionar.
              O OpenClaw bloqueia sessões de sub-agents até que todos os devices pendentes sejam
              explicitamente aprovados — independente de qualquer outra configuração.
            </p>
          </div>

          <div className="section-card">
            <h2>Solução</h2>
            <p style={{ color:'#a1a1aa', lineHeight:1.7, marginBottom:16 }}>
              Dois comandos, na ordem:
            </p>
            {[
              { n:1, cmd: 'openclaw devices list', desc: 'Lista todos os devices e mostra os pendentes com seu requestId' },
              { n:2, cmd: 'openclaw devices approve <requestId>', desc: 'Aprova o device pendente usando o requestId da listagem' },
            ].map(s => (
              <div key={s.n} className="step-item">
                <span className="step-num">{s.n}</span>
                <div>
                  <code style={{ display:'block', marginBottom:4 }}>{s.cmd}</code>
                  <span style={{ color:'#71717a', fontSize:'0.85rem' }}>{s.desc}</span>
                </div>
              </div>
            ))}

            <div style={{ marginTop:20 }}>
              <div className="code-wrap">
                <div className="code-header">
                  <span className="code-lang">bash · fix commands</span>
                  <button className="copy-btn" onClick={handleCopy}>
                    {copied ? '✓ Copiado!' : 'Copiar'}
                  </button>
                </div>
                <div className="code-scroll">
                  <pre>{FIX_COMMANDS}</pre>
                </div>
              </div>
            </div>
          </div>

          <div className="section-card">
            <h2>Lição Aprendida</h2>
            <div className="lesson-box">
              <p>
                💡 Se <code style={{ color:'#fda4af', background:'#f43f5e15' }}>sessions_spawn</code> falhar
                com <strong>&quot;pairing required&quot;</strong>, não é um bug de configuração, token ou permissão —
                é um <strong>device pendente</strong>. Execute <code style={{ color:'#fda4af', background:'#f43f5e15' }}>openclaw devices list</code> e
                aprove o device pendente imediatamente.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
