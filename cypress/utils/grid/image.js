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
  setCookie(cy);
  cy.then(async () => {
    images.map((id) => {
      const url = `${getDomain('api')}images/${id}`;
      axios.delete(url).catch((err) => {
        console.log(`Error deleting ${id}`, err.message);
        // If it's 404, it means the image doesn't exist (so it can't be deleted)
        if (err.response.status !== 404) {
          throw err;
        }
      });
    });
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
