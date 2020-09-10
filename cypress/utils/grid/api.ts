import { getDomain } from '../networking';
import { apps } from '../values';
const { grid } = apps;

// hash of the image in assets/GridmonTestImage.png
export const imageHash = 'fe052e21c4bc4d76a2c841d97c5b2281cccd19bd';

export function getImageHash() {
  return imageHash;
}

export function getImageURL() {
  return `${getDomain(grid)}/images/${getImageHash()}`;
}

export async function deleteImages(
  cy: Cypress.cy & EventEmitter,
  images: string[]
) {
  const cropperDomain = getDomain(grid, { prefix: 'cropper' });
  const originDomain = getDomain('integration-tests');
  const usagesDomain = getDomain('media-usage');

  images.map((id: string) => {
    const cropperUrl = `${cropperDomain}/crops/${id}`;
    cy.request({
      method: 'DELETE',
      url: cropperUrl,
      headers: { Origin: originDomain },
    });

    const usagesUrl = `${usagesDomain}/usages/media/${id}`;
    cy.request({
      method: 'DELETE',
      url: usagesUrl,
      headers: { Origin: originDomain },
    });

    cy.wait(500);

    const url = `${getDomain(grid, { prefix: 'api' })}/images/${id}`;
    cy.request({
      method: 'DELETE',
      url,
      failOnStatusCode: false,
      headers: { Origin: originDomain },
    }).then((response) => {
      if (response.status !== 404 && response.status !== 202) {
        console.log('DELETE ERROR', response, url);
        throw new Error(
          `${response.status} (${response.statusText}) response from DELETE ${id}`
        );
      }
    });
  });
}
