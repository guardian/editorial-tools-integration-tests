const cookie = require("../../cookie.json");

const date = new Date().toString();
const placeholder = "Search for images... (type + for advanced search)";
const imageName = "production monitoring test image DO NOT USE";

function searchAndClickOnTestImage() {
  cy.get(`[placeholder="${placeholder}"]`).type(imageName);
  cy.wait(1);
  cy.get(`[alt="${imageName}"]`).click();
  cy.wait(1);
}

describe("Grid Integration Tests", () => {
  beforeEach(() => {
    cy.setCookie(cookie.name, cookie.value, {
      domain: ".local.dev-gutools.co.uk",
      path: "/",
      secure: true,
      httpOnly: true
    });

    cy.visit("/");
  });

  it("Should be able to add and delete a lease", () => {
    searchAndClickOnTestImage();

    cy.get("#it-add-lease-icon").click();
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

  it("should be able to edit the image description, byline, credit and copyright", () => {
    searchAndClickOnTestImage();

    // Edit the image description with the current date
    cy.get("#it-edit-description").click({ force: true });
    cy.get(".editable-has-buttons")
      .clear()
      .type(date);
    cy.get(".editable-buttons > .button-save").click();
    wait(1);

    // Put it back to normal
    cy.get("#it-edit-description").click({ force: true });
    cy.get(".editable-has-buttons")
      .clear()
      .type(imageName);
    cy.get(".editable-buttons > .button-save").click();
    wait(1);

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

  xit("should be able to add image to and remove image from a collection", () => {});

  it("should be able to add and remove labels from an image", () => {
    searchAndClickOnTestImage();
    cy.get("#it-add-label-button").click();
    cy.get(".text-input")
      .clear()
      .type("someLabelHere");
    cy.get(".gr-add-label__form__buttons__button-save").click();
    wait(1);
    cy.get("#it-remove-label-button").click({ multiple: true });
    cy.pause();
  });

  it("should edit the photoshoot section", () => {
    cy.get(`[placeholder="${placeholder}"]`).type(imageName);
    cy.get(`[alt="${imageName}"]`).click();

    cy.get('button[id="it-photoshoot-edit-button"]').click({ force: true });
    cy.get(".editable-has-buttons")
      .clear()
      .type(date);
    cy.get(".editable-buttons > .button-save").click();
    cy.get(
      ".top-bar-item > gr-icon-label > .icon-label > ng\\:transclude"
    ).click();
  });
});

const wait = seconds => cy.wait(seconds * 1000);
