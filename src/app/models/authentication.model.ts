import {getPool} from "../../config/db";
import Logger from "../../config/logger";

const findUserIdByToken = async (token:string): Promise<any> => {
    Logger.info(`checking user token in the database`);
    const conn = await getPool().getConnection();
    const query = 'select * from user where auth_token=?';
    const [result] = await conn.query(query, [ token ]);
    conn.release();
    return result;
};

export {findUserIdByToken}