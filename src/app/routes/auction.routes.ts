import {Express} from "express";
import {rootUrl} from "./base.routes"
import * as auctions from '../controllers/auctions.controller';
import * as Authenticate from '../middleware/authenticate';

module.exports = (app: Express) => {

    app.route(rootUrl + '/auctions')
        .get(auctions.listAuctions)
        .post(Authenticate.loginRequired, auctions.createAuction);

    app.route(rootUrl + '/auctions/categories')
        .get(auctions.listCategories);

    app.route(rootUrl + '/auctions/:id')
        .get(auctions.listOneAuction);
};
