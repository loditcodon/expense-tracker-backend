const jwt = require("jsonwebtoken");

const middlewareController = {
    verifyToken(req, res, next) {
        const token = req.headers.token || req.cookies.accessToken;
        if (token) {
            jwt.verify(token, process.env.JWT_ACCESS_KEY, (err, user) => {
                if (err) {
                    return res.status(403).json("Token is not valid");
                }
                req.user = user;
                next();
            });
        } else {
            return res.status(401).json("You're not authenticated");
        }
    },
    verifyTokenAndCheckIsUser(req, res, next) {
        middlewareController.verifyToken(req, res, () => {
            if (req.user.uid == req.params.uid) {
                next();
            }
            else {
                return res.status(404).json("UserId is not you");
            }
        })
    },
};

module.exports = middlewareController;
