const express = require("express");
const needle = require("needle");
const cors = require("cors");
const convert = require("xml-js");
const app = express();
const PORT = process.env.port || 3003;

const yesterdayDate = () => {
  const date = new Date();
  let dd = date.getDate() - 1;
  if (dd < 10) dd = "0" + dd;

  let mm = date.getMonth() + 1;
  if (mm < 10) mm = "0" + mm;

  let yy = date.getFullYear();
  if (yy < 10) mm = "0" + yy;
  console.log(`${dd}/${mm}/${yy}`);
  return `${dd}/${mm}/${yy}`;
};

const getCurrency = async () => {
  debugger;
  let ratesDataToday;
  let ratesDataYesterday;

  await needle(
    "get",
    `http://www.cbr.ru/scripts/XML_daily.asp?date_req=${yesterdayDate()}`,
    {
      parse_response: false,
    }
  ).then((response) => {
    response = convert.xml2js(response.body, {
      compact: true,
      spaces: 1,
    });
    ratesDataYesterday = response.ValCurs.Valute;
  });

  await needle("get", "http://www.cbr.ru/scripts/XML_daily.asp", {
    parse_response: false,
  })
    .then((response) => {
      response = convert.xml2js(response.body, {
        compact: true,
        spaces: 1,
      });
      ratesDataToday = response.ValCurs.Valute;
      console.log("ratesDataToday>>>>>>>>", ratesDataToday);
    })
    .catch((err) => console.log(err));

  const merge = [];

  for (let i = 0; i < ratesDataToday.length; i++) {
    merge.push({
      currencyTicker: ratesDataToday[i].CharCode._text,
      currencyName: ratesDataToday[i].Name._text,
      currencyNominal: ratesDataToday[i].Nominal._text,
      currencyPriceToday: String(
        Number(ratesDataToday[i].Value._text.replace(",", ".")).toFixed(2)
      ),
      currencyPriceYesterday: String(
        Number(ratesDataYesterday[i].Value._text.replace(",", ".")).toFixed(2)
      ),
    });
  }
  return merge;
};

app.use(cors());

app.listen(PORT, () => {
  console.log(`Server starting on port ${PORT}`);
});

app.get("/api", async (req, res) => {
  console.log("get request");
  const data = await getCurrency();
  console.log("data >>>>>>>>>>> ", JSON.stringify(data));
  res.json(data);
});
