// ***********************************************
// Custom Commands — Agenda de Contatos
// ***********************************************

/**
 * Preenche o formulário e adiciona um novo contato via UI.
 * Aguarda o contato aparecer na lista antes de continuar.
 * @param {{ name: string, email: string, phone: string }} contact
 */
Cypress.Commands.add('addContact', (contact) => {
  cy.get('[type="text"]').first().clear().type(contact.name)
  cy.get('[type="email"]').clear().type(contact.email)
  cy.get('[type="tel"]').clear().type(contact.phone)
  cy.get('.adicionar').click()
  cy.contains(contact.name).should('be.visible')
})

/**
 * Exclui o primeiro contato da lista.
 */
Cypress.Commands.add('deleteFirstContact', () => {
  cy.get('.delete').first().click()
})

/**
 * Abre o formulário de edição do primeiro contato e salva as alterações.
 * Somente os campos informados são atualizados.
 * @param {{ name?: string, email?: string, phone?: string }} updates
 */
Cypress.Commands.add('editFirstContact', (updates) => {
  cy.get('.edit').first().click()
  if (updates.name) {
    cy.get('[type="text"]').first().clear().type(updates.name)
  }
  if (updates.email) {
    cy.get('[type="email"]').clear().type(updates.email)
  }
  if (updates.phone) {
    cy.get('[type="tel"]').clear().type(updates.phone)
  }
  cy.get('.alterar, button:contains("Salvar"), button:contains("Alterar"), button[type="submit"]')
    .first()
    .click()
})