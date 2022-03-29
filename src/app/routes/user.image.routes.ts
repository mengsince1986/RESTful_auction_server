import {Express} from "express";
import {rootUrl} from "./base.routes"
import * as userImages from '../controllers/userImages.controller';
import * as Authenticate from '../middleware/authenticate';

module.exports = (app: Express) => {

    app.route(rootUrl + '/users/:id/image')
        .get(userImages.retrieveUserImage)
        .put(Authenticate.loginRequired, userImages.setUserImage);

};
