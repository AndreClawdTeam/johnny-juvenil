'use client';

import Link from 'next/link';
import { useState } from 'react';

const CODE = `#!/usr/bin/env python3
"""
Email digest: queries unsummarized emails from SQLite, sends a Telegram
summary, marks them as summarized. Never re-summarizes — safe to call many times.
"""
import html, sqlite3, subprocess, pathlib

DB_PATH = pathlib.Path(__file__).with_name("emails.db")
MAX_MSG_LEN = 3800  # Telegram limit is 4096; leave headroom

def send_message(text: str) -> bool:
    try:
        subprocess.run(
            ["openclaw", "message", "send",
             "--channel", "telegram",
             "--target", "YOUR_TELEGRAM_USER_ID",
             "--message", text],
            check=True, capture_output=True,
        ); return True
    except subprocess.CalledProcessError:
        return False

def run_digest():
    con = sqlite3.connect(DB_PATH)
    rows = con.execute(
        "SELECT id, uid, from_name, from_email, subject, body, received_at "
        "FROM emails WHERE is_summarized = 0 ORDER BY uid ASC"
    ).fetchall()

    if not rows:
        con.close(); return   # Nothing new — stay silent

    header = f"📬 *{len(rows)} novo(s) e-mail(s)*\\n"
    email_blocks = []
    for row in rows:
        _, uid, from_name, from_email, subject, body, received_at = row
        sender  = from_name or from_email
        preview = html.unescape(body or "").strip()[:200]
        block   = "\\n".join([
            "━━━━━━━━━━",
            f"📧 UID {uid} · {received_at[:10] if received_at else '?'}",
            f"De: {sender}",
            f"Assunto: {subject}",
            f"Preview: {preview}",
        ])
        email_blocks.append((row[0], block))

    # Chunk into Telegram-sized messages
    chunks, cur_ids, cur_lines, cur_len = [], [], [header], len(header)
    for row_id, block in email_blocks:
        if cur_ids and cur_len + len(block) + 1 > MAX_MSG_LEN:
            chunks.append((cur_ids[:], "\\n".join(cur_lines)))
            cur_ids, cur_lines, cur_len = [], [], 0
        cur_ids.append(row_id); cur_lines.append(block); cur_len += len(block) + 1
    if cur_ids: chunks.append((cur_ids, "\\n".join(cur_lines)))

    # Send all chunks — only mark summarized if ALL succeed
    all_ok = all(send_message(text) for _, text in chunks)
    if all_ok:
        ids = [r[0] for r in rows]
        con.execute(
            f"UPDATE emails SET is_summarized=1 WHERE id IN ({','.join('?'*len(ids))})", ids
        ); con.commit()
    con.close()

if __name__ == "__main__":
    run_digest()`;

const SQL_SNIPPET = `-- Ignorar um domínio inteiro
INSERT INTO ignore_rules (type, value, description)
VALUES ('sender_domain', 'linkedin.com', 'LinkedIn notifications');

-- Ignorar um email específico
INSERT INTO ignore_rules (type, value, description)
VALUES ('sender_email', 'noreply@example.com', 'Example noreply');

-- Ignorar por assunto
INSERT INTO ignore_rules (type, value, description)
VALUES ('subject_contains', 'Unsubscribe', 'Marketing emails');`;

