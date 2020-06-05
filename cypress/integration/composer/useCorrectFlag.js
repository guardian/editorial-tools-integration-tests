import { setCookie } from "../../utils/networking";
import { checkVars } from "../../utils/vars";
import { expectPreview } from "../../utils/composer/expectPreview";
import { inATemporaryArticle } from "../../utils/composer/inATemporaryArticle";

describe('Composer Noting Tests', () => {
  beforeEach(() => {
    checkVars();
    setCookie(cy);
  });

  inATemporaryArticle('Check that correct flags are present in preview',
    async function (id) {
      cy
          .get(".ProseMirror").type(`${id} is a `)
          ;cy.get('button[title*="Correct (F7)"]').click()
      ;cy.wait(1000)
      ;cy.get(".ProseMirror").type("test article")
      ;return cy.wait(1000);
    },
    async function (id) {
      await expectPreview(
          id,
          /<p>${id} is a <gu-correct class=".*" title="Correct: .*" data-gu-mark="true" data-note-edited-by=".*" data-note-edited-date=".*" data-type="correct" data-note-id=".*">test article<\/gu-correct><\/p>/
      );
    }
  );

});
