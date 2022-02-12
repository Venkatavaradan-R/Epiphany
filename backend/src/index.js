const app = require("express")();
const pinataSDK = require("@pinata/sdk");
const fs = require("fs");
const cors = require("cors");
const multer = require("multer");

const { apiKey, apiSecret } = require("./keys.js");

const uploadDest = multer({ dest: "uploads/" });
const port = 8080;

// middleware
app.use(cors());
app.options("*", cors());
app.use(express.json({ limit: "50mb" }));
app.use(
  express.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 })
);

const pinata = pinataSDK(apiKey, apiSecret);

app.get("/ping", (req, res) => {
  res.send("pong");
});

app.post("/pinToIpfs", uploadDest.single("image"), async (req, res) => {
  if (!req.file) {
    res.status(500).json({ status: false, msg: "no file provided" });
  } else {
    const { fileName } = req.file;
    await pinata
      .testAuthentication()
      .catch((err) => res.status(500).json(JSON.stringify(err)));

    const readableStreamForFile = fs.createReadStream(`./uploads/${fileName}`);
    const options = {
      pinataMetadata: {
        name: req.body.title.replace(/\s/g, "-"),
        keyvalues: {
          description: req.body.description,
        },
      },
    };

    const pinnedFile = await pinata.pinFileToIPFS(
      readableStreamForFile,
      options
    );
    if (pinnedFile.IpfsHash && pinnedFile.PinSize > 0) {
      // remove file from server
      fs.unlinkSync(`./uploads/${fileName}`);
      // pins metadata
      const metadata = {
        name: req.body.title,
        description: req.body.description,
        symbol: "TUT",
        artifactUri: `ipfs://${pinnedFile.IpfsHash}`,
        displayUri: `ipfs://${pinnedFile.IpfsHash}`,
        creators: [req.body.creator],
        thumbnailUri: "https://tezostaquito.io/img/favicon.png",
        is_transferable: true,
        shouldPreferSymbol: false,
      };

      const pinnedMetadata = await pinata.pinJSONToIPFS(metadata, {
        pinataMetadata: {
          name: "TUT-metadata",
        },
      });

      if (pinnedMetadata.IpfsHash && pinnedMetadata.PinSize > 0) {
        res.status(200).json({
          status: true,
          imageHash: pinnedFile.IpfsHash,
          metadataHash: pinnedMetadata.IpfsHash,
        });
      } else {
        res
          .status(500)
          .json({ status: false, msg: "metadata were not pinned" });
      }
    } else {
      res.status(500).json({ status: false, msg: "file was not pinned" });
    }
  }
});

app.listen(port, () => console.log("listening on port", port));
