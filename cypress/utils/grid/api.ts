import { getDomain } from '../networking';
// hash of the image in assets/GridmonTestImage.png
export const imageHash = 'fe052e21c4bc4d76a2c841d97c5b2281cccd19bd';

export function getImageHash() {
  return imageHash;
}

export function getImageURL() {
  return `${getDomain()}/images/${getImageHash()}`;
}

export async function deleteImages(
  cy: Cypress.cy & EventEmitter,
  images: string[]
) {
  images.map((id: string) => {
    const url = `${getDomain({ prefix: 'api' })}/images/${id}`;
    cy.request({
      method: 'DELETE',
      url,
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
  });
}
