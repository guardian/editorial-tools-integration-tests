export function debug(message: string) {
  cy.exec(`echo "${message}" >> debug.log`);
}
