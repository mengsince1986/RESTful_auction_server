import {Express} from "express";
import {rootUrl} from "./base.routes"
import * as auctionImages from '../controllers/auctionImages.controller';
import * as Authenticate from '../middleware/authenticate';

module.exports = (app: Express) => {

    app.route(rootUrl + '/auctions/:id/image')
        .get(auctionImages.retrieveAuctionImage)
        .put(Authenticate.loginRequired, auctionImages.setAuctionImage);

};
