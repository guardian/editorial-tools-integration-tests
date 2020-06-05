import { setCookie, getDomain } from "../../utils/networking";
import { checkVars } from "../../utils/vars";
import { wait } from "../../utils/wait";
import { createArticle } from "../../utils/composer/createArticle";
import { deleteArticle } from "../../utils/composer/deleteArticle";
import { getId } from "../../utils/composer/getId";
import { getContent } from "../../utils/composer/getContent";
import { startEditing } from "../../utils/composer/startEditing";
import { stopEditingAndClose } from "../../utils/composer/stopEditingAndClose";

describe('Composer Noting Tests', () => {
  beforeEach(() => {
    checkVars();
    setCookie(cy);
  });

  it('Create a new article, add a correct tag, check it, and delete it', function () {
    createArticle();
    cy.url().then(async url => {
      const id = getId(url);
      startEditing();

      cy.get(".ProseMirror").type("This is a ");
      cy.get('button[title*="Correct (F7)"]').click();
      wait(1);
      cy.get(".ProseMirror").type("test article");
      wait(1);

      stopEditingAndClose().then(async () => {
        const url = `${getDomain()}api/content/${id}/preview`;
        const data = await getContent(url);
        expect(data, "the data").to.not.be.null;
        const content1 = JSON.parse(data);
        expect(content1, "the json content").to.not.be.undefined;
        const content2 = content1.data;
        expect(content2, "the first data").to.not.be.undefined;
        const content3 = content2.blocks;
        expect(content3, "the blocks").to.not.be.undefined;
        const content4 = content3.data;
        expect(content4, "the second data").to.not.be.undefined;
        const content5 = content4[0];
        expect(content5, "the first data element").to.not.be.undefined;
        const content6 = content5.data;
        expect(content6, "the third data").to.not.be.undefined;
        const content7 = content6.elements;
        expect(content7, "the elements").to.not.be.undefined;
        const content8 = content7[0];
        expect(content8, "the first element").to.not.be.undefined;
        const content9 = content8.fields;
        expect(content9, "the fields").to.not.be.undefined;
        const content10 = content9.text;
        expect(content10, "the text").to.not.be.undefined;
        expect(content10, "the text").to.match(
            /<p>This is a <gu-correct class=".*" title="Correct: .*" data-gu-mark="true" data-note-edited-by=".*" data-note-edited-date=".*" data-type="correct" data-note-id=".*">test article<\/gu-correct><\/p>/
        );
      });
      // Go ahead and delete the article
      deleteArticle(id);
    });
  })
});
