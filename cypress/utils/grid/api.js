import axios from 'axios';
import { getDomain, setCookie } from '../networking';
// hash of the image in assets/GridmonTestImage.png
export const imageHash = 'fe052e21c4bc4d76a2c841d97c5b2281cccd19bd';

export function getImageHash() {
  return imageHash;
}

export function getImageURL() {
  return `${getDomain()}images/${getImageHash()}`;
}

export async function deleteImages(cy, images) {
  setCookie(cy, false);
  cy.then(async () => {
    await Promise.all(
      images.map((id) => {
        const url = `${getDomain('api')}images/${id}`;
        axios
          .delete(url)
          .catch((err) => {
            // If it's 404, it means the image doesn't exist (so it can't be deleted)
            if (err.response && err.response.status === 404) {
              cy.log(`${id} doesn't exist in Grid`);
              return;
            }
            cy.log(`Error deleting ${id}`, err.message);
            throw err;
          })
          .then((res) => expect(res.status, `Delete ${id}`).to.equal(202));
      })
    );
  });
}

export async function uploadImage(cy, image) {
  setCookie(cy);
  const url = `${getDomain('loader')}images`;
  const res = await axios
    .post(url, image, { withCredentials: true })
    .catch(async (err) => {
      console.error('uploadImage error', url);
      console.error(err);
      throw err;
    });
  expect(res.status, 'Upload test image').to.equal(202);
  cy.log(`Uploaded test image was ${res.statusText}`);
  return null;
}

export function readAndUploadImage(cy) {
  cy.task('readFileMaybe', 'assets/GridmonTestImage.png').then(
    async (contents) => await uploadImage(cy, Buffer.from(contents.data))
  );
}
