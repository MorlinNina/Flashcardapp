
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config()

module.exports = (repository) => {
    var user = {};
    var token = '';
    const UsersController = {
        register: async function(req, res, next) {
            await repository.findUserIdByUsername(req.body.username)
            .then((result) => {
                if (result.id) {
                    throw {
                        status: 409,
                        message: 'Dieser Username ist bereits vergeben!'
                    }
                }
                return result
            })
            .then(() => bcrypt.hash(req.body.password, 10))
            .then(hash =>  repository.createUser(
                    req.body.username, 
                    hash
                )
            )
            .then(() => {
                return res.status(201).send({
                    message: 'registered'
                });
            })
            .catch(error =>  {
                const status = error.status ? error.status : 500;
                return res.status(status).send({
                    message: error.message ? error.message : error
                });
            })
        },
        login: async function(req, res, next) {
            await repository.findUserByUsername(req.body.username)
            .then(foundUser => {

                if (!foundUser) {
                    return foundUser;
                }
                user = foundUser;                
                return bcrypt.compare(req.body.password, user.password)
            })
            .then(match => {
                if (match) {
                    token = jwt.sign({
                        username: user.username,
                        id: user.id
                    }, process.env.SECRET_JWT_KEY, {
                        expiresIn: '1d'
                    });
                    return;
                }
                throw {
                    status: 400,
                    message: 'Username oder Passwort falsch!',
                };
            })
            .then(() => res.status(201).send({
                    message: 'logged_in',
                    token: token,
                    user: user
                })
            )
            .catch(error =>  {
                const status = error.status ? error.status : 500;
                return res.status(status).send({
                    message: error.message ? error.message : error
                });
            })
        }
    }

    return UsersController;
} 