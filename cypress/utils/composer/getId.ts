import {getDomain} from "../networking";

export function getId(url) {
    const domain = getDomain();
    expect(url).to.match( new RegExp(`${domain}/content\/`));
    return url.split('/')[4];
}

