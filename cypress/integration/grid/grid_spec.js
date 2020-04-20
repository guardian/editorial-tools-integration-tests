const date = new Date().toString();
const imageName = "prodmontestimage12345";
const hash = "0e019da30d5c429a98a3e9aabafe689576a6a4ba";

function searchAndClickOnTestImage() {
  cy.get("gr-text-chip > .ng-pristine").type(imageName);
  cy.wait(1);
  cy.get(`a.preview__link[href*="${hash}"]`).click();
  cy.wait(3);
}

describe("Grid Integration Tests", () => {
  beforeEach(() => {
    const { cookie, domain } = require("../../../cookie.json");

    cy.setCookie("gutoolsAuth-assym", cookie, {
      domain: `.${domain}`,
      path: "/",
      secure: true,
      httpOnly: true
    });

    cy.visit(Cypress.env("baseUrl") + "/");
  });

  it("Should be able to add and delete a lease", () => {
    searchAndClickOnTestImage();

    cy.get("#it-add-lease-icon").click();
    wait(2);
    cy.get("#access-select").select("allow-use");
    cy.get(".lease__form > .ng-pristine")
      .clear()
      .type("someNotes");
    cy.get("#it-save-lease").click();
    wait(1);
    cy.get("#it-confirm-delete-lease").click();
    cy.get("#it-confirm-delete-lease").click();
    wait(1);

    // TODO: Add an appropriate assertion here
    cy.url().should("include", "/");
  });

  it("edit the image description, byline, credit and copyright", () => {
    searchAndClickOnTestImage();

    // Edit the description
    cy.get("#it-edit-description-button").click({ force: true });
    cy.get(".editable-has-buttons")
      .clear()
      .type(date);
    cy.get(".editable-buttons > .button-save").click();
    wait(3);

    // Edit the byline
    cy.get("#it-edit-byline-button").click({ force: true });
    cy.get(".editable-has-buttons")
      .clear()
      .type(date);
    cy.get(".editable-buttons > .button-save").click();
    wait(1);

    // Edit the credit
    cy.get("#it-edit-credit-button").click({ force: true });
    cy.get(".editable-has-buttons")
      .clear()
      .type(date);
    cy.get(".editable-buttons > .button-save").click();
    wait(1);

    // Edit the copyright
    cy.get("#it-edit-copyright-button").click({ force: true });
    cy.get(".editable-has-buttons")
      .clear()
      .type(date);
    cy.get(".editable-buttons > .button-save").click();
    wait(1);
  });

  xit("add image to and remove image from a collection", () => {});

  it("add and remove labels from an image", () => {
    searchAndClickOnTestImage();
    cy.get("#it-add-label-button").click();
    cy.get(".text-input")
      .clear()
      .type("someLabelHere");
    cy.get(".gr-add-label__form__buttons__button-save").click();
    wait(1);
    cy.get("#it-remove-label-button").click({ multiple: true });
  });

  it("edit the photoshoot section", () => {
    searchAndClickOnTestImage();

    cy.get('button[id="it-photoshoot-edit-button"]').click({ force: true });
    cy.get(".editable-has-buttons")
      .clear()
      .type(date);
    cy.get(".editable-buttons > .button-save").click();
    cy.get(
      ".top-bar-item > gr-icon-label > .icon-label > ng\\:transclude"
    ).click();
  });

  it("can change the rights", function() {
    searchAndClickOnTestImage();
    cy.get("#it-edit-usage-rights-button").click({ force: true });
    cy.get("#it-rights-select").select("screengrab");
    cy.get(".it-edit-usage-input").type(date);
    cy.get(".ure__bar > .button-save").click();
    wait(3);
  });
});

const wait = seconds => cy.wait(seconds * 1000);
