/// <reference types="cypress" />

/**
 * Feature: Gerenciamento de Contatos — CRUD completo
 * App: Agenda de Contatos (https://ebac-agenda-contatos-tan.vercel.app/)
 *
 * Estratégia de isolamento:
 * - cy.intercept() mocka completamente a API (https://api-ebac.vercel.app/api/contatos)
 * - Testes são 100% determinísticos — sem dependência do servidor compartilhado
 * - Fixtures simulam as respostas reais da API para GET, POST, PUT e DELETE
 * - Cada contexto configura o estado inicial que precisa via intercept do GET
 *
 * Cobertura:
 * ✅ Adicionar: happy path, múltiplos contatos, campos vazios, e-mail inválido
 * ✅ Editar: nome (verifica dado antigo removido), e-mail (verifica payload enviado)
 * ✅ Excluir: remoção individual, lista vazia após exclusão
 * ✅ Responsividade: formulário e fluxo de adição em mobile (375×667)
 *
 * Nota aos revisores:
 * Os seletores .edit, .delete, .adicionar refletem as classes CSS do app em produção.
 * Para maior robustez, recomenda-se adicionar atributos data-testid à aplicação.
 */

const API = '**/api/contatos'
// Regex para interceptar endpoints de item (/api/contatos/:id) — PUT e DELETE
const API_ITEM_RE = /api-ebac\.vercel\.app\/api\/contatos/

// O app envia o body como JSON serializado em string; este helper normaliza os dois casos
const parseBody = (request) =>
  typeof request.body === 'string' ? JSON.parse(request.body) : request.body

