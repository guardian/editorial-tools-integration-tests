import { fetchAndSetCookie } from '../../utils/networking';
import { checkVars } from '../../utils/vars';
import { expectPreview } from '../../utils/composer/expectPreview';
import { inATemporaryArticle } from '../../utils/composer/inATemporaryArticle';

describe('Composer Noting Tests', () => {
  beforeEach(() => {
    checkVars();
    fetchAndSetCookie({ visitDomain: true });
  });

  inATemporaryArticle(
    'Check that correct flags are present in preview',
    function (id) {
      return cy
        .get('.ProseMirror')
        .type(`${id} is a `)
        .get('button[title*="Correct (F7)"]')
        .click()
        .wait(1000)
        .get('.ProseMirror')
        .type('test article')
        .wait(1000);
    },
    function (id) {
      return cy.then(async () =>
        expectPreview(
          id,
          new RegExp(
            `<p>${id} is a <gu-correct class=".*" title="Correct: .*" data-gu-mark="true" data-note-edited-by=".*" data-note-edited-date=".*" data-type="correct" data-note-id=".*">test article<\/gu-correct><\/p>`
          )
        )
      );
    }
  );
});