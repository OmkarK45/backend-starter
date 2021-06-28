import { Router } from 'express'
import { validate } from '../middleware/ValidateMiddleware'
import {
	forgotPasswordHandler,
	logoutHandler,
	resendLinkHandler,
	resetPasswordHandler,
	signInHandler,
	signUpHandler,
	verifyHandler,
} from '../controllers/AuthController'
import { signInSchema, signUpSchema } from '../validation/AuthValidation'

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

export = router
