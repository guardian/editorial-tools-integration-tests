export const https = require('https');

export function getContent(url: string) {
  return new Promise(function (resolve) {
    https.get(url, (resp: http.IncomingMessage) => {
      let data = '';

      // A chunk of data has been received, add it.
      resp.on('data', (chunk: string) => {
        data += chunk;
      });

      // The whole response has been received. Print out the result.
      resp.on('end', () => {
        // console.log(JSON.parse(data).explanation);
        resolve(data);
      });
    });
  });
}
