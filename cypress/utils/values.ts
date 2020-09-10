interface Apps {
  composer: string;
  grid: string;
  workflow: string;
}

// This maps the app to the base URL,
// primarily used by `getDomain()` to create base URLs
export const apps: Apps = {
  composer: 'composer',
  grid: 'media',
  workflow: 'workflow',
};
