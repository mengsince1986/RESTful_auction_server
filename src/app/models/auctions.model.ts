import {getPool} from "../../config/db";
import Logger from "../../config/logger";

/*
const getAuctions = async (query: string): Promise<any> => {
    Logger.info(`Getting selected auctions`);
    const conn = await getPool().getConnection();
    const [result] = await conn.query(query);
    conn.release();
    return result;
};
*/

const getAuctions = async (startIndex: string|null, count: string|null, q: string|null, categoryIds: string|string[]|null,
                           sellerId: string|null, bidderId: string|null, sortBy: string|null): Promise<any> => {
    Logger.info(`Getting selected auctions`);
    const conn = await getPool().getConnection();
    // default query
    let query = "select " +
        "auctionId, title, reserve, sellerId, categoryId, sellerFirstName, sellerLastName, endDate, coalesce(numBids,0) as numBids, highestBid " +
        "from " +
        "(select auction.id as auctionId, title, description, reserve, seller_id as sellerId, category_id as categoryId, " +
        "first_name as sellerFirstName, last_name as sellerLastName, end_date as endDate " +
        "from auction left join user " +
        "on auction.seller_id = user.id) as t1 left join " +
        "(select auction_id, user_id, count(auction_id) as numBids, max(amount) as highestBid " +
        "from auction_bid group by auction_id) as t2 on t1.auctionId = t2.auction_id";
    // where query for q
    if (q !== null) {
        if (!query.includes(" where ")) {
            query += " where";
        } else {
            query += " and";
        }
        const qQuery = ` t1.title like "%${q}%" or t1.description like "%${q}%"`;
        query += qQuery;
    }
    // where query for categoryIds
    if (categoryIds !== null) {
        if (!query.includes(" where ")) {
            query += " where";
        } else {
            query += " and";
        }
        if (Array.isArray(categoryIds)) {
            let currentCategoryId = categoryIds[0];
            let categoryIdsQuery = ` categoryId = ${currentCategoryId}`;
            query += categoryIdsQuery;
            for (let i = 1; i < categoryIds.length; i++) {
                currentCategoryId = categoryIds[i];
                categoryIdsQuery = ` or categoryId = ${currentCategoryId}`;
                query += categoryIdsQuery;
            }
        } else {
            const categoryIdsQuery = ` categoryId = ${categoryIds}`;
            query += categoryIdsQuery;
        }
    }
    // where query for sellerId
    if (sellerId !== null) {
        if (!query.includes(" where ")) {
            query += " where";
        } else {
            query += " and";
        }
        const sellerIdQuery = ` t1.sellerId = ${sellerId}`;
        query += sellerIdQuery;
    }
    // where query for bidderId
    if (bidderId !== null) {
        if (!query.includes(" where ")) {
            query += " where";
        } else {
            query += " and";
        }
        const bidderIdQuery = ` t2.user_id = ${bidderId}`;
        query += bidderIdQuery;
    }
    // order query
    if (sortBy !== null) {
        let orderQuery = "";
        switch(sortBy) {
            case "ALPHABETICAL_ASC":
                orderQuery = " order by title asc";
                break;
            case "ALPHABETICAL_DESC":
                orderQuery = " order by title desc";
                break;
            case "CLOSING_SOON":
                orderQuery = " order by endDate asc";
                break;
            case "CLOSING_LAST":
                orderQuery = " order by endDate desc";
                break;
            case "BIDS_ASC":
                orderQuery = " order by highestBid asc";
                break;
            case "BIDS_DESC":
                orderQuery = " order by highestBid desc";
                break;
            case "RESERVE_ASC":
                orderQuery = " order by reserve asc";
                break;
            case "RESERVE_DESC":
                orderQuery = " order by reserve desc";
                break;
        }
        query += orderQuery;
    } else {
        const orderQuery = " order by endDate, auction_id asc";
        query += orderQuery;
    }
    // limit query for startIndex and count
    let offset: any = 0;
    let rowcount: any = 1844674407370955161;
    if (startIndex !== null) {
        offset = startIndex;
    }
    if (count !== null) {
        rowcount = count;
    }
    const startIndexQuery = ` limit ${offset}, ${rowcount}`;
    query += startIndexQuery;
    // send query to database
    const [result] = await conn.query(query);
    conn.release();
    return result;
};


export { getAuctions }
