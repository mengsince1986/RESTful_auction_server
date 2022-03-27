import {Request, Response} from "express";
import Logger from '../../config/logger';
import * as Auctions from '../models/auctions.model';
import * as Authenticate from '../models/authentication.model';
import { UserAuthInfoRequest } from "../../types";

const listAuctions = async (req: Request, res: Response): Promise<void> => {
    Logger.http(`GET information about auctions}`);
    let startIndex: string|null;
    if (typeof req.query.startIndex === "string") {
        startIndex = req.query.startIndex;
    } else {
        startIndex = null;
    }
    let count: string|null;
    if (typeof req.query.count === "string") {
        count = req.query.count;
    } else {
        count = null;
    }
    let q: string|null;
    if (typeof req.query.q === "string") {
        q = req.query.q as string;
    } else {
        q = null;
    }
    let categoryIds: string|string[]|null;
    if (typeof req.query.categoryIds === "string") {
        categoryIds = req.query.categoryIds;
    } else if (Array.isArray(req.query.categoryIds)) {
        categoryIds = req.query.categoryIds as string[];
    } else {
        categoryIds = null;
    }
    let sellerId: string|null;
    if (typeof req.query.sellerId === "string") {
        sellerId = req.query.sellerId;
    } else {
        sellerId = null;
    }
    let bidderId: string|null;
    if (typeof req.query.bidderId === "string") {
        bidderId = req.query.bidderId;
    } else {
        bidderId = null;
    }
    let sortBy: string|null;
    if (typeof req.query.sortBy === "string") {
        sortBy = req.query.sortBy;
    } else {
        sortBy = null;
    }
    try {
        const auctionData = await Auctions.getAuctions(startIndex, count, q, categoryIds, sellerId, bidderId, sortBy);
        const result = {count: auctionData.length, auctions: auctionData}
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(JSON.stringify(result));
    } catch (err) {
        if (!err.hasBeenLogged) Logger.error(err);
        res.statusMessage = 'Internal Server Error';
        res.status(500).send();
    }
};

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


const createAuction = async (req: UserAuthInfoRequest, res: Response): Promise<void> => {
    Logger.http(`POST create a new auction`);
    // check title
    let title: string;
    if (typeof req.body.title === "string" && req.body.title.length > 0) {
        title = req.body.title;
    } else {
        res.status(400).send('A tile is required');
        return;
    }
    // check description
    let description: string;
    if (typeof req.body.description === "string" && req.body.description.length > 0) {
        description = req.body.description;
    } else {
        res.status(400).send('A description is required');
        return;
    }
    // check reserve
    let reserve: number;
    if (req.body.reserve === undefined) {
        reserve = 1;
    } else if (typeof req.body.reserve === "number") {
        reserve = req.body.reserve;
    } else {
        res.status(400).send('reserve should be a number');
        return;
    }
    // check categoryId
    let categoryId: number;
    if (typeof req.body.categoryId === "number") {
        try {
            const isValidCategoryId = await Auctions.ifValidCategoryId(req.body.categoryId);
            if (isValidCategoryId) {
                categoryId = req.body.categoryId;
            } else {
                res.status(400).send('categoryId does not exist');
                return;
            }
        } catch (err) {
            if (!err.hasBeenLogged) Logger.error(err);
            res.statusMessage = 'Internal Server Error';
            res.status(500).send();
            return;
        }
    } else {
        res.status(400).send('categoryId is invalid');
        return;
    }
    // check endDate
    let endDate: string;
    if (typeof req.body.endDate === "string" && typeof Date.parse(req.body.endDate) === "number") {
        if (Date.parse(req.body.endDate) > Date.now()) {
            endDate = req.body.endDate;
        } else {
            res.status(400).send('The endDate should be in the future');
            return;
        }
    } else {
        res.status(400).send('The endDate is invalid');
        return;
    }
    // check sellerId
    let sellerId: string;
    if (req.body.sellerId === undefined || req.body.sellerId.toString() === req.authenticatedUserId) {
        sellerId =  req.authenticatedUserId;
    } else {
        res.status(400).send('sellerId should be the signed-in id');
        return;
    }
    try {
        const insertResult = await Auctions.insertAuction(title, description, reserve, categoryId, endDate, sellerId);
        const result = {auctionId: insertResult.insertId};
       // const result = insertResult;
        res.setHeader('Content-Type', 'application/json');
        res.status(201).send(JSON.stringify(result));
    } catch (err) {
        if (!err.hasBeenLogged) Logger.error(err);
        res.statusMessage = 'Internal Server Error';
        res.status(500).send();
    }
};

const listCategories = async (req: Request, res: Response): Promise<void> => {
    Logger.http(`GET information of all auction categories`);
    try {
        const result = await Auctions.getCategories();
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(result);
    } catch (err) {
        if (!err.hasBeenLogged) Logger.error(err);
        res.statusMessage = 'Internal Server Error';
        res.status(500).send();
    }
};

const deleteAuction = async (req: UserAuthInfoRequest, res: Response): Promise<void> => {
    Logger.http(`DELETE one auction`);
    // check if id is valid number
    let auctionId: string;
    if (isNaN(parseInt(req.params.id, 10))) {
        res.status(404).send("Auction id is invalid");
        return;
    } else {
        auctionId = req.params.id;
    }
    // check if auction of id belongs to current signed-in user
    // check if bid has been placed
    const currentUserId = parseInt(req.authenticatedUserId, 10);
    try {
        const toRemovedAuction = await Auctions.getOneAuction(auctionId);
        if (Object.keys(toRemovedAuction).length === 0) {
            res.status(404).send("The auction does not exist.");
            return;
        } else if (toRemovedAuction[0].sellerId !== currentUserId) {
            res.status(403).send("Can't remove auction that doesn't belong to the current user.");
            return;
        } else if (await Auctions.ifBidPlaced(auctionId)) {
            res.status(403).send("Can't remove auction at which has been placed bid.");
            return;
        }else {
            const result = await Auctions.removeOneAuction(auctionId);
            res.status(200).send(`Auction ${auctionId} has been removed`);
        }
    } catch (err) {
        if (!err.hasBeenLogged) Logger.error(err);
        res.statusMessage = 'Internal Server Error';
        res.status(500).send();
    }
};

/*
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
 */

export { listAuctions, listOneAuction, createAuction, listCategories, deleteAuction }
