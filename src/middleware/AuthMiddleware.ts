import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { User } from '../models/User'
import { TokenUser } from '../utils/authUtils'
import log from '../utils/logger'

export async function requiresAuth(
	req: Request,
	res: Response,
	next: NextFunction
) {
	const cookie = req.cookies

	if (!cookie) {
		return res.status(401).json({
			msg: 'You are unauthorized to perform this action.',
			success: false,
		})
	}

	const { token } = cookie

	if (!token) {
		return res.status(401).json({
			success: false,
			msg: 'You are not authorized to do that.',
		})
	}

	try {
		const decodedUser = <TokenUser>jwt.verify(token, process.env.JWT_SECRET!)

		const user = await User.findById(decodedUser._id)

		log.info(user)

		if (!user) {
			return res.status(404).json({
				msg: 'Token is invalid.',
				success: false,
			})
		}

		req.user = user

		next()
	} catch (error) {
		console.log(error)
		res.status(401).json({
			success: false,
			msg: 'You are not authorized to access this resource',
		})
	}
}
