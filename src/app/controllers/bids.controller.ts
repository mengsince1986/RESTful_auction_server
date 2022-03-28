import {Request, Response} from "express";
import Logger from '../../config/logger';
import * as Bids from '../models/bids.model';
import { UserAuthInfoRequest } from "../../types";
import * as Auctions from "../models/auctions.model";

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

const createBid = async (req: UserAuthInfoRequest, res: Response): Promise<void> => {
    Logger.http(`Post a new bid`);
    // check if id is valid number
    let auctionId: string;
    if (isNaN(parseInt(req.params.id, 10))) {
        res.status(404).send("Auction id is invalid");
        return;
    } else {
        auctionId = req.params.id;
    }
    // check if auction available
    try {
        const isOpenAuction = await Auctions.getOneAuction(auctionId);
        if (isOpenAuction.length < 1) {
            res.status(400).send('The auction is not available');
            return;
        } else {
            // check if user's own auction
            const currentUserId = req.authenticatedUserId;
            const isOwnAuction = await Bids.ifOwnAuction(currentUserId, auctionId);
            if (isOwnAuction) {
                res.status(403).send('Cannot place bid on own auction.');
                return;
            } else {
                // check if amount is valid
                let amount: number;
                if (req.body.amount === undefined) {
                    res.status(400).send('No bid amount is found');
                    return;
                } else if (typeof req.body.amount !== "number") {
                    res.status(403).send('The bid amount is invalid');
                    return;
                } else {
                   // check if bid amount is higher than the highest bid
                    const highestBid = await Bids.getHighestBid(auctionId);
                    if (req.body.amount <= highestBid) {
                        res.status(403).send('The bid amount should be higher than the latest bid');
                        return;
                    } else {
                        amount = req.body.amount;
                        // able to bid now
                        await Bids.placeBid(auctionId, amount, currentUserId);
                        res.status(201).send("Bid is placed");
                    }
                }
            }
        }
    } catch (err) {
        if (!err.hasBeenLogged) Logger.error(err);
        res.statusMessage = 'Internal Server Error';
        res.status(500).send();
    }
};

/*
const listOneAuction = async (req: Request, res: Response): Promise<void> => {
    Logger.http(`Get information about one auction`);
    // check if id is valid number
    let auctionId: string;
    if (isNaN(parseInt(req.params.id, 10))) {
        res.status(404).send("Auction id is invalid");
        return;
    } else {
        auctionId = req.params.id;
    }

    try {
        const auctionData = await Auctions.getOneAuction(auctionId);
        if (auctionData.length < 1) {
            res.status(404).send('The auction does not exit');
        } else {
            const result = auctionData[0];
            res.setHeader('Content-Type', 'application/json');
            res.status(200).send(JSON.stringify(result));
        }
    } catch (err) {
        if (!err.hasBeenLogged) Logger.error(err);
        res.statusMessage = 'Internal Server Error';
        res.status(500).send();
    }
};
*/


export { listBids, createBid}
