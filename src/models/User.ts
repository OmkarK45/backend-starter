import { Schema, model, Model } from 'mongoose'
import bcrypt from 'bcrypt'
import crypto from 'crypto'

// note : Add user roles as enum
/**
 * Before adding new property to schema, please add type of entity
 * you are attaching in DB in this interface
 */
export interface IUser {
	email: string
	isVerified: boolean
	firstName: string
	lastName: string
	password: string
	verificationToken: string | undefined
	passwordResetToken: string | undefined
	passwordResetTokenExpire: Date | undefined
	verificationTokenExpiresIn: Date | undefined
	getPasswordResetToken: () => Promise<String>
	getEmailVerificationToken: () => Promise<String>
	matchPasswords: (password: string) => Promise<Boolean>
}

const userSchema = new Schema<IUser, Model<IUser>, IUser>(
	{
		firstName: {
			type: String,
			required: true,
			trim: true,
		},
		lastName: {
			type: String,
			required: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
			minlength: 8,
			maxlength: 50,
			select: false,
		},
		isVerified: {
			type: Boolean,
			default: false,
		},
		verificationToken: {
			type: String,
		},
		verificationTokenExpiresIn: {
			type: Date,
		},
		passwordResetToken: {
			type: String,
		},
		passwordResetTokenExpire: {
			type: Date,
		},
	},
	{
		timestamps: true,
	}
)

userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) {
		next()
	}
	const salt = await bcrypt.genSalt(10)
	this.password = await bcrypt.hash(this.password, salt)
	next()
})

userSchema.methods.matchPasswords = async function (password) {
	return await bcrypt.compare(password, this.password)
}

userSchema.methods.getEmailVerificationToken = function () {
	const verificationToken = crypto.randomBytes(16).toString('hex')
	this.verificationToken = verificationToken
	this.verificationTokenExpiresIn = new Date(
		new Date().getTime() + 24 * 60 * 60 * 1000
	)
	return verificationToken
}

userSchema.methods.getPasswordResetToken = async function () {
	const resetToken = crypto.randomBytes(20).toString('hex')
	this.passwordResetToken = crypto
		.createHash('sha256')
		.update(resetToken)
		.digest('hex')
	this.passwordResetTokenExpire = new Date(
		new Date().getTime() + 10 * (60 * 1000)
	)
	return resetToken
}

export const User = model<IUser>('User', userSchema)
