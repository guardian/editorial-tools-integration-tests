import { wait } from "../wait";

export function startEditing() {
    cy.get(".ProseMirror").click();
    wait(1);
}

