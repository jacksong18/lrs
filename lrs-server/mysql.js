getUserInfo();

async function getUserInfo() {
    var mysql = require('mysql');

    let con = await connectDB(mysql);
    let sql = "set names 'utf8'";
    await queryDB(con, sql);
    let token = "1bd0fe6aa0756b578ee132ad959946f0";
    sql = "SELECT username, avatar_path FROM  `user_info` WHERE token = '" + token + "';";
    let result = await queryDB(con, sql);
    console.log(result);
    if (result.length > 0) {
        io.emit('get user info', { username: result[0].username, avatar_path: result[0].avatar_path });
    }
    await closeDB(con);
}

function connectDB(mysql, callback) {
    return new Promise(function(resolve, reject) {
        let con = mysql.createConnection({
            host: "localhost",
            user: "lrs",
            password: "65843517",
            database: "lrs"
        });
        con.connect(function(err) {
            if (err) {
                reject(err);
            }
        });
        resolve(con);
    });
}

function queryDB(con, sql) {
    return new Promise(function(resolve, reject) {
        con.query(sql, function (err, result, fields) {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    });
}

function closeDB(con) {
    return new Promise(function(resolve, reject) {
        con.end();
        resolve();
    });
}