import { CorsOptions } from 'cors'

export const corsOptions: CorsOptions = {
	/**
	 * If your next app runs on a different PORT, please change this origin.
	 * This would go away in PROD
	 * */
	origin: ['http://localhost:3000'],
	optionsSuccessStatus: 200,
	credentials: true,
	exposedHeaders: ['set-cookie'],
}
