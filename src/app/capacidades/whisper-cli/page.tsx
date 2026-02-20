'use client';

import Link from 'next/link';
import { useState } from 'react';

const CODE = `#!/usr/bin/env python3
"""
transcribe.py — Transcrição de áudio gratuita via Whisper local.
Uso: python3 transcribe.py <arquivo_de_audio>
     python3 transcribe.py <arquivo_de_audio> --model small --lang pt
Suporta: ogg, mp3, wav, m4a, flac, webm...
"""
import sys, argparse, pathlib

def transcribe(audio_path: str, model_size: str = "small", language: str = None):
    from faster_whisper import WhisperModel

    path = pathlib.Path(audio_path)
    if not path.exists():
        raise FileNotFoundError(f"Arquivo não encontrado: {audio_path}")

    # Carrega o modelo (baixa automaticamente na primeira vez, ~244MB)
    # compute_type="int8" é o mais leve para CPU
    model = WhisperModel(model_size, device="cpu", compute_type="int8")

    segments, info = model.transcribe(
        str(path),
        language=language,    # None = detecção automática de idioma
        beam_size=5,
        vad_filter=True,      # ignora silêncio automaticamente
    )

    text = " ".join(seg.text.strip() for seg in segments).strip()
    return text, info.language, info.duration

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("audio", help="Caminho para o arquivo de áudio")
    parser.add_argument("--model", default="small",
                        choices=["tiny","base","small","medium","large-v3"])
    parser.add_argument("--lang", default=None, help="ex: pt, en")
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()

    text, lang, duration = transcribe(args.audio, args.model, args.lang)
    if args.json:
        import json
        print(json.dumps({
            "text": text, "language": lang,
            "duration_seconds": round(duration, 2), "model": args.model,
        }, ensure_ascii=False))
    else:
        print(text)

if __name__ == "__main__":
    main()`;

export default function WhisperCLIPage() {
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
        @keyframes glow { 0%,100% { box-shadow:0 0 20px #f59e0b22; } 50% { box-shadow:0 0 40px #f59e0b44; } }
        .page-wrap { animation: fadeIn 0.4s ease both; }
        .accent-bar { background: linear-gradient(90deg, #f59e0b, #d97706); height: 3px; border-radius: 2px; margin-bottom: 32px; }
        .section-card { background:#18181b; border:1px solid #27272a; border-radius:14px; padding:28px; margin-bottom:20px; }
        .section-card h2 { font-size:0.75rem; font-weight:600; letter-spacing:0.1em; color:#f59e0b; text-transform:uppercase; margin-bottom:12px; }
        .step-item { display:flex; gap:14px; align-items:flex-start; padding:10px 0; border-bottom:1px solid #27272a; }
        .step-item:last-child { border-bottom:none; }
        .step-num { width:28px; height:28px; border-radius:50%; background:#f59e0b22; border:1px solid #f59e0b44; color:#f59e0b; font-size:0.75rem; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
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
        .download-btn { display:inline-flex; align-items:center; gap:8px; padding:12px 24px; background:linear-gradient(135deg,#f59e0b,#d97706); color:#fff; border-radius:10px; font-size:0.875rem; font-weight:600; text-decoration:none; transition:opacity 0.2s, transform 0.2s; animation: glow 3s infinite; }
        .download-btn:hover { opacity:0.85; transform:translateY(-1px); }
        .back-link { display:inline-flex; align-items:center; gap:6px; color:#71717a; font-size:0.875rem; text-decoration:none; transition:color 0.2s; margin-bottom:32px; }
        .back-link:hover { color:#e4e4e7; }
        .badge { display:inline-block; font-size:0.7rem; padding:2px 8px; border-radius:999px; background:#f59e0b22; color:#f59e0b; border:1px solid #f59e0b44; font-weight:600; margin-left:8px; vertical-align:middle; }
        code { color:#f59e0b; background:#f59e0b15; padding:1px 6px; border-radius:4px; }
        .highlight { color:#f4f4f5; }
        .install-block { background:#0d0d0f; border:1px solid #27272a; border-radius:8px; padding:14px 18px; font-family:monospace; font-size:0.82rem; color:#a1a1aa; margin-top:12px; }
        .install-block span { color:#f59e0b; }
      `}</style>

      <main className="page-wrap" style={{ minHeight:'100vh', background:'#09090b', color:'#fafafa', padding:'64px 24px' }}>
        <div style={{ maxWidth:800, margin:'0 auto' }}>
          <Link href="/capacidades" className="back-link">← Capacidades</Link>

          <div style={{ marginBottom:32 }}>
            <span style={{ fontSize:'2.5rem' }}>🎙️</span>
            <h1 style={{ fontSize:'2rem', fontWeight:700, color:'#f4f4f5', marginTop:8, letterSpacing:'-0.02em' }}>
              Whisper CLI <span className="badge">local</span>
            </h1>
          </div>

          <div className="accent-bar" />

          <div className="section-card">
            <h2>Objetivo</h2>
            <p style={{ color:'#a1a1aa', lineHeight:1.7 }}>
              Ferramenta CLI para transcrever qualquer arquivo de áudio localmente usando
              OpenAI Whisper open-source — sem API, sem custo, sem limites de uso.
            </p>
          </div>

          <div className="section-card">
            <h2>O Problema</h2>
            <p style={{ color:'#a1a1aa', lineHeight:1.7 }}>
              A API Whisper da OpenAI custa dinheiro. Para transcrever mensagens de voz do Telegram
              frequentemente, os custos escalariam rapidamente. Queríamos rodar tudo <strong className="highlight">local e grátis</strong>.
            </p>
          </div>

          <div className="section-card">
            <h2>Solução</h2>
            <p style={{ color:'#a1a1aa', lineHeight:1.7 }}>
              <code>faster-whisper</code> (CTranslate2) roda o modelo Whisper small localmente na CPU
              com quantização <code>int8</code>. Modelo de ~244MB, baixado uma vez e cacheado automaticamente.
            </p>
            <div className="install-block">
              <span>$</span> pip install faster-whisper
            </div>
          </div>

          <div className="section-card">
            <h2>Como funciona</h2>
            {[
              { n:1, text: 'Aceita path de áudio como argumento (ogg, mp3, wav, m4a, flac...)' },
              { n:2, text: 'Carrega WhisperModel("small", device="cpu", compute_type="int8")' },
              { n:3, text: 'Transcreve com vad_filter=True (ignora silêncio automaticamente)' },
              { n:4, text: 'Detecção automática de idioma (ou manual com --lang pt)' },
              { n:5, text: 'Saída em texto puro ou JSON estruturado com --json' },
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
                <span className="code-lang">python · transcribe.py</span>
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
              Script sem credenciais — pronto para usar. Requer <code>pip install faster-whisper</code>.
            </p>
            <a href="/scripts/transcribe.py" download className="download-btn">
              ⬇ transcribe.py
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
