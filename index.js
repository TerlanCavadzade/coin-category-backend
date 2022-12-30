let express = require("express");
let app = express();
let path = require("path");
let methodOverride = require("method-override");
let upload = require("express-fileupload");

const coins = require("./model/coin");

const mongoose = require("mongoose");
mongoose
  .connect("mongodb://localhost:27017/coins", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("CONNECTION OPEN!!!");
  })
  .catch((err) => {
    console.log("OH NO ERROR!!!!");
    console.log(err);
  });
mongoose.set("useFindAndModify", false);

app.use(express.static(path.join(__dirname, "public")));
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());
app.use(methodOverride("_method"));
app.use(upload());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use("/public/uploads", express.static("public/uploads"));

app.listen(3000, () => {
  console.log("listening on 3000");
});

//Add new Coin
app.post("/coins", async (req, res) => {
  try {
    const { name, category, description, features } = req.body;
    const hostUrl = req.protocol + "://" + req.get("host");
    const { firstPhoto, secondPhoto } = req.files;
    const firstUrl = hostUrl + uploadPhoto(firstPhoto, name);
    const secondUrl = hostUrl + uploadPhoto(secondPhoto, name);

    const newCoin = new coins({
      name,
      category,
      description,
      features: JSON.parse(features),
      photos: [firstUrl, secondUrl],
    });

    await newCoin.save();
    return res.status(200).json({
      message: "Saved Succesfully",
    });
  } catch (err) {
    return res.status(500).json({
      error: "server error",
    });
  }
});

function uploadPhoto(file, name) {
  const fileName = file.name;
  const underscore = fileName.replace(/ /g, "_");
  const underscoreName = name.replace(/ /g, "_");
  const filePath = `./public/uploads/${underscoreName}_${underscore}`;
  file.mv(filePath);
  return filePath.slice(1);
}

//Get Coin By Category
app.get("/coins/categories/:name", async (req, res) => {
  try {
    const { name } = req.params;
    const data = await coins
      .find({ category: name })
      .select("description name photos id");
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      error: "server error",
    });
  }
});

//Get Coin By Id
app.get("/coins/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await coins.findById(id);
    console.log(data);
    res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      error: "server error",
    });
  }
});

//search by name
app.get("/coins", async (req, res) => {
  try {
    const { name } = req.query;
    const data = await coins.find({ name });
    if (name === "") {
      const data = await coins.find();
      return res.status(200).json(data);
    }
    res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      message: "server error " + err,
    });
  }
});
