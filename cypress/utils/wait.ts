export function wait(seconds: number) {
  return cy.wait(seconds * 1000);
}
