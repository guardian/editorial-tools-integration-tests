import {setCookie, getDomain } from "../../utils/networking";
import {checkVars} from "../../utils/vars";
import {wait} from "../../utils/wait";
// import {debug} from "../../utils/debug";

const https = require('https');

function getContent(url) {
  return new Promise(function(resolve, reject) {
    https.get(url, (resp) => {
      let data = '';

      // A chunk of data has been received, add it.
      resp.on('data', (chunk) => {data += chunk;});

      // The whole response has been received. Print out the result.
      resp.on('end', () => {
        // console.log(JSON.parse(data).explanation);
        resolve(data);

      });
    });
  });
}

describe('Composer Noting Tests', () => {
  beforeEach(() => {
    checkVars();
    setCookie(cy);
  });

  it('Create a new article, add a correct tag, check it, and delete it', function () {
    cy.get("#js-dashboard-create-dropdown").click();
    cy.get("#js-dashboard-create-article").click();
    wait(2);
    cy.url().then(async url => {
      cy.log(url);
      // debug(url);
      const id = url.split('/')[4];
      // debug(id);
      cy.url().should('contain', `${getDomain()}content/`);
      wait(1);
      cy.get(".ProseMirror").click();
      wait(1);
      cy.get(".ProseMirror").type("This is a ");

      cy.get('button[title*="Correct (F7)"]').click();
      wait(1);

      cy.get(".ProseMirror").type("test article");
      wait(1);

      cy.get(".js-content-block-close").click();
      // ideally, we would hover over .header__content-type-left--article
      // to make .header__dashboard-link become visible, but Cypress doesn't
      // support that, so force instead.
      cy.get(".header__dashboard-link").click({"force": true}).then(async () => {
        wait(2);
        const data = await getContent(`${getDomain()}api/content/${id}/preview`);
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
        const content6 = content5.data;     // .elements;// [0].fields.text
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
      cy.get(`a[href*="/content/${id}"]`).click();
      wait(2);

      cy.get('#js-management-edit').click();
      cy.get('#js-content-information-delete').click({"force": true});
      cy.get('#js-content-information-delete').click({"force": true});
      wait(2);
      cy.url().should('equal', `${getDomain()}`);
    });
  })
});
