const jwtSecret = 'secret123'
import jwt from 'jsonwebtoken'

const { verify } = jwt

export const fetchUser = (req, res, next) => {
    const authToken = req.header('auth-token')
    if (!authToken) {
        return res.status(400).send('please provide auth token')
    }

    // try {
        const data = verify(authToken, jwtSecret)
        req.user = data.user
        next()
    // } catch (error) {
    //     res.send(error)
    // }
}