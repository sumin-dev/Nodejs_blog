const jwt = require("jsonwebtoken");
const { User } = require("../models"); //index 생략가능


module.exports = (req, res, next) => {

    try {
        const { authorization } = req.headers;
        const [tokenType, tokenValue] = authorization.split(' ');

        if (tokenType !== 'Bearer') {
            res.status(401).send({
                errorMessage: "로그인이 필요합니다",
            });
            return;
        }

        const { userId } = jwt.verify(tokenValue, "Judy-secret-key");

        User.findByPk(userId).then((user) => {
            res.locals.user = user;

            next();
        })



    } catch (error) {
        res.status(401).send({
            errorMessage: "로그인이 필요합니다.",
        })
        return;
    }

};