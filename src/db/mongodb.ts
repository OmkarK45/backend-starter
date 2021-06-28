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
				// feel free to change this to true if u use fineOneAndUpdate()
				useFindAndModify: false,
				useCreateIndex: true,
			}
		)
		.then(() => {
			log.info(`[${process.env.NODE_ENV}]` + '📀 Connected to Database')
		})
		.catch((error: Error) => {
			log.error(
				`There was an error while connecting to database. 
			You likely forgot to include mongoDB connection URL or it is invalid.`,
				error
			)
		})
}
