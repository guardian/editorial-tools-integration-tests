import { checkVars } from '../../utils/vars';
import { fetchAndSetCookie, getDomain } from '../../utils/networking';
import { deleteAllArticles } from '../../utils/composer/api';
import { createAndEditArticle } from '../../utils/composer/createArticle';
import { getId } from '../../utils/composer/getId';
import { startEditing } from '../../utils/composer/startEditing';
import { stopEditingAndClose } from '../../utils/composer/stopEditingAndClose';
import { deleteArticle } from '../../utils/composer/deleteArticle';

describe('Workflow Integration Tests', () => {
  beforeEach(() => {
    checkVars();
    fetchAndSetCookie({ visitDomain: false });
  });

  after(() => {
    fetchAndSetCookie({ visitDomain: false });
    deleteAllArticles();
  });

  it('Create an article from within Workflow', function () {
    cy.visit(getDomain());

    // Create article
    cy.get('[wf-dropdown-toggle]')
      .contains('Create new')
      .click()
      .get('#testing-dashboard-create-dropdown-Article')
      .click()
      .get('#stub_title')
      .type(`Cypress Integration Testing Article ${Date.now()}`)
      .get('#testing-create-in-composer')
      .click();
  });

  xit('Delete an article from within Workflow', function () {
    cy.visit(getDomain({ app: 'composer' }));
    createAndEditArticle();
    cy.url().then((url) => {
      const id = getId(url, { app: 'composer' });
    });
    cy.pause();
  });
});
