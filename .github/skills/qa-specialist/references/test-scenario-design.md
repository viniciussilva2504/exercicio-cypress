# Test Scenario Design — QA Reference

## BDD Structure (Given / When / Then)

Every test name must be readable as a sentence that describes behavior, not implementation.

### Format
```
it('should [do something] when [condition]', ...)
// or in Portuguese (consistent with project):
it('Deve [ação] quando [condição]', ...)
```

### Examples for agenda-contatos

| Layer | Test Name |
|---|---|
| Happy Path | `Deve adicionar um contato com dados válidos` |
| Edge Case | `Deve adicionar um contato com nome em caracteres especiais` |
| Negative | `Não deve adicionar contato com email inválido` |
| Negative | `Não deve adicionar contato com campos obrigatórios vazios` |
| Happy Path | `Deve editar o nome de um contato existente` |
| Happy Path | `Deve excluir um contato e removê-lo da lista` |
| Negative | `Deve cancelar a edição e manter os dados originais` |

## Scenario Matrix (minimum for portfolio)

For each feature, cover at minimum:

```
Feature: [Add / Edit / Delete] Contact
├── ✅ Happy Path        — valid data, expected flow
├── ⚠️  Edge Case 1     — boundary/special input
├── ⚠️  Edge Case 2     — empty/optional fields
└── ❌ Negative Case    — invalid data, system rejection
```

## Test Independence Checklist

Before writing each `it()`:
- [ ] Does this test create its own required state?
- [ ] Does this test clean up after itself (or does `beforeEach` handle it)?
- [ ] Would this test pass if run alone (not in suite order)?
- [ ] Does this test avoid depending on `cy.wait()` for state?

## Assertion Completeness

For each user action, assert:
1. **Visual feedback** — element appears/disappears, text changes
2. **State change** — list count changes, form resets, etc.
3. **Persistence** — if the app reloads, does the change persist?

```js
// After adding a contact:
cy.contains(contact.name).should('be.visible')           // 1. Visual
cy.get('.contact-item').should('have.length.gte', 1)    // 2. State
cy.reload()                                              // 3. Persistence
cy.contains(contact.name).should('be.visible')
```

## Naming Conventions

| File | Convention |
|---|---|
| Test files | `[feature]-[scope].cy.js` — e.g. `contact-crud.cy.js` |
| describe blocks | Feature name in Portuguese |
| it blocks | `Deve/Não deve [ação] [condição opcional]` |
| Custom commands | camelCase: `addContact`, `deleteFirstContact` |
| Fixtures | Singular noun: `contact.json`, `invalid-contact.json` |
| Aliases | Descriptive: `@getContacts`, `@createContact` |

## Portfolio Differentiators

Beyond CRUD tests, consider:
- **Accessibility test**: `cy.get('input').should('have.attr', 'aria-label')`
- **Viewport test**: `cy.viewport('iphone-6'); cy.get('.contact-item').should('be.visible')`
- **Performance marker**: measure time between action and DOM update
- **Screenshot on failure**: configure `screenshotOnRunFailure: true` in config
