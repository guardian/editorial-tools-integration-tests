import { setCookie } from "../../utils/networking";
import { checkVars } from "../../utils/vars";
import { createAndEditArticle } from "../../utils/composer/createArticle";
import { deleteArticle } from "../../utils/composer/deleteArticle";
import { stopEditingAndClose } from "../../utils/composer/stopEditingAndClose";

describe('Composer Basic Behaviour Tests', () => {
  beforeEach(() => {
    checkVars();
    setCookie(cy);
  });

  it('Create a new article, then get it from the menu and delete it', function () {
    createAndEditArticle(id => {
      cy.get(".ProseMirror").type("This is a test article");
      stopEditingAndClose( () => deleteArticle(id));
    });
  })
});
