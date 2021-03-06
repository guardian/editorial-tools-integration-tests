import { createAndEditArticle } from './createArticle';
import { stopEditingAndClose } from './stopEditingAndClose';
import { deleteArticle } from './deleteArticle';
import { getId } from './getId';
import { startEditing } from './startEditing';
import { apps } from '../values';

type fnArg = (id: string) => void;

export function inATemporaryArticle(
  title: string,
  editFn: fnArg = (id) => cy.log('Typed nothing'),
  assertFn: fnArg = (id) => cy.log(`Checked nothing for id ${id}`)
) {
  it(`(In a temporary article) ${title}`, () => {
    createAndEditArticle();
    cy.url().then((url) => {
      const id = getId(url, { app: apps.composer });
      startEditing();
      cy.log('Article id is ', id);
      editFn(id);
      stopEditingAndClose();
      cy.log('Closed the article');
      assertFn(id);
      // Go ahead and delete the article
      deleteArticle(id, { app: apps.composer });
    });
  });
}
