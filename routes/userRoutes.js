const express = require('express');

const userController = require(`${__dirname}/../controllers/userController`);
const authController = require(`${__dirname}/../controllers/authController`);

const route = express.Router();

route.route('/signup')
    .post(authController.signUp);

route.route('/login')
    .post(authController.logIn);

    route.route('/forgotPassword')
    .post(authController.forgotPassword);

route.route('/resetPassword/:token')
    .patch(authController.resetPassword);

route.route('/updateMyPassword')
    .patch(authController.protect, authController.updatePassword);

route.route('/updateMe')
    .patch(authController.protect, userController.updateMe);

route.route('/deleteMe')
    .delete(authController.protect, userController.deleteMe);

route.route('/')
    .get(userController.gettAllUsers)
    .post(userController.addNewUsers);

route.route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = route;