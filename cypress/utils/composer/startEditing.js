export function startEditing() {
    return cy
        .get(".ProseMirror").click()
        .log("Started edit mode by clicking into ProseMirror")
        .wait(1000);
}

