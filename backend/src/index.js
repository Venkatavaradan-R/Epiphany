const app = require("express")();

// middleware
app.use(cors());
app.options("*", cors());

const port = 8080;
const { apiKey, apiSecret } = require("./config.js");

app.get("/ping", (req, res) => {
  res.send("pong");
});

app.listen(port, () => console.log("listening on port", port));
