import {wait} from "../wait";

export function stopEditingAndClose() {
    cy.get(".js-content-block-close").click();
    // ideally, we would hover over .header__content-type-left--article
    // to make .header__dashboard-link become visible, but Cypress doesn't
    // support that, so force instead.
    cy.get(".header__dashboard-link").click({"force": true});
    return wait(2);
}

