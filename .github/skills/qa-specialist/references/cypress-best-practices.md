# Cypress Best Practices — QA Reference

## Selector Strategy (priority order)

1. `data-testid` / `data-cy` attributes — most resilient
2. ARIA roles: `cy.findByRole('button', { name: 'Adicionar' })`
3. `cy.contains('text')` — readable, human-friendly
4. Semantic attributes: `cy.get('label').contains('Nome').siblings('input')`
5. CSS class `.adicionar` — acceptable if stable
6. **Avoid**: `[type="text"]`, positional `.first()` without context, nth-child

## Replacing `cy.wait(N)`

### ❌ Anti-pattern
```js
cy.get('.adicionar').click()
cy.wait(4000) // arbitrary delay
cy.get('.contact-item').should('have.length', 1)
```

### ✅ Assertion-based wait (Cypress auto-retries)
```js
cy.get('.adicionar').click()
cy.get('.contact-item').should('have.length', 1) // Cypress retries until timeout
```

### ✅ Network wait with intercept
```js
cy.intercept('POST', '/api/contacts').as('createContact')
cy.get('.adicionar').click()
cy.wait('@createContact')
cy.get('.contact-item').should('have.length', 1)
```

## Assertion Depth

### ❌ Shallow (screenshot is not an assertion)
```js
cy.get('.adicionar').click()
cy.screenshot('added contact')
```

### ✅ Deep (verifies state)
```js
cy.get('.adicionar').click()
cy.contains('Vinicius Silva').should('be.visible')
cy.get('.contact-item').should('have.length.greaterThan', 0)
```

## Test Isolation

Each `it()` must set up its own state. Never rely on previous tests.

```js
describe('Contact Management', () => {
  beforeEach(() => {
    cy.visit('/')
    // If needed: seed state via API or UI
  })

  it('Deve editar um contato', () => {
    // Add the contact first, then edit it — do not assume it exists
    cy.addContact(contactFixture) // custom command
    cy.editContact('Vinicius Silva', { name: 'Editado' })
    cy.contains('Editado').should('be.visible')
  })
})
```

## Fixtures

Store test data in `cypress/fixtures/contact.json`:
```json
{
  "name": "Vinicius Silva",
  "email": "vinicius@teste.com",
  "phone": "11 999999999"
}
```

Use in tests:
```js
beforeEach(() => {
  cy.fixture('contact').as('contact')
})

it('Deve incluir um novo contato', function () {
  cy.get('[data-testid="name-input"]').type(this.contact.name)
})
```

## Custom Commands (commands.js)

Extract repeated sequences into commands:
```js
// cypress/support/commands.js
Cypress.Commands.add('addContact', (contact) => {
  cy.get('[name="nome"], [type="text"]').first().type(contact.name)
  cy.get('[type="email"]').type(contact.email)
  cy.get('[type="tel"]').type(contact.phone)
  cy.get('.adicionar').click()
  cy.contains(contact.name).should('be.visible')
})
```

## `cypress.config.js` — Portfolio Config

```js
const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://ebac-agenda-contatos-tan.vercel.app',
    defaultCommandTimeout: 8000,
    viewportWidth: 1280,
    viewportHeight: 720,
    setupNodeEvents(on, config) {},
  },
  reporter: 'mochawesome',
  reporterOptions: {
    reportDir: 'cypress/reports',
    overwrite: true,
    html: true,
    json: true,
    timestamp: 'ddmmyyyy_HHMMss',
  },
})
```

## `package.json` — Recommended Scripts

```json
{
  "scripts": {
    "cy:open": "cypress open",
    "cy:run": "cypress run",
    "cy:run:headed": "cypress run --headed",
    "cy:report": "cypress run --reporter mochawesome"
  }
}
```
