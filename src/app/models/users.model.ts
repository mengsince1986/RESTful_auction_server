import {getPool} from "../../config/db";
import Logger from "../../config/logger";
import { uid } from 'rand-token';

// tslint:disable-next-line:no-var-requires
const bcrypt = require ('bcrypt');
const saltRounds = 10;

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
  const query1 = 'select * from user where email=?';
  const [existedUser] = await conn.query(query1, [email]);
  if (existedUser.length > 0) {
    conn.release();
    return null;
  } else {
    const passwordHash = bcrypt.hashSync(password, saltRounds);
    const query = 'insert into user (email, first_name, last_name, password) values (?, ?, ? ,?)';
    const [result] = await conn.query( query, [ email, firstName, lastName, passwordHash ] );
    conn.release();
    return result;
  }
};

const signInUser = async (email: string, password: string): Promise<any> => {
  Logger.info(`Signing in user ${email} from the database`);
  const conn =await getPool().getConnection();
  const query1 = 'select * from user where email=?';
  const [existedUser] = await conn.query(query1, [email]);
  if (existedUser.length === 0) {
    Logger.info("Email doesn't match any user");
    conn.release();
    return null;
  }
  const existedPassword = existedUser[0].password;
  if (!bcrypt.compareSync(password, existedPassword)) {
    Logger.info("Wrong password.");
    conn.release();
    return null;
  }
  const authToken:string = uid(32); // generate token with rand-token
  const query2 = 'update user set auth_token = ? where email=?';
  await conn.query(query2, [authToken, email]);
  Logger.info("Signed in. AuthToken updated.");
  const [result] = await conn.query(query1, [email]);
  conn.release();
  return result;
}

export {getOneUser, insertUser, signInUser}