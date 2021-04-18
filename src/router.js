const { httpLogger: logger } = require('./lib/logger');

const router = (req, res) => {
    logger(req, res);
    res.setHeader('Content-Type', 'application/json');

    switch (req.url) {
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

module.exports = router;