describe('Gerenciamento de Contatos', () => {
  // ─── ADICIONAR CONTATO ────────────────────────────────────────────────────

  context('Adicionar contato', () => {
    beforeEach(() => {
      cy.intercept('GET', API, { fixture: 'api-contacts-empty.json' }).as('getContacts')
      cy.visit('/')
      cy.wait('@getContacts')
    })

    it('Deve adicionar um contato com dados válidos e exibi-lo na lista', () => {
      cy.fixture('contact').then((contact) => {
        cy.intercept('POST', API, { fixture: 'api-contact-created.json' }).as('createContact')

        cy.get('[type="text"]').first().type(contact.name)
        cy.get('[type="email"]').type(contact.email)
        cy.get('[type="tel"]').type(contact.phone)
        cy.get('.adicionar').click()

        // Verifica payload enviado à API — app envia { contato: { name, email, phone } }
        cy.wait('@createContact').then(({ request }) => {
          expect(parseBody(request).contato).to.include({ name: contact.name, email: contact.email })
        })

        cy.contains(contact.name).should('be.visible')
        cy.contains(contact.email).should('be.visible')
        cy.get('.edit').should('have.length', 1)
      })
    })

    it('Deve adicionar múltiplos contatos e exibir todos na lista', () => {
      cy.fixture('contact').then((contact) => {
        // Primeiro contato
        cy.intercept('POST', API, { fixture: 'api-contact-created.json' }).as('createFirst')
        cy.get('[type="text"]').first().type(contact.name)
        cy.get('[type="email"]').type(contact.email)
        cy.get('[type="tel"]').type(contact.phone)
        cy.get('.adicionar').click()
        cy.wait('@createFirst').then(({ request }) => {
          expect(parseBody(request).contato).to.include({ name: contact.name })
        })
        cy.contains(contact.name).should('be.visible')

        // Segundo contato
        cy.intercept('POST', API, { fixture: 'api-contact-created-2.json' }).as('createSecond')
        cy.get('[type="text"]').first().clear().type('Maria Souza')
        cy.get('[type="email"]').clear().type('maria@teste.com')
        cy.get('[type="tel"]').clear().type('21 888888888')
        cy.get('.adicionar').click()
        cy.wait('@createSecond').then(({ request }) => {
          expect(parseBody(request).contato).to.include({ name: 'Maria Souza' })
        })

        cy.contains(contact.name).should('be.visible')
        cy.contains('Maria Souza').should('be.visible')
        cy.get('.edit').should('have.length', 2)
      })
    })

    it('Não deve adicionar contato quando os campos obrigatórios estão vazios', () => {
      cy.get('.adicionar').click()
      cy.get('.edit').should('not.exist')
    })

    it('Não deve adicionar contato com e-mail em formato inválido', () => {
      cy.fixture('invalid-contact').then((invalid) => {
        cy.get('[type="text"]').first().type('Teste Inválido')
        cy.get('[type="email"]').type(invalid.email)
        cy.get('[type="tel"]').type('11 999999999')
        cy.get('.adicionar').click()
        cy.get('.edit').should('not.exist')
      })
    })
  })

  // ─── EDITAR CONTATO ───────────────────────────────────────────────────────

  context('Editar contato', () => {
    beforeEach(() => {
      // Carrega a lista já com 1 contato — sem necessidade de criar via UI
      cy.intercept('GET', API, { fixture: 'api-contacts-one.json' }).as('getContacts')
      cy.visit('/')
      cy.wait('@getContacts')
      // Garante estado inicial correto antes de cada teste de edição
      cy.get('.edit').should('have.length', 1)
    })

    it('Deve editar o nome de um contato e refletir a mudança na lista', () => {
      cy.intercept('PUT', API_ITEM_RE, { fixture: 'api-contact-edited-name.json' }).as('editContact')

      cy.get('.edit').first().click()
      cy.get('[type="text"]').first().clear().type('Vinicius Editado')
      cy.get('.alterar, button:contains("Salvar"), button:contains("Alterar"), button[type="submit"]')
        .first()
        .click()

      // Verifica payload enviado e resultado na UI
      cy.wait('@editContact').then(({ request }) => {
        expect(parseBody(request).contato).to.include({ name: 'Vinicius Editado' })
      })

      cy.contains('Vinicius Editado').should('be.visible')
      cy.contains('Vinicius Silva').should('not.exist') // dado antigo deve desaparecer
    })

    it('Deve editar o e-mail de um contato e refletir a mudança na lista', () => {
      cy.intercept('PUT', API_ITEM_RE, { fixture: 'api-contact-edited-email.json' }).as('editContact')

      cy.get('.edit').first().click()
      cy.get('[type="email"]').first().clear().type('editado@teste.com')
      cy.get('.alterar, button:contains("Salvar"), button:contains("Alterar"), button[type="submit"]')
        .first()
        .click()

      cy.wait('@editContact').then(({ request }) => {
        expect(parseBody(request).contato).to.include({ email: 'editado@teste.com' })
      })

      cy.contains('editado@teste.com').should('be.visible')
    })
  })

  // ─── EXCLUIR CONTATO ──────────────────────────────────────────────────────

  context('Excluir contato', () => {
    beforeEach(() => {
      cy.intercept('GET', API, { fixture: 'api-contacts-one.json' }).as('getContacts')
      // Intercept centralizado — todos os testes de exclusão partilham esta configuração
      cy.intercept('DELETE', API_ITEM_RE, { body: { data: [] } }).as('deleteContact')
      cy.visit('/')
      cy.wait('@getContacts')
      cy.get('.edit').should('have.length', 1)
    })

    it('Deve excluir um contato e removê-lo da lista', () => {
      cy.fixture('contact').then((contact) => {
        cy.get('.delete').first().click()
        cy.wait('@deleteContact')
        cy.contains(contact.name).should('not.exist')
      })
    })

    it('A lista deve ficar vazia após excluir o único contato', () => {
      cy.get('.delete').first().click()
      cy.wait('@deleteContact')
      cy.get('.edit').should('not.exist')
      cy.get('.delete').should('not.exist')
    })
  })

  // ─── RESPONSIVIDADE ───────────────────────────────────────────────────────

  context('Responsividade (mobile)', () => {
    beforeEach(() => {
      // Viewport definido ANTES do visit — garante render inicial em mobile
      cy.viewport(375, 667)
      cy.intercept('GET', API, { fixture: 'api-contacts-empty.json' }).as('getContacts')
      cy.visit('/')
      cy.wait('@getContacts')
    })

    it('Deve exibir o formulário corretamente em mobile (375×667)', () => {
      cy.get('[type="text"]').should('be.visible')
      cy.get('[type="email"]').should('be.visible')
      cy.get('[type="tel"]').should('be.visible')
      cy.get('.adicionar').should('be.visible')
    })

    it('Deve permitir adicionar um contato em viewport mobile', () => {
      cy.fixture('contact').then((contact) => {
        cy.intercept('POST', API, { fixture: 'api-contact-created.json' }).as('createContact')
        cy.get('[type="text"]').first().type(contact.name)
        cy.get('[type="email"]').type(contact.email)
        cy.get('[type="tel"]').type(contact.phone)
        cy.get('.adicionar').click()
        cy.wait('@createContact')
        cy.contains(contact.name).should('be.visible')
      })
    })
  })
})