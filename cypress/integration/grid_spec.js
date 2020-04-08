const cookie = {
  name: "gutoolsAuth-assym",
  value:
    "Zmlyc3ROYW1lPVN0ZXBoZW4mbGFzdE5hbWU9R2VsbGVyJmVtYWlsPXN0ZXBoZW4uZ2VsbGVyQGd1YXJkaWFuLmNvLnVrJmF2YXRhclVybD1odHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS0vQU9oMTRHaDctTUd5RTlrVklYMzlrYmQzSmJNa2ZxOVA0OHBNLWJGVGhHcW0mc3lzdGVtPXByb2Rtb24mYXV0aGVkSW49cHJvZG1vbixtZWRpYS1zZXJ2aWNlJmV4cGlyZXM9MTU4NTkyMjgzOTAwMCZtdWx0aWZhY3Rvcj10cnVl.WaCPxMIvenYxe0AA1hYUAqb1R0HBdlb1gO7AvdA/bEg/qaFSpyTbXYhlvapiet0FozuRd7hK/opAkO71zfXzpHnlJnQs6+jZQnHc72dN4f7/WzbZ/vdFTxoT1NwHvCaujK7sLFgtzmBXEIFPVCav+mkNAmb13i+omhXcSnZgYyH6/UfMmdXeJMYvIkD9MP7q5Vvwe63f05Ok0WTTvHkwRadQ/pCjP7SUzbaZdHAfCgjpKpA/yGTDVeZtBLLp/im+1wjcZCGFvZidpmHqCSqk80C1QoCwQ8IWfSCO72sEqwiwyJLNZNLABApdzZgwiiwuyojOC7tqirU4cIEh5K5kxCWFL+mdtKz38BUQzUqAavm750Y+uYU15xKIu49YU2eU87B0Z3IujsA4fQZdheVhS6qFtCpbEfZzl4Ot+MXzWUTUf+JgD22adXeOAGqFqlI8ZujyFS4xCXeDECiaKcJ/VfyiLGCvFtwCH4gMdcF1a+caQb2UhxJyfieIaMDaJid8tVgS3mbGUw4uKmG7F3nDF2zju6hVKhCPddErTAz2zwRLqbLpoLVOmlEsmd9S0sivosgjcjKVJsy1/1mIa2KT4k3Tl6fFDs3jvd6qgzveBPmljJnyQyqPhxrScfEFbmI+y5bfmuon/kRbmskeV+BgYWb8DqELGBKO8gWldQWoQk8="
};

describe("Grid Integration Tests", function() {
  beforeEach(() => {
    cy.setCookie(cookie.name, cookie.value, {
      domain: ".local.dev-gutools.co.uk",
      path: "/",
      secure: true,
      httpOnly: true
    });
  });

  xit("should test", function() {
    cy.visit("https://example.cypress.io");
    expect(true).to.equal(true);
  });

  it("Can reach the website", function() {
    cy.visit("/");
    const placeholder = "Search for images... (type + for advanced search)";
    const imageName = "production monitoring test image DO NOT USE";

    cy.get(`[placeholder="${placeholder}"]`).type(imageName);
    wait(1);

    cy.get(`[alt="${imageName}"]`).click();
    wait(0.5);
    cy.get("gr-leases > .titip-default > gr-icon > .gr-icon").click();
    cy.get("#access-select").select("allow-use");
    cy.get(".lease__form > .ng-pristine")
      .clear()
      .type("someNotes");
    cy.get(
      ".lease__form__buttons__button-save > gr-icon-label > gr-icon > .gr-icon"
    ).click();
    wait(2);
    cy.get("#it-confirm-delete-lease").click();
    wait(1);
    cy.get("#it-confirm-delete-lease").click();
    wait(1);

    cy.get('button[id="it-photoshoot-edit-button"]').click({ force: true });
    cy.get(".editable-has-buttons")
      .clear()
      .type("someChange");
    cy.get(".editable-buttons > .button-save").click();
    cy.get(
      ".top-bar-item > gr-icon-label > .icon-label > ng\\:transclude"
    ).click();
    cy.url().should("include", "/");
  });
});

const wait = seconds => cy.wait(seconds * 1000);
