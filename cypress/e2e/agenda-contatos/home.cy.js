/// <reference types="cypress" />

    describe ('Teste de inclusão de contato', () => {
        beforeEach(() => {
            cy.visit('https://ebac-agenda-contatos-tan.vercel.app/');
            })
        it('Deve incluir um novo contato', () => {
            cy.get('[type="text"]').type('Vinicius Silva')
            cy.wait(2000)
            cy.get('[type="email"]').type('viniciussilva@teste.com')
            cy.wait(2000)
            cy.get('[type="tel"]').type('11 999999999')
            cy.wait(2000)
            cy.get('.adicionar').click()
            cy.wait(4000)
            cy.screenshot('Deve incluir um novo contato')
        });
        it('Deve editar um contato', () => {
            cy.wait(4000)
            cy.get('.edit').first().click()
            cy.wait(2000)
            cy.get('[type="text"]').clear().type('Editado - Vinicius Silva')
            cy.wait(2000)
            cy.get('[type="email"]').clear().type('editado-viniciussilva@teste.com')
            cy.wait(2000)
            cy.get('[type="tel"]').clear().type('21 666666666')
            cy.wait(2000)
            cy.get('.alterar, button:contains("Salvar"), button:contains("Alterar"), button[type="submit"]')
            .first()
            .click()
            cy.contains('Editado - Vinicius Silva').should('be.visible')
            cy.wait(4000)
            cy.screenshot('Deve editar um contato')
        });
            it('Deve apagar um contato', () => {
            cy.wait(6000)
            cy.get('.delete').first().click()
            cy.contains('Editado - Vinicius Silva').should('not.exist')
            cy.screenshot('Deve apagar um contato')
        })
    });