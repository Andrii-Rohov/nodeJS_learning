const express = require('express');
const viewController = require(`${__dirname}/../controllers/viewController`);
const authController = require(`${__dirname}/../controllers/authController`);

const router = express.Router();

router.use(authController.isLoggedIn);

router.get('/', viewController.getOverview);

router.get('/me', viewController.getAccountPage);

router.get('/login', viewController.getLoginForm);

router.get('/tour/:slug', authController.protect, viewController.getTour);

router.post('/submit-user-data', authController.protect, viewController.updateUser);

module.exports = router;