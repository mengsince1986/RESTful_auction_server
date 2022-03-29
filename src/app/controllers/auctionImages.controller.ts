import {Request, Response} from "express";
import Logger from '../../config/logger';
import { UserAuthInfoRequest } from "../../types";
import * as AuctionImages from "../models/auctionImages.model";
import * as Auctions from "../models/auctions.model";
import fs from "mz/fs";
const validImageTypes = ["image/png", "image/jpeg", "image/gif"];

const retrieveAuctionImage = async (req: Request, res: Response): Promise<void> => {
    Logger.http(`GET auction's hero image`);
    // check if id is valid number
    let auctionId: string;
    if (isNaN(parseInt(req.params.id, 10))) {
        res.status(404).send("Auction id is invalid");
        return;
    } else {
        auctionId = req.params.id;
    }
    try {
        const imageData = await AuctionImages.getAuctionImage(auctionId);
        if (imageData === null) {
            res.status(404).send('The image is not available');
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

const setAuctionImage = async (req: UserAuthInfoRequest, res: Response): Promise<void> => {
    Logger.http(`PUT auction's hero image`);
    // check if id is valid number
    let auctionId: string;
    if (isNaN(parseInt(req.params.id, 10))) {
        res.status(400).send("Auction id is invalid");
        return;
    } else {
        auctionId = req.params.id;
    }
    // check if request content type is valid
    let imageType: string;
    if (validImageTypes.includes(req.header("Content-Type"))) {
        imageType = req.header("Content-Type");
    } else {
        res.status(400).send("The auction image  Request Content-Type is invalid.");
        return;
    }
    // check if image is provided
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
        // check if the auction exist
        // check if the signed-in user is the seller of the auction
        const currentUserId: number = parseInt(req.authenticatedUserId, 10);
        const toUpdateAuction = await Auctions.getOneAuction(auctionId);
        if (toUpdateAuction.length < 1) {
            res.status(404).send("The auction does not exist");
            return;
        } else if (toUpdateAuction[0].sellerId !== currentUserId) {
            res.status(403).send("The current user cannot add image to this auction");
            return;
        } else {
            // check if hero image is already created
            const createdAuctionImage = await AuctionImages.getAuctionImage(auctionId);
            // set or create hero image
            await AuctionImages.insertAuctionImage(auctionId, image, imageType);
            // send response
            if (createdAuctionImage === null) {
                res.status(201).send("Auction image is created");
            } else {
                res.status(200).send("Image is updated");
            }
        }
    } catch (err) {
        if (!err.hasBeenLogged) Logger.error(err);
        res.statusMessage = 'Internal Server Error';
        res.status(500).send();
    }
};

export { retrieveAuctionImage, setAuctionImage }