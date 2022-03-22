import {Request, Response} from "express";

export default (req:Request, res:Response, next: () => void) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE');
    next();
};

/*
exports.loginRequired = async (req:Request, res:Response, next: () => void) => {
    const token: any = req.header('X-Authorization');

    try {
        const result = await findUserIdByToken(token);
        if (result === null) {
            res.statusMessage = 'Unauthorized';
            res.status(401)
                .send();
        } else {
            req.authenticatedUserId = result.user_id.toString();
            next();
        }
    } catch (err) {
        if (!err.hasBeenLogged) console.error(err);
        res.statusMessage = 'Internal Server Error';
        res.status(500)
            .send();
    }
};*/
