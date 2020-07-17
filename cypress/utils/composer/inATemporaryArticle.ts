import {createAndEditArticle} from "./createArticle";
import {stopEditingAndClose} from "./stopEditingAndClose";
import {deleteArticle} from "./deleteArticle";
import {getId} from "./getId";
import {startEditing} from "./startEditing";

export function inATemporaryArticle(
    title,
    editFn = (id) => {return cy.log("Typed nothing")},
    assertFn = (id) => {return cy.log(`Checked nothing for id ${id}`)}
) {
    it(`(In a temporary article) ${title}`,  () => {
        cy
            .then(() => createAndEditArticle())
            .url()
            .then( (url) => {
                const id = getId(url);
                startEditing()
                    .log("Article id is ", id)
                    .then(() => editFn(id))
                    .then(() => {
                        stopEditingAndClose()
                            .log("Closed the article")
                            .then(() =>
                                assertFn(id)
                                    // Go ahead and delete the article
                                    .then(() => deleteArticle(id))
                            )
                    })
            })
    })
}

