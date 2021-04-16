module.exports = (req, res) => {
    const { method, url } = req;

    console.log(`${method} ${url}`);

    res.setHeader('Content-Type', 'application/json');

    switch (url) {
        case '/ping':
            res.writeHead(200);
            return res.end(JSON.stringify({
                status: 'healthy'
            }));

        default:
            res.writeHead(404);
            return res.end(JSON.stringify({
                error: 'Resource not found'
            }));
    }
};
