import { getDomain } from '../networking';
import env from '../../../env.json';
import { WorkflowResponse } from '../workflow/interfaces';
import { apps } from '../values';

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
  const apiBaseUrl = `${getDomain(apps.composer)}/api`;
  const url = `${apiBaseUrl}/content/${id}`;

  cy.request({
    url,
    method: 'DELETE',
    headers: {
      Origin: getDomain('integration-tests'),
    },
  });
}

export const deleteAllArticles = () => {
  const apiBaseUrl = `${getDomain(apps.composer)}/api`;

  cy.request({
    url: `${apiBaseUrl}/content?collaboratorEmail=${env.user.email}`,
    method: 'GET',
    headers: {
      Origin: getDomain('integration-tests'),
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

    deletable.forEach(({ data }) => deleteContent(data.id));
  });
};

export const deleteArticlesFromWorkflow = (contentPrefix: string) => {
  const workflowBaseUrl = `${getDomain(apps.workflow)}/api/content`;

  const urlWithParams = `${workflowBaseUrl}?text=${contentPrefix.replace(
    /\s/g,
    '+'
  )}`;
  const origin = getDomain('integration-tests');

  cy.request({
    url: urlWithParams,
    method: 'GET',
    headers: { Origin: origin },
  }).then((response) => {
    const content: WorkflowResponse = JSON.parse(response.body).content;
    const ids: string[] = [];
    Object.keys(content).forEach((status) => {
      content[status]
        .filter(
          (content) =>
            !content.published &&
            content.wordCount === 0 &&
            content.lastModifiedBy ===
              `${env.user.firstName} ${env.user.lastName}`
        )
        .forEach((content) => ids.push(content.composerId));
    });

    cy.log(
      `${ids.length} articles by ${env.user.email}, attempting to delete...`
    );
    ids.map((id: string) => deleteContent(id));
  });
};
