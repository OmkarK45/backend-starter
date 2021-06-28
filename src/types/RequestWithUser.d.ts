/**
 * Why does this exist ?
 * By default express request does not have any user object attached to it
 * we are using requireAuth middleware which attaches this user on request for us
 * so its important that we tell typescript that user is a valid property on request object
 * */
/**
 * its any here. todo -> change this to actual User type from mongoose
 * */
import { Request } from 'express'
import { IUser } from '../models/User'

export interface AuthRequest extends Request {
	user?: IUser
}
