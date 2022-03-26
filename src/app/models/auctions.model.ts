import {getPool} from "../../config/db";
import Logger from "../../config/logger";


const getOneUser = async (id:number): Promise<any> => {
    Logger.info(`Getting user ${id} from the database`);
    const conn = await getPool().getConnection();
    const query = 'select * from user where id=?';
    const [result] = await conn.query(query, [ id ]);
    conn.release();
    return result;
};

export {}
