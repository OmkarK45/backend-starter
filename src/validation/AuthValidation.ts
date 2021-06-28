import * as yup from 'yup'

export const signUpSchema = yup.object({
	firstName: yup.string().required('First name is a required field.'),
	lastName: yup.string().required('Last name is a required field.'),
	email: yup
		.string()
		.email('Please make sure entered email is valid.')
		.required('Email is a required field'),
	password: yup
		.string()
		.min(8, 'Password must be atleast 8 characters long')
		.max(256)
		.required('Password is a required field.')
		.matches(
			/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
			'Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and one special case character'
		),
})

export const signInSchema = yup.object({
	email: yup
		.string()
		.required('Email is required to sign in.')
		.email('Make sure email is valid.'),
	password: yup.string().required('Password is required to sign in.'),
})

export const emailVerificationSchema = yup.object({
	email: yup.string().email().required(),
	verificationToken: yup.string().required(),
})

export const resendLinkSchema = yup.object({
	email: yup.string().email().required(),
})

export type SignUpBody = yup.InferType<typeof signUpSchema>
export type SignInBody = yup.InferType<typeof signInSchema>
export type EmailVerificationBody = yup.InferType<
	typeof emailVerificationSchema
>
export type ResendLinkBody = yup.InferType<typeof resendLinkSchema>
