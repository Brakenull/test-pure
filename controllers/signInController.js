const db = require('../db');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = async (req, res) => {
    // Body parsing
    let body = "";
    req.on("data", (chunk) => {
        body += chunk.toString();
    });

    req.on("end", async () => {
        const { email, password } = JSON.parse(body);

        if (!email || !password) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: 'Vui lòng điền đầy đủ thông tin.' }));
            return;
        }

        db.query('SELECT * FROM user WHERE email = ?', [email], async (err, results) => {
            if (err) {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ message: 'Lỗi máy chủ, vui lòng thử lại sau.' }));
                return;
            }

            if (results.length === 0) {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ message: 'Email hoặc mật khẩu không đúng.' }));
                return;
            }

            const user = results[0];
            const isMatch = await bcryptjs.compare(password, user.password);
            if (!isMatch) {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ message: 'Email hoặc mật khẩu không đúng.' }));
                return;
            }

            const token = jwt.sign({ id: user.id, username: user.username, password: user.password }, process.env.JWT_SECRET);

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: 'Đăng nhập thành công.', token, id: user.id }));
        });
    });
}