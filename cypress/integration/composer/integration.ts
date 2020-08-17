import { checkVars } from '../../utils/vars';
import { fetchAndSetCookie } from '../../utils/networking';
import { inATemporaryArticle } from '../../utils/composer/inATemporaryArticle';
import { expectPreview } from '../../utils/composer/expectPreview';
import { deleteAllArticles } from '../../utils/composer/api';

describe('Composer Integration Tests', () => {
  beforeEach(() => {
    checkVars();
    fetchAndSetCookie({ visitDomain: false });
  });

  after(() => {
    deleteAllArticles();
  });

  describe('Composer Basic Behaviour Tests', () => {
    inATemporaryArticle('Do nothing but create and delete');
  });

  describe('Composer Noting Tests', () => {
    inATemporaryArticle(
      'Check that correct marks are present in preview',
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
        expectPreview(
          id,
          new RegExp(
            `<p>${id} is a <gu-correct class=".*" title="Correct: .*" data-gu-mark="true" data-note-edited-by=".*" data-note-edited-date=".*" data-type="correct" data-note-id=".*">test article<\/gu-correct><\/p>`
          )
        );
      }
    );
  });

  describe('Composer Noting Tests', () => {
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
        expectPreview(
          id,
          new RegExp(
            `<p>${id} is a <gu-correct class=".*" title="Correct: .*" data-gu-mark="true" data-note-edited-by=".*" data-note-edited-date=".*" data-type="correct" data-note-id=".*">test article<\/gu-correct><\/p>`
          )
        );
      }
    );
  });

  describe('Composer Noting Tests', () => {
    inATemporaryArticle(
      'Check that flag marks are present in preview',
      function (id) {
        return cy
          .get('.ProseMirror')
          .type(`${id} is a `)
          .get('button[title*="Toggle Flag (F6)"]')
          .click()
          .wait(1000)
          .get('.ProseMirror')
          .type('test article')
          .wait(1000);
      },
      function (id) {
        expectPreview(
          id,
          new RegExp(
            `<p>${id} is a <gu-flag class=".*" title="Flag: .*" data-gu-mark="true" data-note-edited-by=".*" data-note-edited-date=".*" data-type="flag" data-note-id=".*">test article<\/gu-flag><\/p>`
          )
        );
      }
    );
  });
});
