const { addExpense, getExpense, deleteExpense } = require('../controllers/expense');
const { addIncome, getIncomes, deleteIncome } = require('../controllers/income');
const authController = require('../controllers/auth');
const middlewareController = require('../middleware/authmiddle');
const { addSpendingLimitsDay, addSpendingLimitsMonth, addSpendingLimitsYear } = require('../controllers/spending_limit');

const router = require('express').Router();

router.post('/:uid/add-income', middlewareController.verifyTokenAndCheckIsUser, addIncome)
    .get('/:uid/get-incomes', middlewareController.verifyTokenAndCheckIsUser, getIncomes)
    .delete('/:uid/delete-income/:id', middlewareController.verifyTokenAndCheckIsUser, deleteIncome)
    .post('/:uid/add-expense', middlewareController.verifyTokenAndCheckIsUser, addExpense)
    .get('/:uid/get-expenses', middlewareController.verifyTokenAndCheckIsUser, getExpense)
    .delete('/:uid/delete-expense/:id', middlewareController.verifyTokenAndCheckIsUser, deleteExpense)
    .get('/:uid/getUserProfile', middlewareController.verifyTokenAndCheckIsUser, authController.getUserProfile)
    .post('/:uid/editUserProfile', middlewareController.verifyTokenAndCheckIsUser, authController.editUserProfile)
    .post('/:uid/editImageUser', middlewareController.verifyTokenAndCheckIsUser, authController.editPictureUserProfile)
    .post('/login', authController.login)
    .post('/register', authController.register)
    .put('/editpassword/:uid', middlewareController.verifyTokenAndCheckIsUser, authController.editPassword)
    .post('/logout', authController.logout)
    .post('/forgotpassword', authController.forgotPassword)
    .post('/:uid/forgotpasswordnext', middlewareController.verifyTokenAndCheckIsUser, authController.forgotPasswordNext)
    .post('/:uid/add-spending-limit-day', middlewareController.verifyTokenAndCheckIsUser, addSpendingLimitsDay)
    .post('/:uid/add-spending-limit-mouth', middlewareController.verifyTokenAndCheckIsUser, addSpendingLimitsMonth)
    .post('/:uid/add-spending-limit-year', middlewareController.verifyTokenAndCheckIsUser, addSpendingLimitsYear)

module.exports = router