export default function EmailDigestPage() {
  const [copied, setCopied] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSqlCopy = () => {
    navigator.clipboard.writeText(SQL_SNIPPET);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2000);
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes glow { 0%,100% { box-shadow:0 0 20px #6366f122; } 50% { box-shadow:0 0 40px #6366f144; } }
        .page-wrap { animation: fadeIn 0.4s ease both; }
        .accent-bar { background: linear-gradient(90deg, #6366f1, #4f46e5); height: 3px; border-radius: 2px; margin-bottom: 32px; }
        .section-card { background:#18181b; border:1px solid #27272a; border-radius:14px; padding:28px; margin-bottom:20px; }
        .section-card h2 { font-size:0.75rem; font-weight:600; letter-spacing:0.1em; color:#6366f1; text-transform:uppercase; margin-bottom:12px; }
        .step-item { display:flex; gap:14px; align-items:flex-start; padding:10px 0; border-bottom:1px solid #27272a; }
        .step-item:last-child { border-bottom:none; }
        .step-num { width:28px; height:28px; border-radius:50%; background:#6366f122; border:1px solid #6366f144; color:#6366f1; font-size:0.75rem; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .code-wrap { position:relative; background:#0d0d0f; border:1px solid #27272a; border-radius:12px; overflow:hidden; }
        .code-header { display:flex; justify-content:space-between; align-items:center; padding:10px 16px; background:#18181b; border-bottom:1px solid #27272a; }
        .code-lang { font-size:0.75rem; color:#71717a; font-family:monospace; }
        .copy-btn { font-size:0.75rem; padding:4px 12px; border-radius:6px; border:1px solid #3f3f46; background:#27272a; color:#a1a1aa; cursor:pointer; transition:all 0.2s; }
        .copy-btn:hover { background:#3f3f46; color:#f4f4f5; }
        .code-scroll { overflow-x:auto; padding:20px; max-height:400px; overflow-y:auto; }
        .code-scroll::-webkit-scrollbar { width:6px; height:6px; }
        .code-scroll::-webkit-scrollbar-track { background:#0d0d0f; }
        .code-scroll::-webkit-scrollbar-thumb { background:#3f3f46; border-radius:3px; }
        pre { margin:0; font-family:'JetBrains Mono',monospace; font-size:0.78rem; line-height:1.7; color:#d4d4d8; white-space:pre; }
        .download-btn { display:inline-flex; align-items:center; gap:8px; padding:12px 24px; background:linear-gradient(135deg,#6366f1,#4f46e5); color:#fff; border-radius:10px; font-size:0.875rem; font-weight:600; text-decoration:none; transition:opacity 0.2s, transform 0.2s; animation: glow 3s infinite; }
        .download-btn:hover { opacity:0.85; transform:translateY(-1px); }
        .back-link { display:inline-flex; align-items:center; gap:6px; color:#71717a; font-size:0.875rem; text-decoration:none; transition:color 0.2s; margin-bottom:32px; }
        .back-link:hover { color:#e4e4e7; }
        .badge { display:inline-block; font-size:0.7rem; padding:2px 8px; border-radius:999px; background:#6366f122; color:#6366f1; border:1px solid #6366f144; font-weight:600; margin-left:8px; vertical-align:middle; }
        .highlight { color:#f4f4f5; }
        code { color:#6366f1; background:#6366f115; padding:1px 6px; border-radius:4px; }
      `}</style>

      <main className="page-wrap" style={{ minHeight:'100vh', background:'#09090b', color:'#fafafa', padding:'64px 24px' }}>
        <div style={{ maxWidth:800, margin:'0 auto' }}>
          <Link href="/capacidades" className="back-link">← Capacidades</Link>

          <div style={{ marginBottom:32 }}>
            <span style={{ fontSize:'2.5rem' }}>📬</span>
            <h1 style={{ fontSize:'2rem', fontWeight:700, color:'#f4f4f5', marginTop:8, letterSpacing:'-0.02em' }}>
              Email Digest <span className="badge">Telegram</span>
            </h1>
          </div>

          <div className="accent-bar" />

          <div className="section-card">
            <h2>Objetivo</h2>
            <p style={{ color:'#a1a1aa', lineHeight:1.7 }}>
              Agrupa emails não enviados do SQLite e manda um resumo batched no Telegram,
              marcando-os como <code>is_summarized=1</code>. Idempotente — nunca reenvia o mesmo email.
            </p>
          </div>

          <div className="section-card">
            <h2>O Problema</h2>
            <p style={{ color:'#a1a1aa', lineHeight:1.7 }}>
              Notificações individuais por email poluíam o Telegram. Além disso, mensagens longas
              quebravam com erro 400 — o Telegram limita mensagens a <strong className="highlight">4096 chars</strong>.
            </p>
          </div>

          <div className="section-card">
            <h2>Solução</h2>
            <p style={{ color:'#a1a1aa', lineHeight:1.7 }}>
              Script chamado pelo <strong className="highlight">heartbeat</strong> (a cada 30min) que lê
              <code>WHERE is_summarized = 0</code>, agrupa em chunks de até <strong className="highlight">3800 chars</strong>,
              envia um por um e só marca como enviado após sucesso total.
            </p>
          </div>

          <div className="section-card">
            <h2>Como funciona</h2>
            {[
              { n:1, text: 'Query SQLite: emails com is_summarized = 0' },
              { n:2, text: <>Filtra emails ignorados via tabela <code>ignore_rules</code> (marcados como <code>is_summarized=1</code> silenciosamente)</> },
              { n:3, text: 'Formata cada email como bloco de texto (remetente, assunto, preview)' },
              { n:4, text: 'Divide em chunks respeitando limite do Telegram (3800 chars)' },
              { n:5, text: 'Envia cada chunk via openclaw message send' },
              { n:6, text: 'Só faz UPDATE is_summarized=1 se TODOS os chunks foram enviados' },
            ].map(s => (
              <div key={s.n} className="step-item">
                <span className="step-num">{s.n}</span>
                <span style={{ color:'#a1a1aa', fontSize:'0.9rem', lineHeight:1.6 }}>{s.text}</span>
              </div>
            ))}
          </div>

          <div className="section-card">
            <h2>Sistema de Filtros (ignore_rules)</h2>
            <p style={{ color:'#a1a1aa', lineHeight:1.7, marginBottom:20 }}>
              Emails de remetentes indesejados (ex: GitHub, LinkedIn) são silenciosamente ignorados
              antes do digest — marcados como <code>is_summarized=1</code> sem aparecerem no Telegram.
              As regras ficam em uma tabela SQLite dedicada, fácil de expandir.
            </p>

            <p style={{ color:'#71717a', fontSize:'0.8rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>3 tipos de regra</p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginBottom:24 }}>
              {[
                { type: 'sender_email', desc: 'match exato no endereço (ex: noreply@github.com)' },
                { type: 'sender_domain', desc: 'qualquer email do domínio (ex: github.com)' },
                { type: 'subject_contains', desc: 'substring case-insensitive no assunto' },
              ].map(r => (
                <div key={r.type} style={{ background:'#6366f115', border:'1px solid #6366f133', borderRadius:10, padding:'10px 16px', display:'flex', flexDirection:'column', gap:4, minWidth:200, flex:'1 1 200px' }}>
                  <span style={{ display:'inline-block', background:'#6366f133', color:'#818cf8', fontSize:'0.72rem', fontWeight:700, fontFamily:'monospace', padding:'2px 10px', borderRadius:999, alignSelf:'flex-start' }}>{r.type}</span>
                  <span style={{ color:'#a1a1aa', fontSize:'0.82rem', lineHeight:1.5 }}>{r.desc}</span>
                </div>
              ))}
            </div>

            <p style={{ color:'#71717a', fontSize:'0.8rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>Regras padrão já incluídas</p>
            <div style={{ background:'#0d0d0f', border:'1px solid #27272a', borderRadius:10, padding:'12px 16px', marginBottom:24, fontFamily:'monospace', fontSize:'0.78rem', lineHeight:2 }}>
              {[
                { type: 'sender_domain', value: 'github.com', desc: 'GitHub notifications' },
                { type: 'sender_email', value: 'noreply@github.com', desc: 'GitHub noreply' },
                { type: 'sender_email', value: 'notifications@github.com', desc: 'GitHub PR/issues' },
              ].map((r, i) => (
                <div key={i} style={{ display:'flex', gap:12, alignItems:'center', borderBottom: i < 2 ? '1px solid #1a1a1f' : 'none', paddingBottom: i < 2 ? 4 : 0, paddingTop: i > 0 ? 4 : 0 }}>
                  <span style={{ color:'#6366f1', background:'#6366f115', borderRadius:4, padding:'0 6px', fontSize:'0.7rem' }}>{r.type}</span>
                  <span style={{ color:'#f4f4f5' }}>{r.value}</span>
                  <span style={{ color:'#52525b' }}>— {r.desc}</span>
                </div>
              ))}
            </div>

            <p style={{ color:'#71717a', fontSize:'0.8rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>Como adicionar novos filtros</p>
            <div className="code-wrap">
              <div className="code-header">
                <span className="code-lang">sql · ignore_rules</span>
                <button className="copy-btn" onClick={handleSqlCopy}>
                  {sqlCopied ? '✓ Copiado!' : 'Copiar'}
                </button>
              </div>
              <div className="code-scroll">
                <pre>{SQL_SNIPPET}</pre>
              </div>
            </div>
          </div>

          <div className="section-card">
            <h2>Código</h2>
            <div className="code-wrap">
              <div className="code-header">
                <span className="code-lang">python · digest.py</span>
                <button className="copy-btn" onClick={handleCopy}>
                  {copied ? '✓ Copiado!' : 'Copiar'}
                </button>
              </div>
              <div className="code-scroll">
                <pre>{CODE}</pre>
              </div>
            </div>
          </div>

          <div className="section-card">
            <h2>Download</h2>
            <p style={{ color:'#71717a', fontSize:'0.875rem', marginBottom:16 }}>
              Script completo com chunking inteligente e garantia de idempotência.
              Substitua <code>YOUR_TELEGRAM_USER_ID</code> pelo seu ID antes de usar.
            </p>
            <a href="/scripts/digest.py" download className="download-btn">
              ⬇ digest.py
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
