import {getPool} from "../../config/db";
import Logger from "../../config/logger";

/*
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
*/

export {}
