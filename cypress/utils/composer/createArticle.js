import {wait} from "../wait";

export function createArticle() {
    cy.get("#js-dashboard-create-dropdown").click();
    cy.get("#js-dashboard-create-article").click();
    wait(2);
}

