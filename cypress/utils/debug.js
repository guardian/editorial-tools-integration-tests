export function debug(message) { cy.exec(`echo "${message}" >> debug.log`); }
