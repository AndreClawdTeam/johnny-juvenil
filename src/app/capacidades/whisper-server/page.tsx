'use client';

import Link from 'next/link';
import { useState } from 'react';

const CODE = `#!/usr/bin/env python3
"""
whisper_server.py — Fake Deepgram API usando Whisper local (faster-whisper).
Roda em http://127.0.0.1:8765
OpenClaw envia áudio → aqui → transcreve grátis → retorna JSON no formato Deepgram.

Config no openclaw.json:
  tools.media.audio.enabled = true
  tools.media.audio.models  = [{ provider: "deepgram", model: "nova-3" }]
  tools.media.audio.baseUrl = "http://127.0.0.1:8765"
"""
import os
import json
import tempfile
import logging
from flask import Flask, request, jsonify
from faster_whisper import WhisperModel

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("whisper-server")

app = Flask(__name__)

# Modelo carregado uma vez (baixa ~244MB na primeira execução, fica em cache)
MODEL_SIZE = os.environ.get("WHISPER_MODEL", "small")
log.info(f"Carregando modelo Whisper '{MODEL_SIZE}'...")
_model = WhisperModel(MODEL_SIZE, device="cpu", compute_type="int8")
log.info("Modelo carregado!")


def transcribe_bytes(data: bytes, language: str = None) -> tuple[str, float]:
    with tempfile.NamedTemporaryFile(suffix=".ogg", delete=False) as tmp:
        tmp.write(data)
        tmp_path = tmp.name
    try:
        segments, info = _model.transcribe(
            tmp_path,
            language=language or None,
            beam_size=5,
            vad_filter=True,
        )
        text = " ".join(seg.text.strip() for seg in segments).strip()
        confidence = 0.95  # faster-whisper não expõe confidence média simples
        return text, confidence, info.language
    finally:
        os.unlink(tmp_path)


@app.route("/v1/listen", methods=["POST"])
def listen():
    """Endpoint principal — imita POST https://api.deepgram.com/v1/listen"""
    language = request.args.get("language", None)

    audio_data = request.get_data()
    if not audio_data:
        return jsonify({"error": "No audio data received"}), 400

    log.info(f"Recebido áudio: {len(audio_data)} bytes | lang={language or 'auto'}")

    try:
        text, confidence, detected_lang = transcribe_bytes(audio_data, language)
        log.info(f"Transcrição: [{detected_lang}] {text[:80]}...")
    except Exception as e:
        log.error(f"Erro na transcrição: {e}")
        return jsonify({"error": str(e)}), 500

    # Resposta no formato Deepgram (o que OpenClaw espera)
    response = {
        "metadata": {
            "transaction_key": "local-whisper",
            "request_id": "local",
            "sha256": "",
            "created": "",
            "duration": 0,
            "channels": 1,
            "models": [MODEL_SIZE],
        },
        "results": {
            "channels": [
                {
                    "alternatives": [
                        {
                            "transcript": text,
                            "confidence": confidence,
                            "words": [],
                        }
                    ]
                }
            ]
        },
    }
    return jsonify(response)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model": MODEL_SIZE})


if __name__ == "__main__":
    port = int(os.environ.get("WHISPER_PORT", 8765))
    log.info(f"Servidor iniciando em http://127.0.0.1:{port}")
    app.run(host="127.0.0.1", port=port, debug=False)`;

const CONFIG = `{
  "tools": {
    "media": {
      "audio": {
        "enabled": true,
        "models": [{ "provider": "deepgram", "model": "nova-3" }],
        "baseUrl": "http://127.0.0.1:8765"
      }
    }
  }
}`;

