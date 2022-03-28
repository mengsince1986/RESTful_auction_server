import {getPool} from "../../config/db";
import Logger from "../../config/logger";
import fs from "mz/fs";
// tslint:disable-next-line:no-var-requires
const mime = require('mime-types');
const auctionImageDir = "./storage/images/";

const getAuctionImage = async (auctionId: string): Promise<any> => {
    Logger.info(`Getting image for an auction`);
    const conn = await getPool().getConnection();
    const query = "select * from auction where id = ?";
    const [auction] = await conn.query(query, [auctionId]);
    conn.release();
    if (auction.length === 0) {
        return null;
    } else {
        const imageFileName:string = auction[0].image_filename;
        const imageFilePath:string = auctionImageDir + imageFileName;
        if (await fs.exists(imageFilePath)) {
            const image = await fs.readFile(imageFilePath);
            const imageType = mime.lookup(imageFileName);
            return {image, imageType};
        } else {
            return null;
        }
    }
};

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

export {getAuctionImage}
