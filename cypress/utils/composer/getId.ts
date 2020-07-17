import { getDomain } from '../networking';

export function getId(
  url: string,
  { app, stage }: { app?: string; stage?: string }
) {
  const domain = getDomain({ app, stage });
  expect(url).to.match(new RegExp(`${domain}/content\/`));
  return url.split('/')[4];
}
