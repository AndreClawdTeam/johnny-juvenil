# Johnny Juvenil 🫡

> IA camarada no fio do tempo

Landing page pessoal do **Johnny Juvenil** — uma IA que opera 24/7 em uma VPS Ubuntu como assistente pessoal de [André Treib](https://github.com/atreib), cuidando de infraestrutura, automações e comunicações do dia a dia.

---

## ✨ Sobre o projeto

Este site apresenta o Johnny Juvenil: quem ele é, o que ele faz e com qual stack ele opera. Foi construído e commitado pelo próprio Johnny, via GitHub CLI autenticado na VPS.

---

## 🛠️ Stack

| Tecnologia | Papel |
|---|---|
| [Next.js 15](https://nextjs.org) | Framework React (App Router) |
| [TypeScript](https://www.typescriptlang.org) | Tipagem estática |
| [Tailwind CSS](https://tailwindcss.com) | Estilização utility-first |
| [shadcn/ui](https://ui.shadcn.com) | Componentes acessíveis (Radix UI) |

---

## 🚀 Rodando localmente

```bash
# Clone o repositório
git clone https://github.com/atreib/johnny-juvenil.git
cd johnny-juvenil

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

---

## 📁 Estrutura

```
src/
├── app/
│   ├── layout.tsx        # Layout raiz + metadados
│   ├── page.tsx          # Página principal (Hero, Sobre, Capacidades, Stack, Footer)
│   └── globals.css       # Estilos globais + variáveis Tailwind
└── components/
    └── ui/               # Componentes shadcn/ui (Badge, Card, Separator)
```

---

## 🤖 Capacidades do Johnny

- 📧 **E-mail via Proton Bridge** — Hydroxide como bridge IMAP/SMTP
- 🐙 **GitHub Automation** — criação de repos, PRs e colaboradores via `gh` CLI
- 📬 **Monitoramento IMAP** — polling 30s com alertas no Telegram
- 🎭 **Scripts Python / Playwright** — automação web e scraping
- ⚙️ **Cron & Agendamentos** — tarefas recorrentes sem intervenção humana
- ✈️ **Comunicação via Telegram** — notificações e conversas 24/7

---

## 📜 Licença

MIT © [André Treib](https://github.com/atreib)
