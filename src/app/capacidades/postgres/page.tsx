'use client';

import { useState } from 'react';
import Link from 'next/link';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback silently
    }
  };

  return (
    <button
      onClick={handleCopy}
      style={{
        position: 'absolute',
        top: 12,
        right: 12,
        background: copied ? '#0ea5e920' : '#27272a',
        border: '1px solid ' + (copied ? '#0ea5e9' : '#3f3f46'),
        borderRadius: 8,
        color: copied ? '#0ea5e9' : '#a1a1aa',
        fontSize: 12,
        padding: '4px 10px',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      {copied ? '✓ Copiado' : 'Copiar'}
    </button>
  );
}

function CodeBlock({ code, lang = 'bash' }: { code: string; lang?: string }) {
  return (
    <div style={{ position: 'relative' }}>
      <CopyButton text={code} />
      <pre
        style={{
          background: '#09090b',
          border: '1px solid #27272a',
          borderRadius: 12,
          padding: '20px 20px 20px 20px',
          overflowX: 'auto',
          margin: 0,
          fontSize: 13,
          lineHeight: 1.7,
          color: '#e4e4e7',
          fontFamily: 'var(--font-geist-mono, monospace)',
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}

const sqlCode = `-- Conectar ao postgres padrão e criar um banco para sua app
CREATE DATABASE meu_app;

-- Verificar bancos existentes
\\l

-- Conectar ao novo banco
\\c meu_app`;

const connStrCode = `# Local (na VPS)
postgresql://andre:SUA_SENHA@localhost:5432/postgres

# Remoto (do seu computador)
postgresql://andre:SUA_SENHA@IP_DA_VPS:5432/postgres

# Para um banco específico
postgresql://andre:SUA_SENHA@IP_DA_VPS:5432/meu_app`;

const steps = [
  {
    n: 1,
    cmd: 'sudo apt-get install -y postgresql postgresql-contrib',
    label: 'Instalação via apt',
  },
  {
    n: 2,
    cmd: 'sudo systemctl enable --now postgresql',
    label: 'Habilitar serviço',
  },
  {
    n: 3,
    cmd: "sudo -u postgres psql -c \"CREATE ROLE andre WITH SUPERUSER LOGIN PASSWORD 'SENHA_FORTE';\"",
    label: 'Criar superusuário andre',
  },
  {
    n: 4,
    cmd: "# postgresql.conf\nlisten_addresses = '*'",
    label: 'Aceitar conexões externas',
  },
  {
    n: 5,
    cmd: '# pg_hba.conf — adicionar linha:\nhost all andre 0.0.0.0/0 scram-sha-256',
    label: 'Autenticação por senha',
  },
  {
    n: 6,
    cmd: 'sudo systemctl restart postgresql',
    label: 'Reiniciar serviço',
  },
  {
    n: 7,
    cmd: 'sudo ufw allow 5432/tcp',
    label: 'Abrir porta no UFW',
  },
];

export default function PostgresPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#09090b',
        color: '#fafafa',
        fontFamily: 'var(--font-geist-sans, sans-serif)',
      }}
    >
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.5s ease both; }

        .section-card {
          background: #18181b;
          border: 1px solid #27272a;
          border-radius: 16px;
          padding: 28px;
        }

        .step-card {
          background: #09090b;
          border: 1px solid #27272a;
          border-radius: 12px;
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .accent { color: #0ea5e9; }
        .muted  { color: #71717a; }
        .light  { color: #e4e4e7; }
      `}</style>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '64px 24px 96px' }}>

        {/* Back */}
        <div className="fade-up" style={{ animationDelay: '0ms', marginBottom: 48 }}>
          <Link
            href="/capacidades"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              color: '#71717a',
              textDecoration: 'none',
              fontSize: 14,
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#a1a1aa')}
            onMouseLeave={e => (e.currentTarget.style.color = '#71717a')}
          >
            ← Capacidades
          </Link>
        </div>

        {/* Hero */}
        <div className="fade-up" style={{ animationDelay: '60ms', marginBottom: 56 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <span style={{ fontSize: 48 }}>🐘</span>
            <div>
              <h1 style={{ fontSize: 34, fontWeight: 700, margin: 0, color: '#fafafa' }}>PostgreSQL</h1>
              <p style={{ margin: '4px 0 0', color: '#71717a', fontSize: 15 }}>
                Banco de dados relacional na VPS — acesso local e remoto
              </p>
            </div>
          </div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: '#0ea5e910',
              border: '1px solid #0ea5e930',
              borderRadius: 8,
              padding: '6px 14px',
              fontSize: 13,
              color: '#0ea5e9',
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#0ea5e9', display: 'inline-block' }} />
            PostgreSQL 16 · Ubuntu VPS
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Objetivo */}
          <div className="section-card fade-up" style={{ animationDelay: '100ms' }}>
            <h2 style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 600, color: '#fafafa' }}>
              🎯 Objetivo
            </h2>
            <p style={{ margin: 0, color: '#a1a1aa', lineHeight: 1.7, fontSize: 14 }}>
              Instalar e configurar o{' '}
              <span className="accent" style={{ fontWeight: 600 }}>PostgreSQL 16</span> na{' '}
              <span className="light">VPS Ubuntu</span> com acesso local e externo autenticado via
              usuário/senha — sem exposição de credenciais sensíveis.
            </p>
          </div>

          {/* O Problema */}
          <div className="section-card fade-up" style={{ animationDelay: '140ms' }}>
            <h2 style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 600, color: '#fafafa' }}>
              🔍 O Problema
            </h2>
            <p style={{ margin: 0, color: '#a1a1aa', lineHeight: 1.7, fontSize: 14 }}>
              Precisávamos de um banco de dados{' '}
              <span className="light">compartilhado entre agente e developer</span> — acessível
              localmente via{' '}
              <code
                style={{
                  background: '#09090b',
                  border: '1px solid #27272a',
                  borderRadius: 4,
                  padding: '1px 6px',
                  fontSize: 12,
                  color: '#0ea5e9',
                }}
              >
                localhost
              </code>{' '}
              para o agente rodando na VPS, e remotamente para André desenvolver aplicações
              conectadas ao mesmo banco.
            </p>
          </div>

          {/* Solução */}
          <div className="section-card fade-up" style={{ animationDelay: '180ms' }}>
            <h2 style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 600, color: '#fafafa' }}>
              ✅ Solução
            </h2>
            <p style={{ margin: 0, color: '#a1a1aa', lineHeight: 1.7, fontSize: 14 }}>
              PostgreSQL 16 instalado via{' '}
              <code
                style={{
                  background: '#09090b',
                  border: '1px solid #27272a',
                  borderRadius: 4,
                  padding: '1px 6px',
                  fontSize: 12,
                  color: '#e4e4e7',
                }}
              >
                apt
              </code>
              , com{' '}
              <code
                style={{
                  background: '#09090b',
                  border: '1px solid #27272a',
                  borderRadius: 4,
                  padding: '1px 6px',
                  fontSize: 12,
                  color: '#0ea5e9',
                }}
              >
                listen_addresses = &apos;*&apos;
              </code>{' '}
              para aceitar conexões de qualquer IP,{' '}
              <code
                style={{
                  background: '#09090b',
                  border: '1px solid #27272a',
                  borderRadius: 4,
                  padding: '1px 6px',
                  fontSize: 12,
                  color: '#0ea5e9',
                }}
              >
                pg_hba.conf
              </code>{' '}
              configurado para autenticação{' '}
              <code
                style={{
                  background: '#09090b',
                  border: '1px solid #27272a',
                  borderRadius: 4,
                  padding: '1px 6px',
                  fontSize: 12,
                  color: '#e4e4e7',
                }}
              >
                scram-sha-256
              </code>
              , e porta{' '}
              <span className="light" style={{ fontWeight: 600 }}>5432</span> liberada no{' '}
              <span className="light">UFW</span>.
            </p>
          </div>

          {/* Como foi feito */}
          <div className="section-card fade-up" style={{ animationDelay: '220ms' }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 600, color: '#fafafa' }}>
              🔧 Como foi feito
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {steps.map(step => (
                <div key={step.n} className="step-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span
                      style={{
                        minWidth: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: '#0ea5e915',
                        border: '1px solid #0ea5e940',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#0ea5e9',
                        flexShrink: 0,
                      }}
                    >
                      {step.n}
                    </span>
                    <span style={{ color: '#e4e4e7', fontSize: 14, fontWeight: 500 }}>
                      {step.label}
                    </span>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <CopyButton text={step.cmd} />
                    <pre
                      style={{
                        margin: 0,
                        background: '#09090b',
                        border: '1px solid #1e1e1e',
                        borderRadius: 8,
                        padding: '10px 14px',
                        fontSize: 12,
                        color: '#a1a1aa',
                        overflowX: 'auto',
                        fontFamily: 'var(--font-geist-mono, monospace)',
                        lineHeight: 1.6,
                      }}
                    >
                      <code>{step.cmd}</code>
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Criando novos bancos */}
          <div className="section-card fade-up" style={{ animationDelay: '260ms' }}>
            <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 600, color: '#fafafa' }}>
              🗄️ Criando novos bancos
            </h2>
            <p style={{ margin: '0 0 16px', color: '#a1a1aa', fontSize: 14, lineHeight: 1.6 }}>
              Com o superusuário <span className="accent">andre</span>, você pode criar bancos
              diretamente via psql:
            </p>
            <CodeBlock code={sqlCode} lang="sql" />
          </div>

          {/* Strings de conexão */}
          <div className="section-card fade-up" style={{ animationDelay: '300ms' }}>
            <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 600, color: '#fafafa' }}>
              🔗 Strings de conexão
            </h2>
            <p style={{ margin: '0 0 16px', color: '#a1a1aa', fontSize: 14, lineHeight: 1.6 }}>
              Substitua{' '}
              <code
                style={{
                  background: '#09090b',
                  border: '1px solid #27272a',
                  borderRadius: 4,
                  padding: '1px 6px',
                  fontSize: 12,
                  color: '#0ea5e9',
                }}
              >
                SUA_SENHA
              </code>{' '}
              e{' '}
              <code
                style={{
                  background: '#09090b',
                  border: '1px solid #27272a',
                  borderRadius: 4,
                  padding: '1px 6px',
                  fontSize: 12,
                  color: '#0ea5e9',
                }}
              >
                IP_DA_VPS
              </code>{' '}
              pelos valores reais:
            </p>
            <CodeBlock code={connStrCode} lang="text" />
          </div>

          {/* Superuser */}
          <div
            className="fade-up"
            style={{
              animationDelay: '340ms',
              background: '#0ea5e908',
              border: '1px solid #0ea5e930',
              borderRadius: 16,
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 16,
            }}
          >
            <span style={{ fontSize: 28, flexShrink: 0 }}>⚡</span>
            <div>
              <p style={{ margin: '0 0 6px', color: '#0ea5e9', fontWeight: 600, fontSize: 15 }}>
                Usuário SUPERUSER
              </p>
              <p style={{ margin: 0, color: '#71717a', fontSize: 13, lineHeight: 1.7 }}>
                O usuário <span style={{ color: '#e4e4e7' }}>andre</span> tem privilégios de{' '}
                <span style={{ color: '#0ea5e9', fontWeight: 600 }}>SUPERUSER</span> — pode criar
                bancos, schemas, extensions e gerenciar outros roles sem restrição.
              </p>
            </div>
          </div>

        </div>

        {/* Footer back link */}
        <div className="fade-up" style={{ animationDelay: '380ms', marginTop: 56, paddingTop: 32, borderTop: '1px solid #27272a' }}>
          <Link
            href="/capacidades"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              color: '#71717a',
              textDecoration: 'none',
              fontSize: 14,
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#a1a1aa')}
            onMouseLeave={e => (e.currentTarget.style.color = '#71717a')}
          >
            ← Voltar para Capacidades
          </Link>
        </div>
      </div>
    </main>
  );
}
