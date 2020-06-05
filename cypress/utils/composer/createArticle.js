import { getId } from "./getId";
import { startEditing } from "./startEditing";

export function createAndEditArticle(fn) {
    return cy
        .get("#js-dashboard-create-dropdown").click()
        .get("#js-dashboard-create-article").click()
        .wait(2000)
        .url()
        .then(async (url) => {
            const id = await getId(url);
            await startEditing().then(async () =>
                await fn(id)
            )
        });
}

