# Agenda de Contatos — Cypress E2E Test Suite

Suite completa de testes End-to-End para a aplicação **Agenda de Contatos**, cobrindo CRUD de contatos com isolamento total via `cy.intercept()`, verificação de payloads enviados à API e testes de responsividade mobile.

---

## Stack & Versões

| Ferramenta | Versão |
|---|---|
| [Cypress](https://www.cypress.io/) | 12.6.0 |
| [Mochawesome](https://github.com/adamgruber/mochawesome) | 7.1.3 |
| Node.js | ≥ 18 |

**App under test:** [ebac-agenda-contatos-tan.vercel.app](https://ebac-agenda-contatos-tan.vercel.app/)  
**API:** `https://api-ebac.vercel.app/api/contatos` (instância compartilhada — completamente mockada nos testes)

---

## Cobertura de Testes

| Contexto | Cenário | Tipo |
|---|---|---|
| Adicionar contato | Adicionar com dados válidos e verificar payload POST | Happy path |
| Adicionar contato | Adicionar múltiplos e confirmar lista completa | Happy path |
| Adicionar contato | Campos obrigatórios vazios — não deve adicionar | Negativo |
| Adicionar contato | E-mail em formato inválido — não deve adicionar | Negativo |
| Editar contato | Editar nome e verificar remoção do dado antigo + payload PUT | Happy path |
| Editar contato | Editar e-mail e verificar mudança + payload PUT | Happy path |
| Excluir contato | Excluir contato e confirmar remoção da lista | Happy path |
| Excluir contato | Lista vazia após excluir o único contato | Happy path |
| Responsividade | Formulário visível em 375×667 (iPhone SE) | Mobile |
| Responsividade | Fluxo completo de adição em viewport mobile | Mobile |

**10 testes · 0 falhas · ~26 segundos**

---

## Arquitectura de Isolamento

A API `api-ebac.vercel.app` é uma instância **partilhada entre todos os alunos da EBAC**. Qualquer chamada real tornaria os testes não-determinísticos (dados acumulam entre runs de diferentes utilizadores).

A solução adoptada:

```
cy.intercept()  ──►  mocka 100% das chamadas à API
fixtures/       ──►  definem o estado exacto que cada contexto precisa
beforeEach      ──►  configura GET intercept ANTES de cy.visit()
```

Cada contexto controla o seu próprio estado inicial:

```js
// Contexto "Editar" — carrega lista com 1 contato já existente
cy.intercept('GET', '**/api/contatos', { fixture: 'api-contacts-one.json' }).as('getContacts')
cy.visit('/')
cy.wait('@getContacts')
cy.get('.edit').should('have.length', 1)  // assertion de estado inicial
```

---

## Verificação de Payload

Os testes não apenas validam o DOM — verificam também o **body enviado à API**.  
O app serializa o request como `{ "contato": { name, email, phone } }`:

```js
cy.wait('@createContact').then(({ request }) => {
  expect(parseBody(request).contato).to.include({ name: contact.name, email: contact.email })
})
```

O helper `parseBody` normaliza os casos em que `request.body` chega como string JSON vs objeto:

```js
const parseBody = (request) =>
  typeof request.body === 'string' ? JSON.parse(request.body) : request.body
```

---

## Estrutura do Projecto

```
cypress/
├── e2e/
│   └── agenda-contatos/
│       └── home.cy.js          # 10 testes, 4 contextos
├── fixtures/
│   ├── contact.json            # Dados do contato principal
│   ├── invalid-contact.json    # Dados inválidos (teste negativo)
│   ├── api-contacts-empty.json # GET → lista vazia
│   ├── api-contacts-one.json   # GET → 1 contato existente
│   ├── api-contact-created.json      # POST response (1 contato)
│   ├── api-contact-created-2.json    # POST response (2 contatos)
│   ├── api-contact-edited-name.json  # PUT response (nome editado)
│   └── api-contact-edited-email.json # PUT response (email editado)
├── support/
│   ├── commands.js             # addContact, deleteFirstContact, editFirstContact
│   └── e2e.js
└── reports/                    # Gerado pelo mochawesome (gitignored)
.github/
└── workflows/
    └── cypress.yml             # CI — GitHub Actions (Chrome, Ubuntu)
cypress.config.js
```

---

## Como Executar

### Pré-requisitos

```bash
node --version   # ≥ 18
npm install
```

### Comandos

```bash
# Abre o Cypress Test Runner (modo interactivo)
npm run cy:open

# Executa todos os testes em headless (Electron)
npm run cy:run

# Executa em modo headed (ver o browser)
npm run cy:run:headed

# Executa e gera relatório HTML com mochawesome
npm run cy:report
```

O relatório HTML é gerado em `cypress/reports/mochawesome_<timestamp>.html`.

---

## CI — GitHub Actions

Os testes correm automaticamente em cada `push` e `pull_request` para `main`:

```yaml
# .github/workflows/cypress.yml
- Browser: Chrome (latest)
- OS: ubuntu-latest
- Artefacto: relatório mochawesome (HTML + JSON)
```

[![Cypress Tests](https://github.com/viniciussilva2504/exercicio-cypress/actions/workflows/cypress.yml/badge.svg)](https://github.com/viniciussilva2504/exercicio-cypress/actions/workflows/cypress.yml)

---

## Boas Práticas Implementadas

- **Sem `cy.wait(<número>)`** — todos os waits usam aliases (`cy.wait('@alias')`)
- **Isolamento total** — `cy.intercept()` em 100% das chamadas à API
- **Assertion de estado inicial** — cada `beforeEach` verifica o estado antes de agir
- **Testes negativos** — campos vazios e e-mail inválido têm cobertura dedicada
- **Payload verification** — POST e PUT confirmam o body enviado, não só o DOM
- **Viewport correcto no mobile** — `cy.viewport()` no `beforeEach`, antes do `cy.visit()`
- **Intercept centralizado** — DELETE mockado no `beforeEach`, não duplicado em cada `it()`
- **Fixtures tipadas** — estado da API definido por ficheiros JSON dedicados por cenário

---

## Autor

**Vinicius Jesus da Silva**  
[linkedin.com/in/vjsilva2504](https://linkedin.com/in/vjsilva2504) · [portfolio-ebon-nine-95.vercel.app](https://portfolio-ebon-nine-95.vercel.app)
