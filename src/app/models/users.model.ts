import {getPool} from "../../config/db";
import Logger from "../../config/logger";
// import {OkPacket, ResultSetHeader, RowDataPacket} from "mysql2";

const getOneUser = async (id:number): Promise<any> => {
  Logger.info(`Getting user ${id} from the database`);
  const conn = await getPool().getConnection();
  const query = 'select * from user where id=?';
  const [result] = await conn.query(query, [ id ]);
  conn.release();
  return result;
};

const insertUser = async (firstName: string, lastName: string, email: string, password: string): Promise<any> => {
  Logger.info(`Adding user ${lastName} to the database`);
  const conn = await getPool().getConnection();
  const query = 'insert into user (email, first_name, last_name, password) values (?, ?, ? ,?)';
  const [result] = await conn.query( query, [ email, firstName, lastName, password ] );
    conn.release();
  return result;
};

export {getOneUser, insertUser}