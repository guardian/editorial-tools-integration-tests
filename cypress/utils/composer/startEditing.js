export function startEditing() {
    return cy
        .get(".ProseMirror").click()
        .wait(1000);
}

