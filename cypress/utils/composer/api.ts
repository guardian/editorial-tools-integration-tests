import { getDomain } from '../networking';
import env from '../../../env.json';

interface ContentResponse {
  data: Content;
}

interface Content {
  published: boolean;
  id: string;
  collaborators: [];
}

export const deleteAllArticles = () => {
  const apiBaseUrl = `${getDomain()}/api`;

  cy.request({
    url: `${apiBaseUrl}/content?collaboratorEmail=${env.user.email}`,
    method: 'GET',
    headers: {
      Origin: getDomain({ app: 'integration-tests' }),
    },
  }).then(({ body: { data: data } }: { body: { data: ContentResponse[] } }) => {
    const deletable: Partial<Content>[] = data
      .filter(({ data }) => !data.published && data.collaborators.length < 2)
      .map(({ data }) => ({ id: data.id, collaborators: data.collaborators }));

    cy.log(
      `${data.length} articles by ${env.user.email}, attempting to delete ${deletable.length} unpublished`
    );

    deletable.forEach((article) => {
      cy.request({
        url: `${apiBaseUrl}/content/${article.id}`,
        method: 'DELETE',
        headers: {
          Origin: getDomain({ app: 'integration-tests' }),
        },
      });
    });
  });
};
