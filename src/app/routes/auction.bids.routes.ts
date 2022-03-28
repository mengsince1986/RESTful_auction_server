import {Express} from "express";
import {rootUrl} from "./base.routes"
import * as bids from '../controllers/bids.controller';
import * as Authenticate from '../middleware/authenticate';

module.exports = (app: Express) => {

    app.route(rootUrl + '/auctions/:id/bids')
        .get(bids.listBids)
        .post(Authenticate.loginRequired, bids.createBid);

};
