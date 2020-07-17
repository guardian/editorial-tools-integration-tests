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

export async function uploadImage(
  cy: Cypress.cy & EventEmitter,
  image: { type: string; data: any }
) {
  const url = `${getDomain({ prefix: 'loader' })}/images`;
  const buffer = Buffer.from(image.data);
  cy.request({
    method: 'POST',
    body: buffer,
    url,
    failOnStatusCode: false,
    headers: {
      Origin: getDomain({ app: 'integration-tests' }),
    },
  }).then((response) => {
    if (response.status !== 202) {
      console.log('UPLOAD ERROR');
      console.log(response, url);
      throw new Error(
        `${response.status} (${response.statusText}) response from UPLOAD`
      );
    }
  });

  // const res = await axios
  //   .post(url, image, { withCredentials: true })
  //   .catch(async (err) => {
  //     console.error('uploadImage error', url);
  //     console.error(err);
  //     throw err;
  //   });
  // expect(res.status, 'Upload test image').to.equal(202);
  // cy.log(`Uploaded test image was ${res.statusText}`);
  // return null;
}

export function readAndUploadImage(cy: Cypress.cy & EventEmitter) {
  cy.task('readFileMaybe', 'assets/GridmonTestImage.png').then(
    async (contents: { type: string; data: any }) => {
      console.log('contents', contents);
      await uploadImage(cy, contents);
    }
  );
}
