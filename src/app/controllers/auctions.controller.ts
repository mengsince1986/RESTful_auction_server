import {Request, Response} from "express";
import Logger from '../../config/logger';
import * as Auctions from '../models/auctions.model';
import * as Authenticate from '../models/authentication.model';
import { UserAuthInfoRequest } from "../../types";
/*
const listAuctions = async (req: Request, res: Response): Promise<void> => {
    Logger.http(`GET information about auctions}`);
    // default query
    let query = "select " +
        "auctionId, title, reserve, sellerId, categoryId, sellerFirstName, sellerLastName, endDate, coalesce(numBids,0) as numBids, highestBid " +
        "from " +
        "(select auction.id as auctionId, title, description, reserve, seller_id as sellerId, category_id as categoryId, " +
        "first_name as sellerFirstName, last_name as sellerLastName, end_date as endDate " +
        "from auction left join user " +
        "on auction.seller_id = user.id) as t1 left join " +
        "(select auction_id, user_id, count(auction_id) as numBids, max(amount) as highestBid " +
        "from auction_bid group by auction_id) as t2 on t1.auctionId = t2.auction_id"
    // where query for q
    if (req.query.q !== undefined) {
        if (!query.includes(" where ")) {
            query += " where";
        } else {
            query += " and";
        }
        const qQuery = ` t1.title like "%${req.query.q}%" or t1.description like "%${req.query.q}%"`;
        query += qQuery;
    }
    // where query for categoryIds
    if (req.query.categoryIds !== undefined) {
        if (!query.includes(" where ")) {
           query += " where";
        } else {
            query += " and";
        }
        if (Array.isArray(req.query.categoryIds)) {
            let currentCategoryId = req.query.categoryIds[0];
            let categoryIdsQuery = ` categoryId = ${currentCategoryId}`;
            query += categoryIdsQuery;
            for (let i = 1; i < req.query.categoryIds.length; i++) {
                currentCategoryId = req.query.categoryIds[i];
                categoryIdsQuery = ` or categoryId = ${currentCategoryId}`;
                query += categoryIdsQuery;
            }
        } else {
            const categoryIdsQuery = ` categoryId = ${req.query.categoryIds}`;
            query += categoryIdsQuery;
        }
    }
    // where query for sellerId
    if (req.query.sellerId !== undefined) {
        if (!query.includes(" where ")) {
            query += " where";
        } else {
            query += " and";
        }
        const sellerIdQuery = ` t1.sellerId = ${req.query.sellerId}`;
        query += sellerIdQuery;
    }
    // where query for bidderId
    if (req.query.bidderId !== undefined) {
        if (!query.includes(" where ")) {
            query += " where";
        } else {
            query += " and";
        }
        const bidderIdQuery = ` t2.user_id = ${req.query.bidderId}`;
        query += bidderIdQuery;
    }
    // order query
    if (req.query.sortBy !== undefined) {
        let orderQuery = "";
        switch(req.query.sortBy) {
            case "ALPHABETICAL_ASC":
                orderQuery = " order by title asc";
                break;
            case "ALPHABETICAL_DESC":
                orderQuery = " order by title desc";
                break;
            case "CLOSING_SOON":
                orderQuery = " order by endDate asc";
                break;
            case "CLOSING_LAST":
                orderQuery = " order by endDate desc";
                break;
            case "BIDS_ASC":
                orderQuery = " order by highestBid asc";
                break;
            case "BIDS_DESC":
                orderQuery = " order by highestBid desc";
                break;
            case "RESERVE_ASC":
                orderQuery = " order by reserve asc";
                break;
            case "RESERVE_DESC":
                orderQuery = " order by reserve desc";
                break;
        }
        query += orderQuery;
    } else {
        const orderQuery = " order by endDate, auction_id asc";
        query += orderQuery;
    }
    // limit query for startIndex and count
    let offset: any = 0;
    let rowcount: any = 1844674407370955161;
    if (req.query.startIndex !== undefined) {
        offset = req.query.startIndex;
    }
    if (req.query.count !== undefined) {
        rowcount = req.query.count;
    }
    const startIndexQuery = ` limit ${offset}, ${rowcount}`;
    query += startIndexQuery;
    try {
        const auctionData = await Auctions.getAuctions(query);
        const result = {count: auctionData.length, auctions: auctionData}
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(JSON.stringify(result));
    } catch (err) {
        if (!err.hasBeenLogged) Logger.error(err);
        res.statusMessage = 'Internal Server Error';
        res.status(500).send();
    }
}
*/

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
    // default query
   /* let query = "select " +
        "auctionId, title, description, categoryId, sellerId, sellerFirstName, sellerLastName, reserve, coalesce(numBids,0) as numBids, highestBid, endDate " +
        "from " +
        "(select auction.id as auctionId, title, description, reserve, seller_id as sellerId, category_id as categoryId, " +
        "first_name as sellerFirstName, last_name as sellerLastName, end_date as endDate " +
        "from auction left join user " +
        "on auction.seller_id = user.id) as t1 left join " +
        "(select auction_id, user_id, count(auction_id) as numBids, max(amount) as highestBid " +
        "from auction_bid group by auction_id) as t2 on t1.auctionId = t2.auction_id"
    // where param for id
    if (isNaN(parseInt(req.params.id, 10))) {
        res.status(404).send("Auction id is invalid");
        return;
    }
    const idQuery = ` where auctionId = ${req.params.id}`;
    query += idQuery;
    try {
        const auctionData = await Auctions.getAuctions(query);
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
    } */
};


const createAuction = async (req: Request, res: Response): Promise<void> => {
    Logger.http(`POST create a new auction`);
}

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

export { listAuctions, listOneAuction, createAuction }
