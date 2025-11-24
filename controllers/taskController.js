const db = require('../db');

exports.readTasks = async (req, res) => {
    const { listId } = 1;
    const userId = 1; // Assuming user ID is available in req.user
    const query = 'SELECT * FROM task';

    try {
        const [results] = await db.promise().query(query);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(results));
    } catch (error) {
        console.error('Error fetching tasks:', error);

        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: 'Internal server error' }));
    }
};

exports.createTask = async (req, res) => {
    const query1 = 'INSERT INTO task (list_id, user_create, task_title, task_description, due_date, due_time) VALUES (?, ?, ?, ?, ?, ?)';
    const query2 = 'INSERT INTO task_permission (user_id, list_id, task_id, permission_type) VALUES (?, ?, ?, ?)';
    
    let body = "";
    req.on("data", (chunk) => {
        body += chunk.toString();
    });
    
    req.on("end", async () => {
        try {
            const { title, description, dueDate, dueTime} = JSON.parse(body);
            const [result] = await db.promise().query(query1, [1, 1, title, description, dueDate, dueTime]);
            const taskID = result.insertId;
    
            await db.promise().query(query2, [1, 1, taskID, 'owner']);
    
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: 'Task created successfully', taskId: taskID }));
        } catch (error) {
            console.error('Error creating task:', error);
    
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: 'Internal server error' }));
        }
    });
}

exports.updateTask = async (req, res) => {
    const query = 'UPDATE task SET task_title = ?, task_description = ?, due_date = ?, due_time = ? WHERE task_id = ?';
    
    let body = "";
    req.on("data", (chunk) => {
        body += chunk.toString();
    });

    req.on("end", async () => {
        try {
            const { title, description, dueDate, dueTime } = JSON.parse(body);
            const { taskId } = req.params;
            const [result] = await db.promise().query(query, [title, description, dueDate, dueTime, taskId]);

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: 'Task updated successfully' }));
        } catch (error) {
            console.error('Error updating task:', error);

            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: 'Internal server error' }));
        }
    });
};

exports.deleteTask = async (req, res) => {
    const query = 'DELETE FROM task WHERE task_id = ?';
    
    let body = "";
    req.on("data", (chunk) => {
        body += chunk.toString();
    });

    req.on("end", async () => {
        try {
            const { taskId } = req.params;
            const [result] = await db.promise().query(query, [taskId]);

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: 'Task deleted successfully' }));
        } catch (error) {
            console.error('Error deleting task:', error);

            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: 'Internal server error' }));
        }
    });
};