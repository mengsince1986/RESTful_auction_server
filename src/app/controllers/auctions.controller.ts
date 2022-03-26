import {Request, Response} from "express";
import Logger from '../../config/logger';
import * as Auctions from '../models/auctions.model';
import * as Authenticate from '../models/authentication.model';
import { UserAuthInfoRequest } from "../../types";

const listAuctions = async (req: Request, res: Response): Promise<void> => {
    Logger.http(`GET information about auctions}`);
    const query = "select " +
        "auctionId, title, reserve, sellerId, categoryId, sellerFirstName, sellerLastName, endDate, coalesce(numBids,0), highestBid " +
        "from " +
        "(select auction.id as auctionId, title, reserve, seller_id as sellerId, category_id as categoryId, " +
        "first_name as sellerFirstName, last_name as sellerLastName, end_date as endDate " +
        "from auction left join user " +
        "on auction.seller_id = user.id) as t1 left join " +
        "(select auction_id, user_id, count(auction_id) as numBids, max(amount) as highestBid from auction_bid group by auction_id) as t2 " +
        "on t1.auctionId = t2.auction_id order by endDate, auction_id asc"
    try {
        const auctionData = await Auctions.getAuctions(query);
        const result = {auctions: auctionData, count: auctionData.length}
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(JSON.stringify(result));
    } catch (err) {
        if (!err.hasBeenLogged) Logger.error(err);
        res.statusMessage = 'Internal Server Error';
        res.status(500).send();
    }
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


export { listAuctions }
