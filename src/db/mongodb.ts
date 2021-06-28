import mongoose from 'mongoose'
import log from '../utils/logger'

/**
 * This function creates connection to the database with given options.
 * */
export const makeConnection = async () => {
	await mongoose
		.connect(
			process.env.NODE_ENV === 'development'
				? process.env.DB_LOCAL!
				: process.env.DB_ATLAS!,
			{
				useNewUrlParser: true,
				useUnifiedTopology: true,
				useFindAndModify: false,
				useCreateIndex: true,
			}
		)
		.then(() => {
			log.info(`[${process.env.NODE_ENV}]` + '📀 Connected to Database')
		})
		.catch((error: Error) => {
			log.error(`There was an error while connecting to database`, error)
		})
}
