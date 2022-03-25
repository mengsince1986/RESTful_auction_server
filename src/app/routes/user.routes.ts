import {Express} from "express";
import {rootUrl} from "./base.routes"
import * as users from '../controllers/users.controller';
import * as Authenticate from '../middleware/authenticate';

module.exports = (app: Express) => {

    app.route(rootUrl + '/users/:id')
        .get(users.readUser)
        .patch(Authenticate.loginRequired, users.updateUser);

    app.route(rootUrl + '/users/register')
        .post(users.createUser);

    app.route(rootUrl + '/users/login')
        .post(users.loginUser);

    app.route(rootUrl + '/users/logout')
        .post(Authenticate.loginRequired, users.logoutUser);
};
