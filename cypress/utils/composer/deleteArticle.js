import {wait} from "../wait";
import {getDomain} from "../networking";

export function deleteArticle(id) {
    cy.get(`a[href*="/content/${id}"]`).click();
    wait(2);

    cy.get('#js-management-edit').click();
    cy.get('#js-content-information-delete').click({"force": true});
    cy.get('#js-content-information-delete').click({"force": true});
    wait(2);
    cy.url().should('equal', `${getDomain()}`);
}

