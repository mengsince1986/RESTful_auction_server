import {getPool} from "../../config/db";
import Logger from "../../config/logger";

const getBids = async (id: string): Promise<any> => {
    Logger.info(`Getting bids for an auction`);
    const conn = await getPool().getConnection();
    const query = "select user_id as bidderId, first_name as firstName, last_name as lastName, timestamp, amount " +
        "from auction_bid left join user on auction_bid.user_id = user.id " +
        `where auction_id = ${id} ` +
        "order by amount desc, timestamp desc";
    const [result] = await conn.query(query);
    conn.release();
    return result;
};

/*
const getOneAuction = async (id: string): Promise<any> => {
    Logger.info(`Getting ONE selected auction`);
    const conn = await getPool().getConnection();
    // default query
    let query = "select " +
        "auctionId, title, description, categoryId, sellerId, sellerFirstName, sellerLastName, reserve, coalesce(numBids,0) as numBids, highestBid, endDate " +
        "from " +
        "(select auction.id as auctionId, title, description, reserve, seller_id as sellerId, category_id as categoryId, " +
        "first_name as sellerFirstName, last_name as sellerLastName, end_date as endDate " +
        "from auction left join user " +
        "on auction.seller_id = user.id) as t1 left join " +
        "(select auction_id, user_id, count(auction_id) as numBids, max(amount) as highestBid " +
        "from auction_bid group by auction_id) as t2 on t1.auctionId = t2.auction_id";
    // where query for id
    const idQuery = ` where auctionId = ${id}`;
    query += idQuery;
    const [result] = await conn.query(query);
    conn.release();
    return result;
};
*/

export {getBids}
