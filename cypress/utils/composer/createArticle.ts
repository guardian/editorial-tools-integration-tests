export function createAndEditArticle() {
    cy
        .get("#js-dashboard-create-dropdown").click()
        .get("#js-dashboard-create-article").click()
        .wait(2000)
        .log("Article created");
}

