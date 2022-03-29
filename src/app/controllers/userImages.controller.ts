import {Request, Response} from "express";
import Logger from '../../config/logger';
import { UserAuthInfoRequest } from "../../types";
import * as UserImages from "../models/userImages.model";
const validImageTypes = ["image/png", "image/jpeg", "image/gif"];

const retrieveUserImage = async (req: Request, res: Response): Promise<void> => {
    Logger.http(`GET user's image`);
    // check if id is valid number
    let userId: string;
    if (isNaN(parseInt(req.params.id, 10))) {
        res.status(404).send("User ID is invalid");
        return;
    } else {
        userId = req.params.id;
    }
    try {
        const imageData = await UserImages.getUserImage(userId);
        if (imageData === null) {
            res.status(404).send('The user image is not available');
            return;
        } else {
            const image = imageData.image;
            const imageType = imageData.imageType;
            res.setHeader('Content-Type', imageType);
            res.status(200).send(image);
        }
    } catch (err) {
        if (!err.hasBeenLogged) Logger.error(err);
        res.statusMessage = 'Internal Server Error';
        res.status(500).send();
    }
};

const setUserImage = async (req: UserAuthInfoRequest, res: Response): Promise<void> => {
    Logger.http(`PUT user's image`);
    // check if id is valid number
    // check if the signed-in user id is the same with the request user id
    let userId: string;
    if (isNaN(parseInt(req.params.id, 10))) {
        res.status(400).send("User ID is invalid");
        return;
    } else if (parseInt(req.params.id, 10) !== parseInt(req.authenticatedUserId, 10)) {
        res.status(403).send("The current user cannot change the image of this user account");
        return;
    } else {
        userId = req.params.id;
    }
    // check if request content type is valid
    let imageType: string;
    if (validImageTypes.includes(req.header("Content-Type"))) {
        imageType = req.header("Content-Type");
    } else {
        res.status(400).send("The Content-Type of user image request is invalid.");
        return;
    }
    // check if image file is provided
    /*
    let image;
    if (Object.keys(req.body).length === 0) {
        res.status(400).send("Cannot find image file in Request");
        return;
    } else {
        image = req.body;
    }
    */
    const image = req.body;
    try {
        // check if user image is already created
        const createdUserImage = await UserImages.getUserImage(userId);
        // set or create user image
        await UserImages.insertUserImage(userId, image, imageType);
        // send response
        if (createdUserImage === null) {
            res.status(201).send("User image is created");
        } else {
            res.status(200).send("User image is updated");
        }
    } catch (err) {
        if (!err.hasBeenLogged) Logger.error(err);
        res.statusMessage = 'Internal Server Error';
        res.status(500).send();
    }
};

const deleteUserImage = async (req: UserAuthInfoRequest, res: Response): Promise<void> => {
    Logger.http(`DELETE user image`);
    // check if id is valid number
    // check if the signed-in user id is the same with the request user id
    let userId: string;
    if (isNaN(parseInt(req.params.id, 10))) {
        res.status(400).send("User ID is invalid");
        return;
    } else if (parseInt(req.params.id, 10) !== parseInt(req.authenticatedUserId, 10)) {
        res.status(403).send("The current user cannot remove the image of this user account");
        return;
    } else {
        userId = req.params.id;
    }
    try {
        // check if user image exists
        if (await UserImages.getUserImage(userId) === null) {
            res.status(200).send("User has no profile image");
            return;
        } else {
            await UserImages.removeUserImage(userId);
            res.status(200).send(`User image has been removed`);
        }
    } catch (err) {
        if (!err.hasBeenLogged) Logger.error(err);
        res.statusMessage = 'Internal Server Error';
        res.status(500).send();
    }
};

export { retrieveUserImage, setUserImage, deleteUserImage }