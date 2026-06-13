import express from "express";
import cors from "cors";
import axios from "axios";
import https from "https";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3002;

let cache = {
  search: null,
  companies: [],
};

const httpsAgent = new https.Agent({
  pfx: fs.readFileSync(
    "./certs/Certifikat_SokPaVar_A00494_2025-10-06 13-14-52Z.pfx",
  ),
  passphrase: process.env.PFX_PASSWORD,
});

app.use(cors());
app.use(express.json());

app.post("/api/companies", async (req, res) => {
  try {
    const { search, page = 1, pageSize = 20 } = req.body;

    if (!search || search.trim().length < 3) {
      return res.json({
        companies: [],
        total: 0,
        page,
        pageSize,
      });
    }

    let companies;

    if (cache.search === search) {
      companies = cache.companies;
    } else {
      const response = await axios.post(
        "https://privateapi.scb.se/nv0101/v1/sokpavar/api/Je/HamtaForetag",
        {
          Företagsstatus: "1",
          Registreringsstatus: "1",
          variabler: [
            {
              Variabel: "Namn",
              Operator: "Innehaller",
              Varde1: search,
              Varde2: "",
            },
          ],
        },
        {
          httpsAgent,
        }
      );

      companies = response.data;

      cache.search = search;
      cache.companies = companies;
    }

    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    res.json({
      companies: companies.slice(start, end),
      total: companies.length,
      page,
      pageSize,
    });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({
      error: error.response?.data || error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
