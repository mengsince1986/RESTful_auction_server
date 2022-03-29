import {getPool} from "../../config/db";
import Logger from "../../config/logger";
// tslint:disable-next-line:no-var-requires
const fs = require('mz/fs')
// tslint:disable-next-line:no-var-requires
const mime = require('mime-types');
const auctionImageDir = "./storage/images/";

const getAuctionImage = async (auctionId: string): Promise<any> => {
    Logger.info(`Getting image for an auction`);
    const conn = await getPool().getConnection();
    const query = "select * from auction where id = ?";
    const [auction] = await conn.query(query, [auctionId]);
    conn.release();
    // check if auction exists
    // check if auction image exists
    if (auction.length === 0 || auction[0].image_filename === null) {
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

const insertAuctionImage = async (auctionId: string, image: any, imageType: string): Promise<any> => {
    Logger.info(`Updating image for an auction`);
    const conn = await getPool().getConnection();
    let auctionImageExtension = imageType.split("/")[1];
    if (auctionImageExtension === "jpeg") {
        auctionImageExtension = "jpg";
    }
    const auctionImageName = `auction_${auctionId}.${auctionImageExtension}`;
    const auctionImagePath = auctionImageDir + auctionImageName;
    // Store image on server
    await fs.writeFile(auctionImagePath, image);
    // Update dataset with new image name
    const query = "update auction set image_filename = ? where id = ?";
    await conn.query(query, [auctionImageName, auctionId]);
    conn.release();
};

export { getAuctionImage, insertAuctionImage }
