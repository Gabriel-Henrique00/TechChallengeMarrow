# Charger

Sistema de gestão de cobranças com integração Open Finance via [Pluggy](https://pluggy.ai), desenvolvido como parte do Tech Challenge Marrow.

---

## Visão Geral

O Charger permite que empresas criem e gerenciem cobranças para seus clientes, realizando pagamentos via PIX através de Iniciação de Pagamento (IP) pelo Open Finance. O operador cria a cobrança no sistema, envia o link para o cliente, e o status é atualizado automaticamente via webhooks da Pluggy.

---



# Como Rodar

## Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) e Docker Compose instalados
- Conta na [Pluggy](https://dashboard.pluggy.ai) com as credenciais em mãos
- Conta no [ngrok](https://ngrok.com) (gratuita)
- [Node]((https://nodejs.org/pt-br)) Instalado na Maquina

---

## 1. Configurar o ngrok

### 1.1 Rodar o ngrok pela primeira vez

```bash
npx ngrok http 3000
```

Na primeira vez, ele vai gerar um link de uma página no browser pedindo para você **criar uma conta ou fazer login** no ngrok.com. Crie a conta gratuita e faça o login.

### 1.2 Pegar o token e autenticar

Após criar a conta, o ngrok vai exibir seu **Authtoken** no dashboard. Rode:

```bash
npx ngrok authtoken SEU_TOKEN_AQUI
```

> Isso só precisa ser feito uma vez. O token fica salvo localmente.

### 1.3 Rodar o ngrok de novo

```bash
npx ngrok http 3000
```

Agora vai funcionar e vai gerar uma URL pública tipo:

```
https://xxxx-xx-xx-xxx-xx.ngrok-free.app
```

**Copie essa URL** — você vai precisar dela no próximo passo.

---

## 2. Configurar o projeto

```bash
cd charger
cp .env.example .env
```

Abra o `.env` e preencha com suas credenciais. O mais importante é colocar a URL do ngrok:

```env
# Banco de dados
DB_USER=admin
DB_PASS=admin
DB_NAME=charger_db

# JWT
JWT_SECRET=coloque-um-segredo-forte-aqui

# Pluggy — obtenha em dashboard.pluggy.ai
PLUGGY_CLIENT_ID=seu-client-id
PLUGGY_CLIENT_SECRET=seu-client-secret
PLUGGY_RECIPIENT_ID=uuid-da-conta-recebedora
PLUGGY_WEBHOOK_SECRET=segredo-do-webhook

# URL gerada pelo ngrok (substitua pela sua)
APP_BASE_URL=https://xxxx-xx-xx-xxx-xx.ngrok-free.app
FRONTEND_URL=https://xxxx-xx-xx-xxx-xx.ngrok-free.app
NEXT_PUBLIC_API_URL=https://xxxx-xx-xx-xxx-xx.ngrok-free.app
```

---

## 3. Subir o Docker

```bash
cd charger
docker compose up --build
```

Aguarde o build. Na primeira vez o banco é populado automaticamente com dados de demonstração.

**Acesse:**

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:3001 |
| Backend API | http://localhost:3000 |
| Swagger | http://localhost:3000/api/docs |

**Login padrão:**
- **Email:** `charger@charger.com`
- **Senha:** `charger123`

---

## 4. Parar o projeto

```bash
# Só parar
docker compose down

# Parar e apagar os dados do banco
docker compose down -v
```

---

## Atenção: URL do ngrok muda a cada reinício

Toda vez que você parar e reiniciar o ngrok, uma nova URL é gerada. Nesse caso:

1. Atualize as três variáveis de URL no `.env`
2. Reinicie os containers:

```bash
docker compose down
docker compose up
```

---

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 16 + Tailwind CSS + shadcn/ui |
| Backend | NestJS 11 + TypeORM |
| Banco de dados | MySQL 8.0 |
| Pagamentos | Pluggy (Open Finance / IP) |
| Infraestrutura | Docker + Docker Compose |

---

## Arquitetura
```
charger/
├── apps/
│   ├── backend/        # API NestJS
│   └── frontend/       # App Next.js
├── docker/
│   └── mysql/
│       └── init.sql    # Schema inicial do banco
└── docker-compose.yml
```

### Backend — Padrões e decisões

**Arquitetura em camadas com separação de domínio**

Cada módulo segue a separação:
```
módulo/
├── entities/       # Domínio puro — regras de negócio, sem dependência de framework
├── models/         # Modelos TypeORM — mapeamento para o banco
├── mappers/        # Conversão entre domain ↔ model ↔ DTO
├── repositories/   # Interface + implementação TypeORM (Repository Pattern)
├── dto/            # Objetos de transferência de dados (entrada/saída)
├── *.service.ts    # Casos de uso
└── *.controller.ts # Endpoints HTTP
```

**Design Patterns utilizados**

- **Repository Pattern** — cada módulo expõe uma interface (`IPagamentosRepository`, `IClientesRepository`, etc.) injetada via token string. A implementação TypeORM é intercambiável sem alterar o service, facilitando testes unitários com mocks.

- **Adapter Pattern** — a integração com a Pluggy é abstraída pela interface `IPaymentProvider`. O `PluggyPaymentAdapter` implementa essa interface. Se a Pluggy fosse substituída por outro provedor, apenas o adapter mudaria.

- **Domain Entity com comportamento** — as entidades de domínio (`Pagamento`, `TentativaTransacao`) encapsulam as regras de negócio em métodos como `podeReceberTentativa()`, `podeCancelar()`, `estaVencido()` — em vez de expor estado bruto.

- **Mapper estático** — a conversão entre as camadas é centralizada em classes com métodos estáticos (`PagamentoMapper`, `TentativaTransacaoMapper`), evitando que lógica de transformação vaze para services ou controllers.

- **Scheduler (CRON)** — o `VencimentoPagamentoScheduler` roda a cada minuto para expirar tentativas `PENDENTE` com mais de 5 minutos sem confirmação, garantindo consistência mesmo quando o webhook não chega.

**Consistência e concorrência**

- **Lock pessimista** no processamento de tentativas — ao criar uma tentativa, o pagamento é buscado com `FOR UPDATE`, evitando que duas requisições simultâneas criem tentativas duplicadas para o mesmo pagamento.

- **Fila em memória por paymentRequestId** nos webhooks — eventos da Pluggy para o mesmo pagamento são enfileirados e processados sequencialmente, eliminando race conditions no processamento paralelo de webhooks.

- **Auditoria de webhooks** — cada evento recebido da Pluggy é acumulado no campo JSON `resposta_webhook` da tentativa, preservando o histórico completo de transições de status sem alterar o schema do banco.

---

## Fluxo de Pagamento
```
Operador cria cobrança
        ↓
Envia link /checkout?id=... para o cliente
        ↓
Cliente acessa o checkout → sistema cria tentativa → Pluggy gera Payment Request
        ↓
Cliente abre app do banco → autoriza PIX
        ↓
Pluggy dispara webhook → backend recebe → marca tentativa como SUCESSO → pagamento PAGO
        ↓
Se cliente não pagar em 5 min → scheduler expira tentativa → NAO_AUTORIZADO
```

---

## Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) e [Docker Compose](https://docs.docker.com/compose/) instalados
- Credenciais da Pluggy (obtidas em [dashboard.pluggy.ai](https://dashboard.pluggy.ai))
- [ngrok](https://ngrok.com) ou similar para expor o webhook em desenvolvimento local

---

## Configuração

Copie o arquivo de exemplo e preencha as variáveis:
```bash
cd charger
cp .env.example .env
```

Edite o `.env` com suas credenciais:
```env
# Banco de dados
DB_USER=admin
DB_PASS=admin
DB_NAME=charger_db

# JWT
JWT_SECRET=troque-por-um-segredo-forte

# Pluggy — obtenha em dashboard.pluggy.ai
PLUGGY_CLIENT_ID=seu-client-id
PLUGGY_CLIENT_SECRET=seu-client-secret
PLUGGY_RECIPIENT_ID=uuid-da-conta-recebedora
PLUGGY_WEBHOOK_SECRET=segredo-do-webhook

# URLs
# Para receber webhooks da Pluggy em dev local, use ngrok:
#   npx ngrok http 3000
# e cole a URL https aqui
APP_BASE_URL=https://sua-url.ngrok-free.app
FRONTEND_URL=https://sua-url.ngrok-free.app

# URL da API acessível pelo browser
NEXT_PUBLIC_API_URL=https://sua-url.ngrok-free.app
```

> **Por que ngrok?** Os pagamentos são feitos via PIX no app do banco do cliente (celular). A Pluggy precisa enviar o webhook para uma URL pública acessível na internet. Em produção, use a URL real do servidor.

---

## Rodando o projeto

### Com Docker (recomendado)
```bash
cd charger
docker compose up --build
```

Na primeira inicialização, o backend popula automaticamente o banco com dados de demonstração:
- **Usuário:** `charger@charger.com`
- **Senha:** `charger123`
- 8 clientes, ~50 pagamentos distribuídos em 6 meses, todos os status representados

Acesse:
- **Frontend** → http://localhost:3001
- **Backend API** → http://localhost:3000
- **Swagger** → http://localhost:3000/api/docs

Para parar:
```bash
docker compose down
```

Para parar e remover os dados do banco:
```bash
docker compose down -v
```

---

### Sem Docker (desenvolvimento local)

Você precisará de um MySQL rodando localmente ou via Docker só para o banco:
```bash
# Só o banco via Docker
cd charger
docker compose up mysql -d
```

**Backend:**
```bash
cd charger/apps/backend
cp .env.example .env   # edite com suas credenciais
npm install
npm run start:dev
```

**Frontend:**
```bash
cd charger/apps/frontend
# crie um .env com:
# NEXT_PUBLIC_API_URL=http://localhost:3000
npm install
npm run dev
```

---

## Testes
```bash
cd charger/apps/backend

# Todos os testes unitários
npm run test

# Com cobertura
npm run test:cov
```

Os testes cobrem:
- Services de pagamentos, clientes, tentativas, dashboard, auth e usuários
- Entity `Pagamento` com todas as regras de negócio
- Webhooks service com todos os cenários de eventos da Pluggy
- Scheduler de expiração de tentativas
- Mappers de domínio

---

## Endpoints principais

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| `POST` | `/auth/login` | Login | ❌ |
| `POST` | `/users` | Criar conta | ❌ |
| `GET` | `/dashboard` | Resumo e métricas | ✅ |
| `GET` | `/payments` | Listar cobranças | ✅ |
| `POST` | `/payments` | Criar cobrança | ✅ |
| `GET` | `/payments/:id` | Detalhe da cobrança | ✅ |
| `PATCH` | `/payments/:id/cancel` | Cancelar cobrança | ✅ |
| `GET` | `/payments/public/:id` | Dados públicos do checkout | ❌ |
| `POST` | `/payments/:id/attempt` | Iniciar tentativa de pagamento | ❌ |
| `GET` | `/payments/:id/attempts` | Histórico de tentativas | ✅ |
| `GET` | `/clients` | Listar clientes | ✅ |
| `POST` | `/clients` | Criar cliente | ✅ |
| `POST` | `/webhooks/pluggy` | Receber eventos da Pluggy | ❌ |

Documentação completa disponível no Swagger em `/api/docs`.

---

## Status dos pagamentos

| Status | Descrição |
|--------|-----------|
| `AGUARDANDO_PAGAMENTO` | Cobrança criada, aguardando tentativa de pagamento |
| `PAGO` | PIX confirmado via webhook da Pluggy |
| `NAO_AUTORIZADO` | Tentativa recusada ou expirada sem confirmação |
| `VENCIDO` | Data de vencimento passou sem pagamento |
| `CANCELADO` | Cancelado manualmente pelo operador |

---

## Variáveis de ambiente

| Variável | Descrição | Obrigatória |
|----------|-----------|-------------|
| `DB_USER` | Usuário do MySQL | ✅ |
| `DB_PASS` | Senha do MySQL | ✅ |
| `DB_NAME` | Nome do banco | ✅ |
| `JWT_SECRET` | Segredo para assinar tokens JWT | ✅ |
| `PLUGGY_CLIENT_ID` | Client ID da Pluggy | ✅ |
| `PLUGGY_CLIENT_SECRET` | Client Secret da Pluggy | ✅ |
| `PLUGGY_RECIPIENT_ID` | UUID da conta recebedora na Pluggy | ✅ |
| `PLUGGY_WEBHOOK_SECRET` | Segredo para validar webhooks | ⚠️ recomendado |
| `APP_BASE_URL` | URL pública do backend | ✅ |
| `FRONTEND_URL` | URL pública do frontend (para callbacks da Pluggy) | ✅ |
| `NEXT_PUBLIC_API_URL` | URL da API acessível pelo browser | ✅ |
| `JWT_EXPIRES_IN` | Expiração do token JWT (padrão: `7d`) | ❌ |