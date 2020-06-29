import { getDomain } from '../networking';

export function getId(url, { prefix, app } = { prefix: null, app: null }) {
  const domain = getDomain(prefix, app);
  expect(url).to.match(new RegExp(`${domain}content\/`));
  return url.split('/')[4];
}
