export const https = require('https');

export function getContent(url) {
    return new Promise(function(resolve, reject) {
        https.get(url, (resp) => {
            let data = '';

            // A chunk of data has been received, add it.
            resp.on('data', (chunk) => {data += chunk;});

            // The whole response has been received. Print out the result.
            resp.on('end', () => {
                // console.log(JSON.parse(data).explanation);
                resolve(data);

            });
        });
    });
}

