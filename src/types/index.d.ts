import { Request } from "express"

export interface UserAuthInfoRequest extends Request {
    authenticatedUserId: string
}