export default function WhisperServerPage() {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedConfig, setCopiedConfig] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyConfig = () => {
    navigator.clipboard.writeText(CONFIG);
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2000);
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes glow { 0%,100% { box-shadow:0 0 20px #10b98122; } 50% { box-shadow:0 0 40px #10b98144; } }
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
        code { color:#10b981; background:#10b98115; padding:1px 6px; border-radius:4px; }
        .highlight { color:#f4f4f5; }
        .install-block { background:#0d0d0f; border:1px solid #27272a; border-radius:8px; padding:14px 18px; font-family:monospace; font-size:0.82rem; color:#a1a1aa; margin-top:12px; }
        .install-block span { color:#10b981; }
        .flow-arrow { color:#10b98166; font-size:1.2rem; text-align:center; margin:4px 0; }
      `}</style>

      <main className="page-wrap" style={{ minHeight:'100vh', background:'#09090b', color:'#fafafa', padding:'64px 24px' }}>
        <div style={{ maxWidth:800, margin:'0 auto' }}>
          <Link href="/capacidades" className="back-link">← Capacidades</Link>

          <div style={{ marginBottom:32 }}>
            <span style={{ fontSize:'2.5rem' }}>🤖</span>
            <h1 style={{ fontSize:'2rem', fontWeight:700, color:'#f4f4f5', marginTop:8, letterSpacing:'-0.02em' }}>
              Whisper Server <span className="badge">local</span>
            </h1>
          </div>

          <div className="accent-bar" />

          <div className="section-card">
            <h2>Objetivo</h2>
            <p style={{ color:'#a1a1aa', lineHeight:1.7 }}>
              Servidor HTTP local que imita a API do Deepgram para o OpenClaw transcrever
              mensagens de voz usando <strong className="highlight">Whisper local</strong> —
              sem pagar nada, sem enviar áudio para servidores externos.
            </p>
          </div>

          <div className="section-card">
            <h2>O Problema</h2>
            <p style={{ color:'#a1a1aa', lineHeight:1.7 }}>
              OpenClaw só suporta <strong className="highlight">Deepgram</strong> para transcrição
              inbound de mensagens de voz. Deepgram é um serviço pago — cada minuto de áudio custa.
              Para uso intenso no Telegram, os custos escalariam rapidamente.
              Mas OpenClaw permite sobrescrever o <code>baseUrl</code> da API do Deepgram.
            </p>
          </div>

          <div className="section-card">
            <h2>Solução</h2>
            <p style={{ color:'#a1a1aa', lineHeight:1.7 }}>
              Servidor <code>Flask</code> em <code>localhost:8765</code> que aceita{' '}
              <code>POST /v1/listen</code> com áudio binário, transcreve com{' '}
              <code>faster-whisper</code> e retorna JSON no formato exato que o Deepgram retornaria.
              OpenClaw não sabe a diferença.
            </p>
            <div className="install-block">
              <span>$</span> pip install flask faster-whisper
            </div>
          </div>

          <div className="section-card">
            <h2>Config openclaw.json</h2>
            <p style={{ color:'#a1a1aa', fontSize:'0.875rem', lineHeight:1.6, marginBottom:16 }}>
              Adicione isso ao seu <code>openclaw.json</code> para redirecionar chamadas do Deepgram ao servidor local:
            </p>
            <div className="code-wrap">
              <div className="code-header">
                <span className="code-lang">json · openclaw.json</span>
                <button className="copy-btn" onClick={handleCopyConfig}>
                  {copiedConfig ? '✓ Copiado!' : 'Copiar'}
                </button>
              </div>
              <div className="code-scroll">
                <pre>{CONFIG}</pre>
              </div>
            </div>
          </div>

          <div className="section-card">
            <h2>Como funciona</h2>
            {[
              { n:1, text: 'OpenClaw recebe mensagem de voz → baixa arquivo OGG do Telegram' },
              { n:2, text: 'POST http://127.0.0.1:8765/v1/listen com o áudio como body binário' },
              { n:3, text: 'Servidor salva em temp file, transcreve com faster-whisper (modelo small, CPU, int8)' },
              { n:4, text: 'Retorna JSON { results: { channels: [{ alternatives: [{ transcript }] }] } }' },
              { n:5, text: 'OpenClaw injeta o transcript na conversa — zero custo, zero latência de rede' },
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
                <span className="code-lang">python · whisper_server.py</span>
                <button className="copy-btn" onClick={handleCopyCode}>
                  {copiedCode ? '✓ Copiado!' : 'Copiar'}
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
              Servidor completo sem credenciais. Requer <code>pip install flask faster-whisper</code>.
              Inicie com <code>python3 whisper_server.py</code> e configure o <code>baseUrl</code> no openclaw.json.
            </p>
            <a href="/scripts/whisper_server.py" download className="download-btn">
              ⬇ whisper_server.py
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
