import {Request, Response} from "express";
import Logger from '../../config/logger';
import * as Users from '../models/users.model';
import * as Authenticate from '../models/authentication.model';

const readUser = async (req: Request, res: Response):Promise<void> => {
    Logger.http(`GET information about user ${req.params.id}`);
    const id = req.params.id;
    try {
        const userInfo = await Users.getOneUser(parseInt(id, 10));
        if(userInfo.length === 0) {
            res.status(404).send('The provided user id is not valid.');
        } else {
            const first_name: string = userInfo[0].first_name;
            const last_name: string = userInfo[0].last_name;
            const userEmail: string = userInfo[0].email;
            let result;
            const signedInUser = await Authenticate.findUserIdByToken(req.header('X-Authorization'));
           // Logger.http(`The user token: ${req.header('X-Authorization')}`);
           // const signedInUserLen = signedInUser.length;
           // const signedInUserID = signedInUser[0].id;
           // Logger.http(`signedInUser length: ${signedInUserLen}`);
           // Logger.http(`signedInUser ID: ${signedInUserID}`);
           // Logger.http(`current user ID: ${id}`)
            if ((signedInUser.length !== 0) && (signedInUser[0].id === parseInt(id, 10))) {
                result = JSON.stringify({firstName: first_name, lastName: last_name, email: userEmail});
            } else {
                result = JSON.stringify({firstName: first_name, lastName: last_name});
            }
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
        return;
    }

    try {
        const result = await Users.insertUser(req.body.firstName,  req.body.lastName, req.body.email, req.body.password);
        res.setHeader('Content-Type', 'application/json');
        res.status(201).send({"userId": result.insertId});
    } catch(err) {
        res.status(500).send(`Internal Server Error: ${err}`);
    }
};

const loginUser = async (req: Request, res: Response): Promise<void> => {
    Logger.http( `POST log in user ${req.body.email}`);
    if (!req.body.hasOwnProperty("email") || !req.body.hasOwnProperty("password")) {
        res.status(400).send("Need both email and password");
        return;
    }

    try {
        const userInfo = await Users.signInUser(req.body.email, req.body.password);
        if(userInfo.length === 0) {
            res.status(400).send('The email and password match no user');
        } else {
            const signedInUserID: number = userInfo[0].id;
            const newToken: string = userInfo[0].auth_token;
            const result = JSON.stringify({userId: signedInUserID, token: newToken});
            res.setHeader('Content-Type', 'application/json');
            res.status(200).send(result);
        }
    } catch(err) {
        res.status(500).send(`Internal Server Error: ${err}`);
    }

};

export { readUser, createUser, loginUser }
