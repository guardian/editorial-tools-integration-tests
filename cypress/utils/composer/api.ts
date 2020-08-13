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

function deleteContent(id: string) {
  const apiBaseUrl = `${getDomain({ app: 'composer' })}/api`;
  const url = `${apiBaseUrl}/content/${id}`;

  cy.request({
    url,
    method: 'DELETE',
    failOnStatusCode: false,
    headers: {
      Origin: getDomain({ app: 'integration-tests' }),
    },
  }).then((response) => {
    if (response.status !== 404 && response.status !== 202) {
      console.log('DELETE ERROR', response, url);
      throw new Error(
        `${response.status} (${response.statusText}) response from DELETE ${id}`
      );
    }
  });
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
      deleteContent(data.id);
    });
  });
};

export const deleteArticlesFromWorkflow = (contentPrefix: string) => {
  const workflowBaseUrl = `${getDomain({ app: 'workflow' })}/api/content`;

  const urlWithParams = `${workflowBaseUrl}?text=${contentPrefix.replace(
    /\s/g,
    '+'
  )}`;
  const origin = getDomain({ app: 'integration-tests' });
  console.log(urlWithParams, origin);

  cy.request({
    url: urlWithParams,
    method: 'GET',
    headers: {
      Origin: origin,
    },
  }).then((response) => {
    const ids = JSON.parse(response.body)
      .content?.Writers.filter(
        (content: { published: boolean }) => !content.published
      )
      .map((_) => _.composerId);

    cy.log(
      `${ids.length} articles by ${env.user.email}, attempting to delete...`
    );
    ids.map((id: string) => deleteContent(id));
  });
};
