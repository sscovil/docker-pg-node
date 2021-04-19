const { httpLogger: logger } = require('./lib/logger');
const bodyParser = require('./lib/body-parser');
const { signupWithEmail } = require('./controllers/users');

const _notFound = (req, res) => {
    res.writeHead(404);
    return res.end(JSON.stringify({
        error: 'Resource not found'
    }));
}

const router = async (req, res) => {
    logger(req, res);
    res.setHeader('Content-Type', 'application/json');

    switch (req.url) {
        case '/ping':
            res.writeHead(200);
            return res.end(JSON.stringify({
                status: 'healthy'
            }));

        case '/signup':
            if (req.method !== 'POST') {
                return _notFound(req, res);
            }
            const { username, password, email } = await bodyParser.json(req);
            const success = await signupWithEmail(username, password, email);
            if (!success) {
                res.writeHead(400);
                return res.end(JSON.stringify({
                    error: 'Bad request'
                }));
            }
            res.writeHead(200);
            return res.end(JSON.stringify({
                status: 'Success'
            }));

        default:
            return _notFound(req, res);
    }
};

module.exports = router;
