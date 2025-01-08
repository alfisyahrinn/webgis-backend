const validApiKeys = [
    "abc123xyz456",
    "keyForClientA",
    "secretKeyForClientB"
];

const authenticate = (req, res, next) => {
    const apiKey = req.headers['authorization']?.split(' ')[1];     

    if (!apiKey || !validApiKeys.includes(apiKey)) {
        return res.status(403).json({
            status: "error",
            message: "Forbidden: Invalid API key"
        });
    }

    next();
};

module.exports = authenticate;
