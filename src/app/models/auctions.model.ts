import {getPool} from "../../config/db";
import Logger from "../../config/logger";


const getAuctions = async (query: string): Promise<any> => {
    Logger.info(`Getting selected auctions`);
    const conn = await getPool().getConnection();
    const [result] = await conn.query(query);
    conn.release();
    return result;
};

export { getAuctions }
