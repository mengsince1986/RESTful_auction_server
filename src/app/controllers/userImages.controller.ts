import {Request, Response} from "express";
import Logger from '../../config/logger';
import { UserAuthInfoRequest } from "../../types";
import * as UserImages from "../models/userImages.model";
import * as Users from "../models/users.model";
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
    let userId: string;
    if (isNaN(parseInt(req.params.id, 10))) {
        res.status(400).send("User ID is invalid");
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
    let image;
    if (Object.keys(req.body).length === 0) {
        res.status(400).send("Cannot find image file in Request");
        return;
    } else {
        image = req.body;
    }
    try {
        // check if the user exist
        // check if the signed-in user id is the same with the request use id
        const currentUserId: number = parseInt(req.authenticatedUserId, 10);
        const toUpdateUser = await Users.getOneUser(parseInt(userId, 10));
        Logger.info(`Current user id: ${currentUserId}`);
        Logger.info(`to update user id: ${toUpdateUser[0].id}`);
        if (toUpdateUser.length < 1) {
            res.status(400).send("The user id does not exist");
            return;
        } else if (toUpdateUser[0].id !== currentUserId) {
            res.status(403).send("The current user cannot add image to this user account");
            return;
        } else {
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
        }
    } catch (err) {
        if (!err.hasBeenLogged) Logger.error(err);
        res.statusMessage = 'Internal Server Error';
        res.status(500).send();
    }
};

export { retrieveUserImage, setUserImage }