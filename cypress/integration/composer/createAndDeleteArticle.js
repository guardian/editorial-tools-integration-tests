import { setCookie } from "../../utils/networking";
import { checkVars } from "../../utils/vars";
import { createArticle } from "../../utils/composer/createArticle";
import { deleteArticle } from "../../utils/composer/deleteArticle";
import { getId } from "../../utils/composer/getId";
import { startEditing } from "../../utils/composer/startEditing";
import { stopEditingAndClose } from "../../utils/composer/stopEditingAndClose";

describe('Composer Basic Behaviour Tests', () => {
  beforeEach(() => {
    checkVars();
    setCookie(cy);
  });

  it('Create a new article, then get it from the menu and delete it', function () {
    createArticle();
    cy.url().then(url => {
      const id = getId(url);
      startEditing();
      cy.get(".ProseMirror").type("This is a test article");
      stopEditingAndClose();
      deleteArticle(id);
    });
  })
});
