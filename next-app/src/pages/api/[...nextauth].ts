import NextAuth, { User } from 'next-auth'
import Providers from 'next-auth/providers'
import axios from 'axios'

interface Credentials {
	email: string
	password: string
}

const providers = [
	Providers.Credentials({
		name: 'Credentials',
		authorize: async (credentials: Credentials) => {
			const user: User = await axios.post(
				'http://localhost:5000/api/auth/sign-in',
				{
					user: {
						password: credentials.password,
						email: credentials.email,
					},
				},
				{
					headers: {
						accept: '*/*',
						'Content-Type': 'application/json',
					},
				}
			)

			if (user) {
				return user
			} else {
				return null
			}
		},
	}),
]

const callbacks = {
	async jwt(token, user) {
		if (user) {
			token.accessToken = user.token
		}
		return token
	},

	async session(session, token) {
		session.accessToken = token.accessToken
		return session
	},
}

const options = {
	providers,
	callbacks,
}

export default (req, res) => NextAuth(req, res, options)
