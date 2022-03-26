import {Express} from "express";
import {rootUrl} from "./base.routes"
import * as auctions from '../controllers/auctions.controller';
import * as Authenticate from '../middleware/authenticate';

module.exports = (app: Express) => {

    app.route(rootUrl + '/auctions')
        .get(auctions.listAuctions);
};
