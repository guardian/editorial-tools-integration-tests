import { fetchAndSetCookie, setCookie } from '../../utils/networking';
import { checkVars } from "../../utils/vars";
import { expectPreview } from "../../utils/composer/expectPreview";
import { inATemporaryArticle } from "../../utils/composer/inATemporaryArticle";

describe('Composer Noting Tests', () => {
  beforeEach(() => {
    checkVars();
    fetchAndSetCookie(true)
  });

  inATemporaryArticle('Check that flag marks are present in preview',
    function (id) {
      return cy
        .get(".ProseMirror").type(`${id} is a `)
        .get('button[title*="Toggle Flag (F6)"]').click()
        .wait(1000)
        .get(".ProseMirror").type("test article")
        .wait(1000);
    },
    function (id) {
      return cy
          .then(async () => expectPreview(
            id,
            new RegExp(
            `<p>${id} is a <gu-flag class=".*" title="Flag: .*" data-gu-mark="true" data-note-edited-by=".*" data-note-edited-date=".*" data-type="flag" data-note-id=".*">test article<\/gu-flag><\/p>`
            )
          ));
    }
  );

});
