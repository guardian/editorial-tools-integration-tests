import { getDomain } from '../networking';
import { defaultQueryString } from '../../integration/workflow/integration';
import { APPS } from '../values';

export const visitWorkflow = (params = '') => {
  const waitAlias =
    '@content' +
    (params === `/dashboard${defaultQueryString}` ? 'WithDefaultQuery' : '');

  cy.visit(getDomain({ app: APPS.workflow }) + params)
    .wait(waitAlias)
    .get('.wf-loader', { timeout: 30000 })
    .should('not.exist');
};

export function createArticle(title: string) {
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

export function searchFor(query: string) {
  cy.get('#testing-dashboard-toolbar-section-search').type(query + '{enter}');
}

export function clickOnArticle(title: string) {
  cy.wait('@searchForText')
    .wait(2000)
    .get('#testing-content-list-item-title-anchor-text')
    .contains(title)
    .should('exist')
    .parent()
    .click();
}

export function toggleToolbarDropdown(dropdown: string) {
  cy.get('[ui-view=view-toolbar]').contains(dropdown).click();
}

export function assertStatusInManagementTab(status: string) {
  cy.get('[data-cy=management-drawer]')
    .click()
    .get('.drawer__item')
    .contains('Status')
    .parent()
    .find('select')
    // Assert status is Desk
    .should('have.value', `string:${status}`);
}

export function clearSearch() {
  cy.get('#testing-dashboard-toolbar-section-search').clear().type('{enter}');
}
