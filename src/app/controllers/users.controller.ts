import {Request, Response} from "express";
import Logger from '../../config/logger';
import * as Users from '../models/users.model';

const readUser = async (req: Request, res: Response):Promise<void> => {
    Logger.http(`GET information about user ${req.params.id}`)
    const id = req.params.id;
    try {
        const result = await Users.getOneUser(parseInt(id, 10));
        if(result.length === 0) {
            res.status(404).send('User not found');
        } else {
            res.status(200).send(result);
        }
    } catch (err) {
        if (!err.hasBeenLogged) Logger.error(err);
        res.statusMessage = 'Internal Server Error';
        res.status(500).send();
    }
};

export { readUser }
