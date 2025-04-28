const db = require('../../data/dbConfig')

async function checkUsernameFree(req, res, next) {
    const { username } = req.body

    if(!username) {
        return next()
    }

    const user = await db('users').where({ username }).first()

  if (user) {
    return res.status(400).json({ message: 'username taken' })
  }
  next()
}

function checkCredentials(req, res, next) {
    const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ message: 'username and password required' })
  }
  next()
}

module.exports = {
    checkUsernameFree,
    checkCredentials,
}