const express = require('express');

const userController = require(`${__dirname}/../controllers/userController`);

const route = express.Router();

route.route('/')
    .get(userController.gettAllUsers)
    .post(userController.addNewUsers);

route.route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = route;