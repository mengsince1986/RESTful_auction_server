import {getPool} from "../../config/db";
import Logger from "../../config/logger";
// tslint:disable-next-line:no-var-requires
const fs = require('mz/fs')
// tslint:disable-next-line:no-var-requires
const mime = require('mime-types');
const userImageDir = "./storage/images/";

const getUserImage = async (userId: string): Promise<any> => {
    Logger.info(`Getting user image`);
    const conn = await getPool().getConnection();
    const query = "select * from user where id = ?";
    const [user] = await conn.query(query, [userId]);
    conn.release();
    if (user.length === 0) {
        return null;
    } else {
        const imageFileName:string = user[0].image_filename;
        const imageFilePath:string = userImageDir + imageFileName;
        if (await fs.exists(imageFilePath)) {
            const image = await fs.readFile(imageFilePath);
            const imageType = mime.lookup(imageFileName);
            return {image, imageType};
        } else {
            return null;
        }
    }
};

const insertUserImage = async (userId: string, image: any, imageType: string): Promise<any> => {
    Logger.info(`Updating user image`);
    const conn = await getPool().getConnection();
    let userImageExtension = imageType.split("/")[1];
    if (userImageExtension === "jpeg") {
        userImageExtension  = "jpg";
    }
    const userImageName = `user_${userId}.${userImageExtension}`;
    const userImagePath = userImageDir + userImageName;
    // Store image on server
    await fs.writeFile(userImagePath, image);
    // Update dataset with new image name
    const query = "update user set image_filename = ? where id = ?";
    await conn.query(query, [userImageName, userId]);
    conn.release();
};

export { getUserImage, insertUserImage }
