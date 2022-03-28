import {Request, Response} from "express";
import Logger from '../../config/logger';
import { UserAuthInfoRequest } from "../../types";
import * as AuctionImages from "../models/auctionImages.model";

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

/*
const listBids = async  (req: Request, res: Response): Promise<void> => {
    Logger.http(`Get information about bids for one auction`);
    // check if id is valid number
    let auctionId: string;
    if (isNaN(parseInt(req.params.id, 10))) {
        res.status(404).send("Auction id is invalid");
        return;
    } else {
        auctionId = req.params.id;
    }
    try {
        const bidsData = await Bids.getBids(auctionId);
        if (bidsData.length < 1) {
            res.status(404).send('No bids available');
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).send(JSON.stringify(bidsData));
        }
    } catch (err) {
        if (!err.hasBeenLogged) Logger.error(err);
        res.statusMessage = 'Internal Server Error';
        res.status(500).send();
    }
};
*/

export { retrieveAuctionImage }