const http = require("http"); // module gốc của Node.js, cho phép tạo web server mà không cần Express
const url = require("url"); // giúp phân tích cú pháp URL (tách pathname, query string, v.v.)
require('dotenv').config();
const routes = require('./routes/mainRoute');

const PORT = process.env.PORT || 4000;

// Tạo server HTTP
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true); // url.parse(req.url, true) sẽ tách URL ra thành
  const query = parsedUrl.query; // query: ví dụ { page: "1", sort: "asc" }
  const path = parsedUrl.pathname; // pathname: ví dụ /users/5
  const method = req.method.toUpperCase(); // req.method.toUpperCase() → chuyển get → GET

  // Nếu routes có key khớp chính xác path (ví dụ /users) → lấy ra function tương ứng với method (vd: routes['/users']['GET'])
  let handler = routes[path] && routes[path][method];

  if (!handler) {
    // Lấy danh sách các route có chứa : (ví dụ /list/:id/tasks/:taskId)
    const routeKeys = Object.keys(routes).filter((key) => key.includes(":"));

    // So khớp bằng regex
    const matchedKey = routeKeys.find((key) => {
      // replacing each segment of the key that starts with a colon (:)
      const regex = new RegExp(`^${key.replace(/:[^/]+/g, "([^/]+)")}$`);
      return regex.test(path);
      // Với route key /list/:id/tasks/:taskId, nó tạo regex: ^/list/([^/]+)/tasks/([^/]+)$
      // Sau đó kiểm tra xem URL /list/1/tasks/14 có khớp không
    });

    // Nếu khớp: lấy giá trị params
    if (matchedKey) {
      const regex = new RegExp(`^${matchedKey.replace(/:[^/]+/g, "([^/]+)")}$`);
      const dynamicParams = regex.exec(path).slice(1);
      const dynamicHandler = routes[matchedKey][method];

      const paramKeys = matchedKey
        .match(/:[^/]+/g)
        .map((key) => key.substring(1));

      const params = dynamicParams.reduce(
        (acc, val, i) => ({ ...acc, [paramKeys[i]]: val }),
        {}
      );

      req.params = params;

      handler = dynamicHandler;
    }
  }

  // Nếu không tìm thấy handler nào → Dự phòng: dùng route notFound để trả về 404
  if (!handler) {
    handler = routes.notFound;
  }

  // Gắn query string vào req
  req.query = {};

  for (const key in query) {
    req.query[key] = query[key];
  }

  handler(req, res);
});

server.listen(PORT, () => console.log(`server listening on port: ${PORT}`));