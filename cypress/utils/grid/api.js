import { getDomain } from '../networking';
const env = require('../../../env.json');
// hash of the image in assets/GridmonTestImage.png
export const imageHash = 'fe052e21c4bc4d76a2c841d97c5b2281cccd19bd';

export function getApiKey(stage) {
  const key = env.apiKey[stage];
  if (!key) {
    throw new Error(
      `API key for stage ${stage} missing, please ensure it is in env.json file`
    );
  }
  return key;
}

export function getImageHash() {
  return imageHash;
}

export function getImageURL() {
  return `${getDomain()}images/${getImageHash()}`;
}

export async function deleteImages(cy, images) {
  cy.then(async () => {
    await Promise.all(
      images.map((id) => {
        const url = `${getDomain('api')}images/${id}`;
        cy.request({
          method: 'DELETE',
          url,
          failOnStatusCode: false,
          headers: { 'X-Gu-Media-Key': getApiKey(Cypress.env('STAGE')) },
        }).then((response) => {
          if (!(response.status === '404') && !(response.status === '202')) {
            console.log('DELETE ERROR', response, url);
            throw new Error(
              `${response.status} (${response.statusText}) response from DELETE ${id}: ${response.body}`
            );
          }
        });
      })
    );
  });
}
