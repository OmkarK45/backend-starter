import nodemailer from 'nodemailer'
import SMTPTransport from 'nodemailer/lib/smtp-transport'
import log from '../utils/logger'

interface IEmailOptions {
	from: string
	to: string
	subject: string
	html: string
	cc?: string
}
// TODO : add nice support for html email templates instead of passing strings.
export function sendEmail(options: IEmailOptions) {
	const transporter = nodemailer.createTransport({
		host: process.env.EMAIL_HOST,
		auth: {
			user: process.env.EMAIL_USERNAME!,
			pass: process.env.EMAIL_PASSWORD!,
		},
		port: Number(process.env.EMAIL_PORT) || 0,
	} as SMTPTransport.Options)

	transporter.sendMail(options, (err, info) => {
		if (err) {
			log.error('Error in sending email.', err)
		}
		info && log.info(info)
	})
}
