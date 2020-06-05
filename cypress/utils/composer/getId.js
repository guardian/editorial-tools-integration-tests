import { getDomain } from '../networking';

export function getId(url) {
  const domain = getDomain().toLowerCase();
  expect(url.toLowerCase()).to.match(new RegExp(`${domain}content\/`));
  return url.split('/')[4];
}
