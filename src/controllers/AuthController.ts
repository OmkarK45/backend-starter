import { Request, RequestHandler, Response } from 'express'
import { sendEmail } from '../config/emailConfig'
import { User } from '../models/User'
import {
	EmailVerificationBody,
	ResendLinkBody,
	SignInBody,
	SignUpBody,
} from '../validation/AuthValidation'
import crypto from 'crypto'
import log from '../utils/logger'
import { createToken } from '../utils/authUtils'
import { AuthRequest } from '../types/RequestWithUser'
/**
 * This handler handles user signups.
 * send POST Request at /api/auth/sign-up
 * body contains {firstName, lastName, email, password}
 * */
export const signUpHandler: RequestHandler<{}, {}, SignUpBody> = async (
	req,
	res
) => {
	const { firstName, lastName, email, password } = req.body

	const isAlreadyRegistered = await User.findOne({
		email,
	})

	if (isAlreadyRegistered) {
		return res.json({
			msg: 'An account with that email already exists. Please try signing up using another email. If you think this is a mistake, please contact support@neog.camp',
		})
	}

	try {
		const user = new User({
			firstName,
			lastName,
			email,
			password,
		})

		const verificationToken = await user.getEmailVerificationToken()

		await user.save((err) => {
			if (err) {
				return res.status(500).json({
					msg: 'Something went wrong while registering you. Please try later or contact support@neogcamp.com',
				})
			}
		})

		try {
			// TODO - use something like handlebars for email templates
			// TODO - abstract this logic something like createEmail(html, user)
			await sendEmail({
				from: 'Sushil from Neog <neogcamp@neog.com>',
				to: user.email,
				subject: 'Confirm your email address.',
				html: `<h1>Hello world Here is your token ${verificationToken}</h1>`,
			})
			return res.status(200).json({
				msg: `An email with verification link has been sent to you at ${user.email}. Please check your inbox.`,
			})
		} catch (error) {
			user.verificationToken = undefined
			user.verificationTokenExpiresIn = undefined
			user.isVerified = false
			user.save()

			res.status(500).json({
				msg: 'There was an error while sending verification email. Please click the resend button.',
			})
		}
	} catch (error) {
		res.status(500).json({
			msg: 'Something went wrong while registering you.',
			code: 'INTERNAL_ERROR',
		})
	}
}

/**
 * This endpoint handles email verifications
 * send GET Request here /api/auth/email-verification
 * */
export const verifyHandler: RequestHandler<{}, {}, EmailVerificationBody> =
	async (req, res) => {
		const { verificationToken, email } = req.body

		try {
			const user = await User.findOne({
				email,
			})

			if (!user) {
				return res.status(200).json({
					msg: 'No user exists with that email address. Please sign up.',
				})
			}

			if (user.isVerified) {
				return res.status(200).json({
					msg: 'You have already verified your email address.',
				})
			}

			if (
				user.verificationTokenExpiresIn &&
				user.verificationTokenExpiresIn < new Date()
			) {
				return res.status(400).json({
					msg: 'Your verification token has been expired. Please click resend button.',
				})
			}

			if (verificationToken === user.verificationToken) {
				user.isVerified = true
				user.verificationToken = undefined
				user.verificationTokenExpiresIn = undefined

				await user.save()
			}
			const token = await createToken({
				_id: user._id,
				email: user.email,
			})

			res.cookie('token', token, {
				httpOnly: true,
			})

			// TODO : send cookie here or session here
			res.status(200).json({
				msg: 'Your email address has been verified. You may now continue using the website.',
			})
		} catch (error) {
			return res.status(500).json({
				msg: 'Something went wrong while verifying your email. Please try again or contact support@neogcamp.com',
			})
		}
	}

export const signInHandler: RequestHandler<{}, {}, SignInBody> = async (
	req,
	res
) => {
	const { email, password } = req.body

	try {
		const user = await User.findOne({
			email,
		}).select('+password')

		if (!user) {
			return res.status(404).json({
				msg: 'Incorrect email or password. Please check credentials.',
			})
		}

		if (!user.isVerified) {
			return res.status(401).json({
				msg: 'Your credentials are correct. But please make sure to verify email before signing in.',
			})
		}

		const validPassword = await user.matchPasswords(password)

		if (!validPassword) {
			return res.status(404).json({
				msg: 'Incorrect credentials. Please check your email or password.',
			})
		}
		const token = createToken({
			_id: user._id,
			email: user.email,
		})

		log.info('TOKEN', token)

		res.cookie('token', token, {
			httpOnly: true,
		})

		// some sort of cookie or session mgmt
		res.status(200).json({
			msg: 'Logged in successfully !',
			email,
			firstName: user.firstName,
			token,
		})
	} catch (error) {
		return res.status(500).json({
			msg: 'Something went wrong while signing you in. Please contact support@neogcamp.com',
			code: 'INTERNAL_ERROR',
		})
	}
}

