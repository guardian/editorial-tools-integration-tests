import { getDomain } from '../networking';
import env from '../../../env.json';

interface Content {
  data: {
    published: boolean;
    id: string;
    collaborators: [];
    contentChangeDetails: {
      data: {
        created: {
          user: {
            email: string;
            firstName: string;
            lastName: string;
          };
        };
      };
    };
  };
}

export const deleteAllArticles = () => {
  const apiBaseUrl = `${getDomain({ app: 'composer' })}/api`;

  cy.request({
    url: `${apiBaseUrl}/content?collaboratorEmail=${env.user.email}`,
    method: 'GET',
    headers: {
      Origin: getDomain({ app: 'integration-tests' }),
    },
  }).then(({ body: { data: contents } }: { body: { data: Content[] } }) => {
    const deletable = contents.filter(
      ({ data }) =>
        !data.published &&
        data.collaborators.length < 2 &&
        data.contentChangeDetails.data.created.user.email === env.user.email
    );

    cy.log(
      `${contents.length} articles by ${env.user.email}, attempting to delete ${deletable.length} unpublished`
    );

    deletable.forEach(({ data }) => {
      cy.request({
        url: `${apiBaseUrl}/content/${data.id}`,
        method: 'DELETE',
        headers: {
          Origin: getDomain({ app: 'integration-tests' }),
        },
      });
    });
  });
};
