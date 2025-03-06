const express = require("express");
const app = express();

// Middleware functions
function m1(req, res, next) {
    console.log("Running middleware 1..");
    next();
}

function m2(req, res, next) {
    console.log("Running middleware 2..");
    next();
}

function m3(req, res, next) {
    console.log("Running middleware 3..");
    next();
}

// Use middlewares in correct order
app.use(m1);
app.use(m3);
app.use(m2); // Move m2 here so it applies to all routes

// Routes
app.get("/", (req, res) => {
    console.log("Running /");
    res.send("Home");
});

app.get("/about", (req, res) => {
    console.log("Running About");
    res.send("About Page");
});

// Start the server
const PORT = 5477;
app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});
