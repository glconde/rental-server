// web and smart contract server
// glc 2025
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { createBlock, getBlocks } = require("./blockchain");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// variables
let tenantWallet = 1000;
let landlordWallet = 0;
let contractActive = false;
let rentAmount = 100;
let securityDeposit = 200;
let ticks = 0;

app.post("/start-contract", (req, res) => {
  if (contractActive) return res.json({ error: "Contract already active" });

  tenantWallet -= securityDeposit;
  contractActive = true;
  ticks = 0;
  createBlock({ event: "Contract Started", tenantWallet, landlordWallet }, "0");
  res.json({ success: true, tenantWallet, landlordWallet });
});

setInterval(() => {
  // check if contract is active or not
  if (!contractActive) return;

  ticks++;
  tenantWallet -= rentAmount;
  landlordWallet += rentAmount;
  createBlock({ event: `Rent paid`, tenantWallet, landlordWallet }, "prev");

  if (ticks >= 6) {
    // number of ticks for demo, 6months simulation, 1 month every 5 secs
    tenantWallet += securityDeposit;
    contractActive = false;
    createBlock(
      { event: "Contract Ended", tenantWallet, landlordWallet },
      "prev"
    );
  }
}, 5000); // every 5 secs (1 sec = 1000milliseconds)

// get local variable values for wallets
app.get("/wallets", (req, res) => {
  res.json({ tenantWallet, landlordWallet });
});

// access blockchain data from sqlite
app.get("/blockchain", (req, res) => {
  getBlocks((blocks) => res.json({ blocks }));
});

app.listen(5000, () => console.log("Server running on port 5000"));
