# Wayne Productivity System 🦇

Sistema completo de produtividade pessoal com tema dark monocromático (preto/cinza/branco), construído com React, Vite e Supabase.

## 🎨 Design

- **Paleta Monocromática**: Preto puro (#000000), cinzas (#0a0a0a, #1a1a1a, #2a2a2a) e branco (#ffffff)
- **Tipografia**: JetBrains Mono e Inter
- **Estilo**: Minimalista, clean, focado em produtividade

## 📋 Funcionalidades

### ✅ Implementado
- [x] Autenticação completa (login, registro, sessão persistente)
- [x] Layout responsivo com sidebar e header
- [x] Sistema de componentes UI (Button, Input, Card, Modal, etc)
- [x] Proteção de rotas
- [x] Tema dark monocromático
- [x] Estrutura base para todos os módulos

### 🚧 Em Desenvolvimento
- [ ] Módulo de Hábitos (CRUD, check-ins, streaks)
- [ ] Módulo de Treinos (criação, execução, histórico)
- [ ] Módulo de Agenda (calendário visual, compromissos)
- [ ] Módulo de Finanças (transações, gráficos, dashboard)
- [ ] Dashboard Home completo

## 🚀 Como Rodar

### Pré-requisitos

- Node.js 18+ instalado
- Conta no Supabase (gratuita)

### 1. Instalar Dependências

\`\`\`bash
cd "C:\\Users\\Lucas\\Downloads\\WAYNE SYSTEM"
npm install
\`\`\`

### 2. Configurar Supabase

As credenciais já estão configuradas no arquivo `.env.local`. Agora você precisa executar a migration SQL:

1. Acesse o [Painel do Supabase](https://supabase.com/dashboard)
2. Vá para seu projeto
3. No menu lateral, clique em **SQL Editor**
4. Clique em **New Query**
5. Copie todo o conteúdo do arquivo `supabase_migration.sql`
6. Cole no editor e clique em **Run**

Isso criará todas as tabelas necessárias com segurança (RLS) configurada.

### 3. Executar o Projeto

\`\`\`bash
npm run dev
\`\`\`

O aplicativo estará disponível em:
- **Local**: http://localhost:5173
- **Network**: verifique no terminal

### 4. Criar Conta e Logar

1. Abra http://localhost:5173
2. Clique em "Criar conta"
3. Preencha nome, email e senha
4. Faça login com suas credenciais

## 📁 Estrutura do Projeto

\`\`\`
WAYNE SYSTEM/
├── public/
│   └── batman-logo.svg           # Logo Batman
├── src/
│   ├── components/
│   │   ├── layout/              # Sidebar, Header, Layout
│   │   └── ui/                  # Button, Input, Card, Modal, etc
│   ├── hooks/
│   │   └── useAuth.js           # Hook de autenticação
│   ├── lib/
│   │   ├── supabase.js          # Cliente Supabase
│   │   └── utils.js             # Funções helper
│   ├── pages/
│   │   ├── Home.jsx             # Dashboard
│   │   ├── Habits.jsx           # Hábitos
│   │   ├── Workouts.jsx         # Treinos
│   │   ├── Calendar.jsx         # Agenda
│   │   ├── Finance.jsx          # Finanças
│   │   ├── Login.jsx            # Login
│   │   └── Register.jsx         # Registro
│   ├── App.jsx                  # Rotas e providers
│   ├── main.jsx                 # Entry point
│   └── index.css                # Estilos globais
├── .env.local                   # Variáveis de ambiente
├── supabase_migration.sql       # Migration do banco
├── package.json
├── tailwind.config.js
└── vite.config.js
\`\`\`

## 💾 Banco de Dados

### Tabelas Criadas

- **habits**: Hábitos do usuário
- **habit_checkins**: Check-ins diários de hábitos
- **workouts**: Treinos personalizados
- **workout_logs**: Histórico de treinos realizados
- **appointments**: Compromissos/eventos da agenda
- **transactions**: Transações financeiras

Todas as tabelas têm:
- UUID como chave primária
- Referência ao `user_id` autenticado
- RLS (Row Level Security) configurado
- Índices para performance
- Timestamps automáticos

## 🛠️ Stack Tecnológica

- **Frontend**: React 18 + Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS 3
- **Backend**: Supabase (Auth + PostgreSQL)
- **State**: Hooks + Context API
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Calendar**: React Big Calendar
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Date**: date-fns

## 🎯 Próximos Passos

1. **Implementar API Layer**: Criar funções CRUD para each módulo
2. **Desenvolver Módulo de Hábitos**: CRUD completo + check-ins + streaks
3. **Desenvolver Módulo de Finanças**: Transações + gráficos
4. **Desenvolver Módulo de Treinos**: Criação + execução com timer
5. **Desenvolver Módulo de Agenda**: Calendário visual + CRUD de eventos
6. **Dashboard Home**: Integrar resumos de todos os módulos
7. **Polish**: Loading states, empty states, error handling

## 🔒 Segurança

- Autenticação via Supabase Auth
- Row Level Security (RLS) em todas as tabelas
- Variáveis de ambiente para credenciais
- Proteção de rotas no frontend

## 📝 Notas

- O design é 100% monocromático (preto/cinza/branco), sem cores vibrantes
- Todos os componentes seguem o design system definido
- O sistema é multi-usuário, cada usuário vê apenas seus próprios dados
- A aplicação é responsiva e funciona bem em desktop e mobile

## 🐛 Troubleshooting

### Erro ao logar/criar conta
- Verifique se executou a migration SQL no Supabase
- Confirme que as credenciais no `.env.local` estão corretas

### Tabelas não encontradas
- Execute o script `supabase_migration.sql` no SQL Editor do Supabase

### Erro ao fazer build
- Rode `npm install` novamente
- Delete `node_modules` e `package-lock.json`, depois rode `npm install`

---

**Desenvolvido com 🦇 por Wayne Enterprises**
