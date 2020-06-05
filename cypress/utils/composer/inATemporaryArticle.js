import { createAndEditArticle } from './createArticle';
import { stopEditingAndClose } from './stopEditingAndClose';
import { deleteArticle } from './deleteArticle';

export function inATemporaryArticle(title, editFn, assertFn) {
  it(`(In a temporary article) ${title}`, async () => {
    const id = await createAndEditArticle();
    console.log('Article id is ', id);
    editFn(id);

    stopEditingAndClose();
    await assertFn(id);
    // Go ahead and delete the article
    await deleteArticle(id);
  });
}
