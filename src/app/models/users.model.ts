import {getPool} from "../../config/db";
import Logger from "../../config/logger";
import {OkPacket, ResultSetHeader, RowDataPacket} from "mysql2";

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

const signInUser = async (email: string, password: string): Promise<any> => {
  Logger.info(`Signing in user ${email} from the database`);
  const conn =await getPool().getConnection();
  const authToken:string = "test-token-v5"; // generate static token
  const passwordHash = password; // hash password
  let result;
  const query1 = 'select * from user where email=? and password=?';
  const [result1] = await conn.query(query1, [email, passwordHash]);
  if (result1.length === 0) {
    Logger.info("User not exists");
    result = result1;
  } else {
    const query2 = 'update user set auth_token = ? where email=? and password=?';
    await conn.query(query2, [authToken, email, password]);
    Logger.info("User exists. AuthToken updated.");
    [result] = await conn.query(query1, [email, passwordHash]);
  }
  conn.release();
  return result;
}

export {getOneUser, insertUser, signInUser}