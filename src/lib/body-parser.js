const json = (req) => {
    return new Promise((resolve, reject) => {
        let body = [];
        req.on('data', (chunk) => {
            body.push(chunk);
        }).on('end', () => {
            try {
                resolve(JSON.parse(Buffer.concat(body).toString()));
            } catch(err) {
                reject(err);
            }
        });
    });
};

module.exports = {
  json
};
