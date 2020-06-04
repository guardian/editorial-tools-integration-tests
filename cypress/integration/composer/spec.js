import {setCookie, getDomain } from "../../utils/networking";
import {checkVars} from "../../utils/vars";
import {wait} from "../../utils/wait";
import {debug} from "../../utils/debug";

describe('Composer Integration Tests', () => {
  beforeEach(() => {
    checkVars();
    setCookie(cy);
  });

  it('Create a new article, then get it from the menu and delete it', function () {
    cy.get("#js-dashboard-create-dropdown").click();
    cy.get("#js-dashboard-create-article").click();
    wait(2);
    cy.url().then(url => {
      cy.log(url);
      debug(url);
      const id = url.split('/')[4];
      debug(id);
      cy.url().should('contain', `${getDomain()}content/`);
      cy.get(".ProseMirror").click();
      cy.get(".ProseMirror").type("This is a test article");
      cy.get(".js-content-block-close").click();
      // ideally, we would hover over .header__content-type-left--article
      // to make .header__dashboard-link become visible, but Cypress doesn't
      // support that, so force instead.
      cy.get(".header__dashboard-link").click({"force": true});
      cy.get(`a[href*="/content/${id}"]`).click();
      wait(2);
      cy.get('#js-management-edit').click();
      cy.get('#js-content-information-delete').click({"force": true});
      cy.get('#js-content-information-delete').click({"force": true});
      wait(2);
      cy.url().should('equal', `${getDomain()}`);
    });
  })
});
