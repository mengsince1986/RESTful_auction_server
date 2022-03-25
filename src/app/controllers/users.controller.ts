import {Request, Response} from "express";
import Logger from '../../config/logger';
import * as Users from '../models/users.model';
import * as Authenticate from '../models/authentication.model';
import { UserAuthInfoRequest } from "../../types";

const validEmailFormat = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

const readUser = async (req: Request, res: Response):Promise<void> => {
    Logger.http(`GET information about user ${req.params.id}`);
    if (isNaN(parseInt(req.params.id, 10))) {
        res.status(404).send("Provided id is invalid");
        return;
    }
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
    const isCompleteInfo: boolean = req.body.hasOwnProperty("firstName") && req.body.hasOwnProperty("lastName") && req.body.hasOwnProperty("email") && req.body.hasOwnProperty("password");
    if (!isCompleteInfo){
        res.status(400).send("Error: Information is not complete.\nProvide firstName, lastName, email, and password to register.");
        return;
    }
    // const validEmailFormat = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const isValidEmail: boolean = validEmailFormat.test(req.body.email);
    if (!isValidEmail){
        res.status(400).send("Error: Invalid email address.");
        return;
    }
    const isNonEmptyPassword: boolean = req.body.password.length > 0;
    if (!isNonEmptyPassword) {
        res.status(400).send("Error: Password can't be empty.");
        return;
    }
    try {
        const result = await Users.insertUser(req.body.firstName,  req.body.lastName, req.body.email, req.body.password);
        if (result !== null) {
            res.setHeader('Content-Type', 'application/json');
            res.status(201).send({"userId": result.insertId});
        } else {
            res.status(400).send("Error: Email address has already been registered.");
            return;
        }
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
        if(userInfo === null) {
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

const logoutUser = async (req: UserAuthInfoRequest, res: Response): Promise<void> => {
    Logger.http(`POST log out user with id ${req.authenticatedUserId}`);
    try {
        const result = await Users.signOutUser(req.authenticatedUserId);
        const resultAuth = result[0].auth_token;
        const resultEmail = result[0].email;
        if (resultAuth === null) {
            res.status(200).send(`User ${resultEmail} logout successfully`);
        } else {
            res.status(401).send("Can't log out. Try again.");
        }
    } catch(err) {
        res.status(500).send(`Internal Server Error: ${err}`);
    }
};

const updateUser = async (req: UserAuthInfoRequest, res: Response): Promise<void> => {
    Logger.http(`PATCH update user`);
    // check if user id is the signed-in id
    if (parseInt(req.params.id, 10) === parseInt(req.authenticatedUserId,10)) {
        res.status(400).send("Provided id is invalid or not the signed-in id");
        return;
    }
    // update the columns one by one
    let result: string = "";
    // update firstName if available
    if (req.body.hasOwnProperty("firstName") && req.body.firstName.length > 0) {
        try {
            result += await Users.alterUser(req.params.id,"first_name", req.body.firstName);
        } catch(err) {
            res.status(500).send(`Internal Server Error: ${err}`);
            return;
        }

    }
    // update lastName if available
    if (req.body.hasOwnProperty("lastName") && req.body.lastName.length > 0) {
        try {
            result += await Users.alterUser(req.params.id, "last_name", req.body.lastName);
        } catch(err) {
            res.status(500).send(`Internal Server Error: ${err}`);
            return;
        }
    }
    // update email if available
    if (req.body.hasOwnProperty("email") && validEmailFormat.test(req.body.email)) {
        try {
            const isUsedEmail = Users.ifUsedEmail(req.body.email);
            if (isUsedEmail) {
                result += "Can't update email which is already in use"
            } else {
                result += await Users.alterUser(req.params.id, "email", req.body.email);
            }
        } catch(err) {
            res.status(500).send(`Internal Server Error: ${err}`);
            return;
        }
    }
    // update password if available
    if (req.body.hasOwnProperty("password") && req.body.password.length > 0) {
        if (req.body.hasOwnProperty("currentPassword") && req.body.currentPassword.length > 0) {
            try {
                const isValidCurrentPassword = Users.ifValidPassword(req.params.id, req.body.currentPassword);
                if (isValidCurrentPassword) {
                    result += await Users.alterUserPassword(req.params.id, req.body.password);
                } else {
                    result += "Can't update password. The current password is not valid."
                }
            } catch(err) {
                res.status(500).send(`Internal Server Error: ${err}`);
                return;
            }
        } else {
            result += "Can't update password. The current password is needed."
        }
    }
};


export { readUser, createUser, loginUser, logoutUser, updateUser }
