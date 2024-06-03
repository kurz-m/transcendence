const express = require('express');
const path = require('path');

const app = express();

app.use("/static", express.static(path.resolve(__dirname, "html", "static")));

app.get("/*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "html", "index.html"));
});

app.listen(process.env.PORT || 5501, () => console.log ("Server is running..."));
