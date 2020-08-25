import { getDomain } from '../networking';

export const visitWorkflow = () => {
  cy.visit(getDomain({ app: 'workflow' }))
    .wait('@content')
    .get('.wf-loader', { timeout: 30000 })
    .should('not.exist');
};

export function createArticleInWorkflow(title) {
  cy.get('[wf-dropdown-toggle]').contains('Create new').click();
  cy.get('#testing-dashboard-create-dropdown-Article').click();
  cy.get('#stub_title').type(title);
  cy.get('#stub_section').select('Training');
  cy.get('#testing-create-in-composer').click();
  cy.get('.modal-dialog')
    .contains('Completed successfully!')
    .should('be.visible')
    .get('.alert-danger')
    .should('not.be.visible')
    .get('.close')
    .click()
    .wait('@stubs');
}

export function searchInWorkflow(query: string) {
  cy.get('#testing-dashboard-toolbar-section-search').type(query + '{enter}');
}

export function clickOnArticle(title: string) {
  cy.wait('@searchForArticle')
    .wait(2000)
    .get('#testing-content-list-item-title-anchor-text')
    .contains(title)
    .should('exist')
    .parent()
    .click();
}
