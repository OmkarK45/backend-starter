import jwt, { JwtPayload } from 'jsonwebtoken'

export interface TokenUser extends JwtPayload {
	_id: string
	email: string
	// todo - make this robust to support only few roles "student" | "admin" | "reviewer"
	role?: string | undefined
	// todo - we won't want this undefined.
}

export const JWT_SECRET = process.env.JWT_SECRET

export function createToken(user: TokenUser) {
	//todo -> check if user role is assigned.

	return jwt.sign(
		{
			sub: user._id,
			email: user.email,
			role: user.role,
			iss: 'api.neogcamp.com',
			aud: 'app.neogcamp.com',
		},
		process.env.JWT_SECRET as string,
		{
			// algorithm: 'HS256',
			expiresIn: process.env.JWT_EXPIRES_IN || '7d',
		}
	)
}
