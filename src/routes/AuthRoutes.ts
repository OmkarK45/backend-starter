import { Router } from 'express'
import { validate } from '../middleware/ValidateMiddleware'
import {
	forgotPasswordHandler,
	logoutHandler,
	resendLinkHandler,
	resetPasswordHandler,
	signInHandler,
	signUpHandler,
	userInfoHandler,
	verifyHandler,
} from '../controllers/AuthController'
import { signInSchema, signUpSchema } from '../validation/AuthValidation'
import { requiresAuth } from '../middleware/AuthMiddleware'

const router = Router()

/**
 * Sign Up Route
 * Accepts a JSON Body with firstName, lastName, email and password
 * All routes are prefixed with /api/auth/
 * */
// TODO -> add validation middleware
router.route('/sign-up').post(validate(signUpSchema), signUpHandler)
router.route('/sign-in').post(validate(signInSchema), signInHandler)
router.route('/email-verification').post(verifyHandler)
router.route('/email-verification/resend').post(resendLinkHandler)
router.route('/forgot-password').post(forgotPasswordHandler)
router.route('/reset-password/:resetToken').put(resetPasswordHandler)
router.route('/logout').post(logoutHandler)
router.route('/user-info').get(requiresAuth, userInfoHandler)
export = router
