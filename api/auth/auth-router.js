const router = require('express').Router();
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../../data/dbConfig')
const { checkUsernameFree, checkCredentials } = require('../auth/auth-middleware')

const JWT_SECRET = process.env.JWT_SECRET || 'shh'

function generateToken(user) {
   const payload = {
    subject: user.id,
    username: user.username,
   }
   const options = {
    expiresIn: '1d',
   }
   return jwt.sign(payload, JWT_SECRET, options)
}

router.post('/register', checkCredentials, checkUsernameFree , async (req, res) => {
  try {
    const { username, password } = req.body
    const hash = bcrypt.hashSync(password, 8)
    const [id] = await db('users').insert({ username, password: hash})
    const newUser = await db('users').where({ id }).first()

    res.status(201).json(newUser)
  } catch (err) {
    res.status(500).json({ message: 'something went wrong', error: err.message})
  }

  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.
    DO NOT EXCEED 2^8 ROUNDS OF HASHING!

    1- In order to register a new account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel", // must not exist already in the `users` table
        "password": "foobar"          // needs to be hashed before it's saved
      }

    2- On SUCCESSFUL registration,
      the response body should have `id`, `username` and `password`:
      {
        "id": 1,
        "username": "Captain Marvel",
        "password": "2a$08$jG.wIGR2S4hxuyWNcBf9MuoC4y0dNy7qC/LbmtuFBSdIhWks2LhpG"
      }

    3- On FAILED registration due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED registration due to the `username` being taken,
      the response body should include a string exactly as follows: "username taken".
  */
});

router.post('/login', checkCredentials, async (req, res) => {
  try {
    const { username, password } = req.body
    const user = await db('users').where({ username }).first()

    if (user && bcrypt.compareSync(password, user.password)) {
      const token = generateToken(user)
      res.json({message: `welcome, ${user.username}`, token,})
    } else {
      res.status(401).json({message: 'invalid credentials'})
    }
  } catch (err) {
    res.status(500).json({ message: 'something went wrong'})
  }
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.

    1- In order to log into an existing account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel",
        "password": "foobar"
      }

    2- On SUCCESSFUL login,
      the response body should have `message` and `token`:
      {
        "message": "welcome, Captain Marvel",
        "token": "eyJhbGciOiJIUzI ... ETC ... vUPjZYDSa46Nwz8"
      }

    3- On FAILED login due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED login due to `username` not existing in the db, or `password` being incorrect,
      the response body should include a string exactly as follows: "invalid credentials".
  */
});

module.exports = router;
