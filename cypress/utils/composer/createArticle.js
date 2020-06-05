import {wait} from "../wait";
import {getId} from "./getId";
import {startEditing} from "./startEditing";

export function createArticle(fn) {
    cy.get("#js-dashboard-create-dropdown").click();
    cy.get("#js-dashboard-create-article").click();
    wait(2);
    cy.url().then(fn);
}

export function createAndEditArticle(fn) {
    cy.get("#js-dashboard-create-dropdown").click();
    cy.get("#js-dashboard-create-article").click();
    wait(2);
    cy.url().then(async url => {
        const id = getId(url);
        startEditing();
        fn(id)
    });
}

