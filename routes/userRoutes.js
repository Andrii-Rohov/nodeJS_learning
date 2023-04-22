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

//Protects all routes after this middleware
route.use(authController.protect);

route.route('/updateMyPassword')
    .patch( authController.updatePassword);

route.route('/updateMe')
    .patch(userController.updateMe);

route.route('/deleteMe')
    .delete(userController.deleteMe);

    route.route('/me')
        .get(userController.getMe, userController.getUser);

//Restrict all routes after this middleware
route.use(authController.restrictTo('admin'));

route.route('/')
    .get(userController.gettAllUsers)
    .post(userController.addNewUsers);

route.route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = route;