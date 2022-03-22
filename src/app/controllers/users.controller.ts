import {Request, Response} from "express";
import Logger from '../../config/logger';
import * as Users from '../models/users.model';

const readUser = async (req: Request, res: Response):Promise<void> => {
    Logger.http(`GET information about user ${req.params.id}`);
    const id = req.params.id;
    try {
        const userInfo = await Users.getOneUser(parseInt(id, 10));
        if(userInfo.length === 0) {
            res.status(404).send('Not Found');
        } else {
            const first_name: string = userInfo[0].first_name;
            const last_name: string = userInfo[0].last_name;
            const result = JSON.stringify({firstName: first_name, lastName: last_name})
            res.setHeader('Content-Type', 'application/json');
            res.status(200).send(result);
        }
    } catch (err) {
        if (!err.hasBeenLogged) Logger.error(err);
        res.statusMessage = 'Internal Server Error';
        res.status(500).send();
    }
};

const createUser = async (req: Request, res: Response):Promise<void> => {
    Logger.http( `POST create a user with user name ${req.body.lastName}`);
    if (!req.body.hasOwnProperty("firstName") || !req.body.hasOwnProperty("lastName") || !req.body.hasOwnProperty("email") || !req.body.hasOwnProperty("password")){
        res.status(400).send("Bad Request");
        return
    }

    try {
        const result = await Users.insertUser(req.body.firstName,  req.body.lastName, req.body.email, req.body.password);
        res.setHeader('Content-Type', 'application/json');
        res.status(201).send({"userId": result.insertId});
    } catch(err) {
        res.status(500).send(`Internal Server Error: ${err}`);
    }
};

export { readUser, createUser }
