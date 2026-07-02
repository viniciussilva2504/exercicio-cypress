/// <reference types="cypress" />

/**
 * TEMPLATE: Professional Cypress E2E Test File
 * Feature: Contact Management (Add / Edit / Delete)
 * App: https://ebac-agenda-contatos-tan.vercel.app/
 *
 * This template demonstrates portfolio-ready patterns:
 * - Fixture-based test data
 * - Custom commands (addContact)
 * - No hardcoded cy.wait()
 * - Independent tests with beforeEach setup
 * - Deep assertions (visual + state + persistence)
 * - Descriptive test names in Portuguese (consistent with project)
 */

describe('Gerenciamento de Contatos', () => {
  let contact

  beforeEach(() => {
    cy.fixture('contact').then((data) => {
      contact = data
    })
    cy.visit('/')
  })

  // ─── ADICIONAR CONTATO ───────────────────────────────────────────────────────

  context('Adicionar contato', () => {
    it('Deve adicionar um contato com dados válidos', () => {
      // Arrange — data comes from fixture
      // Act
      cy.addContact(contact)
      // Assert — visual, state
      cy.contains(contact.name).should('be.visible')
      cy.get('.contact-item').its('length').should('be.gte', 1)
    })

    it('Não deve adicionar contato com campos obrigatórios vazios', () => {
      cy.get('.adicionar').click()
      cy.get('.contact-item').should('have.length', 0)
      // or assert validation message if app provides one
    })
  })

  // ─── EDITAR CONTATO ──────────────────────────────────────────────────────────

  context('Editar contato', () => {
    beforeEach(() => {
      // Each edit test sets up its own contact to edit
      cy.addContact(contact)
    })

    it('Deve editar o nome de um contato existente', () => {
      cy.get('.edit').first().click()
      cy.get('[type="text"]').clear().type('Nome Editado')
      cy.get('.alterar, button:contains("Salvar"), button[type="submit"]').first().click()
      cy.contains('Nome Editado').should('be.visible')
      cy.contains(contact.name).should('not.exist')
    })

    it('Deve cancelar a edição e manter os dados originais', () => {
      cy.get('.edit').first().click()
      cy.get('[type="text"]').clear().type('Nome que não deve ser salvo')
      cy.get('button:contains("Cancelar"), .cancelar').first().click()
      cy.contains(contact.name).should('be.visible')
    })
  })

  // ─── EXCLUIR CONTATO ─────────────────────────────────────────────────────────

  context('Excluir contato', () => {
    beforeEach(() => {
      cy.addContact(contact)
    })

    it('Deve excluir um contato e removê-lo da lista', () => {
      cy.get('.delete').first().click()
      cy.contains(contact.name).should('not.exist')
    })
  })
})
