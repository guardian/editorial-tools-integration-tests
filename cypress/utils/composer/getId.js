import {getDomain} from "../networking";
import {wait} from "../wait";

export function getId(url) {
    const id = url.split('/')[4];
    // debug(id);
    cy.url().should('contain', `${getDomain()}content/`);
    wait(1);
    return id;
}

