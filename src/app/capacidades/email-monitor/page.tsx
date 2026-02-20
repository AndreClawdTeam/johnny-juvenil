'use client';

import Link from 'next/link';
import { useState } from 'react';

const CODE = `#!/usr/bin/env python3
"""IMAP poller for Proton via hydroxide — stores emails in SQLite."""

import imaplib, sqlite3, email, time, pathlib, re
from datetime import datetime, timezone

HOST, PORT = "127.0.0.1", 1143
USERNAME   = "andreclawdbot"
PASSWORD   = "YOUR_HYDROXIDE_PASSWORD"
DB_PATH    = pathlib.Path(__file__).with_name("emails.db")
POLL_SECS  = 30

def init_db(con):
    con.execute("""CREATE TABLE IF NOT EXISTS emails (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uid INTEGER UNIQUE, from_name TEXT, from_email TEXT,
        subject TEXT, body TEXT, received_at TEXT,
        is_read INTEGER DEFAULT 0, is_summarized INTEGER DEFAULT 0
    )"""); con.commit()

def fetch_new(con):
    known = {r[0] for r in con.execute("SELECT uid FROM emails")}
    with imaplib.IMAP4(HOST, PORT) as imap:
        imap.login(USERNAME, PASSWORD)
        imap.select("INBOX")
        _, data = imap.uid("search", None, "ALL")
        new_uids = [int(u) for u in data[0].split() if int(u) not in known]
        for uid in new_uids:
            _, msg_data = imap.uid("fetch", str(uid), "(RFC822)")
            msg = email.message_from_bytes(msg_data[0][1])
            subject  = str(msg.get("Subject", "(sem assunto)"))
            from_raw = str(msg.get("From", ""))
            body = extract_body(msg)
            con.execute(
                "INSERT OR IGNORE INTO emails (uid, from_email, subject, body, received_at) VALUES (?,?,?,?,?)",
                (uid, from_raw, subject, body, datetime.now(timezone.utc).isoformat())
            ); con.commit()

def main():
    con = sqlite3.connect(DB_PATH)
    init_db(con)
    while True:
        fetch_new(con)
        time.sleep(POLL_SECS)

if __name__ == "__main__":
    main()`;

export default function EmailMonitorPage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes glow { 0%,100% { box-shadow:0 0 20px #10b98122; } 50% { box-shadow:0 0 40px #10b98144; } }
        @keyframes pulse-dot { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        .page-wrap { animation: fadeIn 0.4s ease both; }
        .accent-bar { background: linear-gradient(90deg, #10b981, #059669); height: 3px; border-radius: 2px; margin-bottom: 32px; }
        .section-card { background:#18181b; border:1px solid #27272a; border-radius:14px; padding:28px; margin-bottom:20px; }
        .section-card h2 { font-size:0.75rem; font-weight:600; letter-spacing:0.1em; color:#10b981; text-transform:uppercase; margin-bottom:12px; }
        .step-item { display:flex; gap:14px; align-items:flex-start; padding:10px 0; border-bottom:1px solid #27272a; }
        .step-item:last-child { border-bottom:none; }
        .step-num { width:28px; height:28px; border-radius:50%; background:#10b98122; border:1px solid #10b98144; color:#10b981; font-size:0.75rem; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
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
        .download-btn { display:inline-flex; align-items:center; gap:8px; padding:12px 24px; background:linear-gradient(135deg,#10b981,#059669); color:#fff; border-radius:10px; font-size:0.875rem; font-weight:600; text-decoration:none; transition:opacity 0.2s, transform 0.2s; animation: glow 3s infinite; }
        .download-btn:hover { opacity:0.85; transform:translateY(-1px); }
        .back-link { display:inline-flex; align-items:center; gap:6px; color:#71717a; font-size:0.875rem; text-decoration:none; transition:color 0.2s; margin-bottom:32px; }
        .back-link:hover { color:#e4e4e7; }
        .badge { display:inline-block; font-size:0.7rem; padding:2px 8px; border-radius:999px; background:#10b98122; color:#10b981; border:1px solid #10b98144; font-weight:600; margin-left:8px; vertical-align:middle; }
      `}</style>

      <main className="page-wrap" style={{ minHeight:'100vh', background:'#09090b', color:'#fafafa', padding:'64px 24px' }}>
        <div style={{ maxWidth:800, margin:'0 auto' }}>
          <Link href="/capacidades" className="back-link">← Capacidades</Link>

          <div style={{ marginBottom:32 }}>
            <span style={{ fontSize:'2.5rem' }}>📧</span>
            <h1 style={{ fontSize:'2rem', fontWeight:700, color:'#f4f4f5', marginTop:8, letterSpacing:'-0.02em' }}>
              Email Monitor <span className="badge">IMAP</span>
            </h1>
          </div>

          <div className="accent-bar" />

          <div className="section-card">
            <h2>Objetivo</h2>
            <p style={{ color:'#a1a1aa', lineHeight:1.7 }}>
              Monitor IMAP contínuo para ProtonMail via Hydroxide bridge, armazenando emails em SQLite
              sem depender de APIs pagas ou serviços externos.
            </p>
          </div>

          <div className="section-card">
            <h2>O Problema</h2>
            <p style={{ color:'#a1a1aa', lineHeight:1.7 }}>
              ProtonMail não tem IMAP nativo acessível por scripts — só pelo app oficial.
              Precisávamos de um bridge local que expusesse IMAP padrão para automação.
            </p>
          </div>

          <div className="section-card">
            <h2>Solução</h2>
            <p style={{ color:'#a1a1aa', lineHeight:1.7 }}>
              <strong style={{ color:'#f4f4f5' }}>Hydroxide bridge</strong> (Go) expõe IMAP em <code style={{ color:'#10b981', background:'#10b98115', padding:'1px 6px', borderRadius:4 }}>localhost:1143</code>.
              O monitor Python faz polling a cada 30s, parseia os emails e salva no SQLite com campos
              <code style={{ color:'#10b981', background:'#10b98115', padding:'1px 6px', borderRadius:4, marginLeft:4 }}>uid, from, subject, body, is_summarized</code>.
            </p>
          </div>

          <div className="section-card">
            <h2>Como funciona</h2>
            {[
              { n:1, text: 'imaplib.IMAP4("127.0.0.1", 1143) conecta ao Hydroxide' },
              { n:2, text: 'Busca UIDs novos (não presentes no SQLite)' },
              { n:3, text: 'Faz fetch RFC822 de cada UID novo' },
              { n:4, text: 'Parseia com email.message_from_bytes' },
              { n:5, text: 'Extrai plain text ou HTML (com strip de tags)' },
              { n:6, text: 'Salva no SQLite com INSERT OR IGNORE' },
              { n:7, text: 'Dorme 30s e repete infinitamente' },
            ].map(s => (
              <div key={s.n} className="step-item">
                <span className="step-num">{s.n}</span>
                <span style={{ color:'#a1a1aa', fontSize:'0.9rem', lineHeight:1.6 }}>{s.text}</span>
              </div>
            ))}
          </div>

          <div className="section-card">
            <h2>Código</h2>
            <div className="code-wrap">
              <div className="code-header">
                <span className="code-lang">python · monitor_email.py</span>
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
              Script completo com tratamento de erros, logging e strip de HTML.
              Substitua <code style={{ color:'#10b981', background:'#10b98115', padding:'1px 6px', borderRadius:4 }}>YOUR_HYDROXIDE_PASSWORD</code> antes de usar.
            </p>
            <a href="/scripts/monitor_email.py" download className="download-btn">
              ⬇ monitor_email.py
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
