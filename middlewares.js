const jwt = require('jsonwebtoken')
const verifyRequestHeader = async (req, res, next) => {
    // if there is header['authorization']
    if (req.headers['authorization']) {
        let token = req.headers['authorization'].split(' ')[1]
        try {
            const {userId} = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
            req.userId = userId
            next()
        } catch (e) {
            console.log(e.message)
        }
    }
    res.sendStatus(401)
    // get the token
    // verfy the token
}

module.exports = verifyRequestHeader