const taskController = require('../controllers/taskController');
const signInController = require('../controllers/signInController');
const userAuth = require('../middlewares/userAuth');

const auth = (handler) => {
    return (req, res) => userAuth(req, res, () => handler(req, res));
};

const route = {
    "/auth/signin": {
        POST: signInController,
    },
    "/list/:listId/tasks": {
        GET: auth(taskController.readTasks),
        POST: auth(taskController.createTask),
    },
    "/list/:listId/tasks/:taskId": {
        PUT: auth(taskController.updateTask),
        DELETE: auth(taskController.deleteTask),
    },
    notFound: (req, res) => {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("404 Not Found");
    },
}

module.exports = route;