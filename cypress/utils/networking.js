const { baseUrls } = require('../../cypress.env.json');
const { cookie, domain } = require(`../../cookie.json`);

export function getDomain() {
    const stage=Cypress.env('STAGE');
    const app=Cypress.env('APP');
    const appName=baseUrls[app] || app;
    if (stage === 'prod') {
        return `https://${appName}.gutools.co.uk/`;
    } else {
        return `https://${appName}.${stage}.dev-gutools.co.uk/`;
    }
}

export function setCookie(cy) {
    cy.setCookie('gutoolsAuth-assym', cookie, {
        domain: `.${domain}`,
        path: '/',
        secure: true,
        httpOnly: true,
    });

    cy.visit(getDomain());
    cy.wait(2);

}