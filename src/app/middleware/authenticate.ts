import {Request, Response} from "express";
import Logger from '../../config/logger';
import * as Auth from '../models/authentication.model';
import { UserAuthInfoRequest } from "../../types";
import {promises} from "dns";


exports.loginRequired = async (req:UserAuthInfoRequest, res:Response, next: () => void) => {
    const token:string = req.header('X-Authorization');

    try {
        const result = await Auth.findUserIdByToken(token);
        if (result.length === 0) {
            res.statusMessage = 'Unauthorized';
            res.status(401)
                .send();
        } else {
            req.authenticatedUserId = result[0].user_id.toString();
            next();
        }
    } catch (err) {
        if (!err.hasBeenLogged) Logger.error(err);
        res.statusMessage = 'Internal Server Error';
        res.status(500)
            .send();
    }
};