import axios from 'axios';
import { getDomain } from '../networking';
// hash of the image in assets/GridmonTestImage.png
export const imageHash = 'fe052e21c4bc4d76a2c841d97c5b2281cccd19bd';

export function getImageHash() {
  return imageHash;
}

export function getImageURL() {
  return `${getDomain()}images/${getImageHash()}`;
}

export async function deleteTestImages(images) {
  await Promise.all(
    images.map((id) => {
      const url = `${getDomain('api')}images/${id}`;
      axios.delete(url).catch((err) => {
        expect(
          err.response.status,
          `Delete image ${id.substr(0, 5)}... via API response code`
        ).to.equal(404);
      });
    })
  );
}

export async function uploadImage(image) {
  const url = `${getDomain('loader')}images`;
  await axios
    .post(url, image, { withCredentials: true })
    .then((res) => console.log('uploadImage response', res))
    .catch(async (err) => {
      console.error('uploadImage error', url);
      console.error(err);
      throw err;
    });
  return null;
}
