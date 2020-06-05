import {createAndEditArticle} from "./createArticle";
import {stopEditingAndClose} from "./stopEditingAndClose";
import {deleteArticle} from "./deleteArticle";

export function inATemporaryArticle(title, editFn, assertFn) {
    it(`(In a temporary article) ${title}`, async () => {
        await createAndEditArticle(async (id) => {
            cy.log("Article id is ", id);
            await editFn(id);

            stopEditingAndClose(id, async (id) => {
                await assertFn(id);

                // Go ahead and delete the article
                await deleteArticle(id);
            })
        })
    })
}

