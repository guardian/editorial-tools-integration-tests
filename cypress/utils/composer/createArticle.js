import { getId } from "./getId";
import { startEditing } from "./startEditing";

export function createAndEditArticle(fn) {
    cy
        .get("#js-dashboard-create-dropdown").click()
        .get("#js-dashboard-create-article").click()
        .wait(2000)
        .log("Article created");
}

