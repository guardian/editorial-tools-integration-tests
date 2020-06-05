import {getDomain} from "../networking";

export async function getId(url) {
    const domain = getDomain();
    expect(url).to.match( new RegExp(`${domain}content\/`));
    return url.split('/')[4];
}

