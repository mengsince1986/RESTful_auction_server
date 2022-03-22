import {getPool} from "../../config/db";
import Logger from "../../config/logger";
// import {OkPacket, ResultSetHeader, RowDataPacket} from "mysql2";

const getOneUser = async (id:number): Promise<any> => {
  Logger.info(`Getting user ${id} from the database`);
  const conn = await getPool().getConnection();
  const query = 'select * from user where id=?';
  const [ rows ] = await conn.query(query, [ id ]);
  conn.release();
  return rows;
};

export {getOneUser}