export const resendLinkHandler: RequestHandler<{}, {}, ResendLinkBody> = async (
	req,
	res
) => {
	const { email } = req.body

	const user = await User.findOne({
		email,
	})

	if (!user) {
		return res.status(404).json({
			msg: 'No user with that email was found.',
		})
	}

	if (user.isVerified) {
		return res.status(200).json({
			msg: 'Your email has already been verified.',
		})
	}

	const verificationToken = await user.getEmailVerificationToken()

	await user.save((err) => {
		if (err) {
			return res.status(500).json({
				msg: 'Something went wrong while registering you. Please try later or contact support@neogcamp.com',
			})
		}
	})

	try {
		// TODO - use something like handlebars for email templates
		await sendEmail({
			from: 'Sushil from Neog <neogcamp@neog.com>',
			to: user.email,
			subject: 'Confirm your email address.',
			html: `<h1>Verify Email : Here is your token ${verificationToken}</h1>`,
		})
		return res.status(200).json({
			msg: `An email with verification link has been sent to you at ${user.email}. Please check your inbox.`,
		})
	} catch (error) {
		user.verificationToken = undefined
		user.verificationTokenExpiresIn = undefined
		user.isVerified = false
		user.save()

		res.status(500).json({
			msg: 'There was an error while sending verification email. Please click the resend button.',
		})
	}
}

export const forgotPasswordHandler: RequestHandler = async (req, res) => {
	const { email } = req.body

	try {
		const user = await User.findOne({ email })
		// intentional response to prevent rainbow attacks.
		if (!user) {
			return res.status(200).json({
				msg: 'Email has been sent.',
			})
		}

		const resetToken = await user.getPasswordResetToken()

		console.log(resetToken)

		await user.save()

		// Ṭodo -> this can be better.
		const resetURL = `http://localhost:3000/auth/resetpassword/${resetToken}`

		try {
			await sendEmail({
				from: 'no-reply@neog.camp',
				to: user.email,
				subject: '[NeoG Camp] Password Reset Requested',
				html: `<h1>Password Reset Token for ${user.email} ${resetToken}</h1>`,
			})
			return res.status(200).json({
				msg: 'An email containing link to reset password has been sent to you. Please check your inbox.',
			})
		} catch (error) {
			user.passwordResetToken = undefined
			await user.save()
			return res.json({ msg: 'Email could not be sent. Please try later.' })
		}
	} catch (error) {
		res.status(500).json({
			msg: 'Something went wrong while issuing token to you. Please try later.',
		})
	}
}

export const resetPasswordHandler: RequestHandler = async (req, res) => {
	const { newPassword } = req.body

	const { resetToken } = req.params

	const passwordResetToken = crypto
		.createHash('sha256')
		.update(resetToken)
		.digest('hex')

	try {
		const user = await User.findOne({
			passwordResetToken,
			passwordResetTokenExpire: {
				$gt: new Date(),
			},
		})

		if (!user) {
			return res.json({
				msg: 'Password reset token is invalid or expired.',
			})
		} else {
			user.password = newPassword
			user.passwordResetToken = undefined
			user.passwordResetTokenExpire = undefined
			await user.save()

			res.status(200).json({
				msg: 'Password has been reset. ',
				sucess: true,
			})
		}
	} catch (error) {
		res.status(500).json({
			msg: 'Something went wrong while resetting the password. Please try again or contact support@neog.camp',
		})
	}
}

export const logoutHandler: RequestHandler = async (req, res) => {
	try {
		res.cookie('token', '', { httpOnly: true })
		res.status(200).json({
			msg: 'Logged out successfully.',
		})
	} catch (error) {
		res.cookie('token', '', { httpOnly: true })
		res.status(500).json({
			msg: 'Logged out successfully.',
		})
	}
}

export const userInfoHandler = async (req: AuthRequest, res: Response) => {
	const user = req.user

	if (!user) {
		return res.status(404).json({
			msg: 'Data for the user was not found on the server.',
		})
	}

	try {
		const foundUser = await User.findOne({
			email: user.email,
		})
		res.status(200).json({
			foundUser,
		})
	} catch (error) {
		res.status(500).json({
			msg: 'There was some error while fetching user information.',
			code: 'INTERNAL_ERROR',
		})
	}
}
