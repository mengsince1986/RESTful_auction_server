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

const ifOwnAuction = async (userId: string, auctionId: string): Promise<any> => {
    Logger.info(`Checking if user is the seller of the auction`);
    const conn = await getPool().getConnection();
    const query = "select * from auction where id = ? and seller_id = ?";
    const [result] = await conn.query(query, [auctionId, userId]);
    conn.release();
    return result.length > 0;
};

const getHighestBid = async (auctionId: string): Promise<any> => {
    Logger.info(`Getting the highest bid of the auction`);
    const conn = await getPool().getConnection();
    const query = "select auction_id, max(amount) as highest_bid from auction_bid where auction_id = ? group by auction_id";
    const [highestBid] = await conn.query(query, [auctionId]);
    let result: number = 0;
    if (highestBid.length > 0) {
        result = highestBid[0].highest_bid;
    } else {
        // if no bid available, the highest bid is the reserve
        const reserveQuery = "select id as auction_id, reserve from auction where id = ?";
        const [auctionReserve] = await conn.query(reserveQuery, [auctionId]);
        result = auctionReserve[0].reserve;
    }
    conn.release();
    return result;
};

const placeBid = async (auctionId: string, amount: number, userId: string): Promise<any> => {
    Logger.info(`Placing a new bid for the auction`);
    const conn = await getPool().getConnection();
    const query = "insert into auction_bid (amount, auction_id, user_id) values (?, ?, ?)";
    const result = await conn.query(query, [amount, auctionId, userId]);
    conn.release();
    return result;
};

export {getBids, ifOwnAuction, getHighestBid, placeBid}
