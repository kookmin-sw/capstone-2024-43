import { prettifyObject, requestAladin } from "./bookAPI/aladin.js";
import mysql from 'mysql2/promise';
import db_config from './db-config.json' assert { type: "json" };

(async () => {
    const connection = await mysql.createConnection({
        host:db_config.host,
        user:db_config.user,
        password:db_config.password,
        database:db_config.database,
    });
    await connection.connect();
    

    await requestAladin("search", "삼체").then(async res => {
        for await (let book of res.item) {
            prettifyObject(book);

            const isNovel = book => book.categoryName.includes("국내도서>소설/시/희곡");
            let filter = isNovel(book) ? "문학" : "비문학";

            console.log([book.isbn13, book.title, book.publisher, book.author, book.link, filter]);
            await connection.query(
                `INSERT IGNORE INTO books (isbn, name, publisher, author, url, filter)
                VALUES (?, ?, ?, ?, ?, ?);`,
                [book.isbn13, book.title, book.publisher, book.author, book.link, filter]
            )
        }
    });
    
    connection.destroy();

})();