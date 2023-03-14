const express = require("express");
const needle = require("needle");
const cors = require("cors");
const convert = require("xml-js");
const app = express();
const PORT = process.env.port || 3003;

let currencyDate;
let prevCurrencyDate;

const yesterdayDate = () => {
  if (currencyDate) {
    const date = new Date(currencyDate.split(".").reverse().join("."));
    const yesterdayDate = date.getDate() - 1;
    date.setDate(yesterdayDate);

    let dd = date.getDate();
    if (dd < 10) dd = "0" + dd;

    let mm = date.getMonth() + 1;
    if (mm < 10) mm = "0" + mm;

    let yy = date.getFullYear();
    if (yy < 10) mm = "0" + yy;

    return `${dd}/${mm}/${yy}`;
  } else return undefined;
};

const getCurrency = async (props) => {
  debugger;
  let ratesDataToday;
  let ratesDataYesterday;

  console.log("needle today req start");
  await needle(
    "get",
    `http://www.cbr.ru/scripts/XML_daily.asp?date_req=${props}`,
    {
      parse_response: false,
    }
  )
    .then((response) => {
      response = convert.xml2js(response.body, {
        compact: true,
        mergeAttrs: true,
        spaces: 1,
      });
      // console.dir(response, {depth: null})
      ratesDataToday = response.ValCurs.Valute;
      currencyDate = response.ValCurs._attributes.Date;
    })
    .catch((err) => console.log("get today", err));

  await needle(
    "get",
    `http://www.cbr.ru/scripts/XML_daily.asp?date_req=${yesterdayDate()}`,
    {
      parse_response: false,
    }
  )
    .then((response) => {
      response = convert.xml2js(response.body, {
        compact: true,
        spaces: 1,
      });

      ratesDataYesterday = response.ValCurs.Valute;
      prevCurrencyDate = response.ValCurs._attributes.Date;
    })
    .catch((err) => console.log("get yesterday", err));

  const mergeTwoDatesData = [[]];
  mergeTwoDatesData.unshift({ currencyDate, prevCurrencyDate });
  if (ratesDataToday) {
    for (let i = 0; i < ratesDataToday.length; i++) {
      mergeTwoDatesData[1].push({
        id: String(i),
        currencyTicker: !ratesDataToday[i].CharCode
          ? undefined
          : ratesDataToday[i].CharCode._text,
        currencyCode: ratesDataToday[i]._attributes.ID,
        currencyName: ratesDataToday[i].Name._text,
        currencyNominal: ratesDataToday[i].Nominal._text,
        currencyPriceToday: String(
          Number(ratesDataToday[i].Value._text.replace(",", ".")).toFixed(2)
        ),
        currencyPriceYesterday: String(
          Number(ratesDataYesterday[i].Value._text.replace(",", ".")).toFixed(2)
        ),
        difference: String(
          (
            Number(ratesDataToday[i].Value._text.replace(",", ".")).toFixed(2) -
            Number(ratesDataYesterday[i].Value._text.replace(",", ".")).toFixed(
              2
            )
          ).toFixed(2)
        ),
      });
    }
  }
  return mergeTwoDatesData;
};

// -----!!-----Get dynamic rates data for choosen currency
const getRatesDynamic = async (props) => {
  debugger;
  let currencyDynamicArray;
  await needle(
    "get",
    `https://www.cbr.ru/scripts/XML_dynamic.asp?date_req1=${props.dateStart}&date_req2=${props.dateEnd}&VAL_NM_RQ=${props.currencyName}`,
    {
      parse_response: false,
    }
  )
    .then((response) => {
      debugger;
      response = convert.xml2js(response.body, {
        compact: true,
        spaces: 1,
      });
      currencyDynamicArray = response.ValCurs.Record;
    })
    .catch((err) => console.log("get today", err));
  let ratesDynamic = [];
  for (let i = 0; i < currencyDynamicArray.length; i++) {
    ratesDynamic.push([
      currencyDynamicArray[i]._attributes.Date,
      Number(
        Number(currencyDynamicArray[i].Value._text.replace(",", ".")).toFixed(2)
      ),
    ]);
  }
  return ratesDynamic;
};

app.use(cors());

app.listen(PORT, () => {
  console.log(`Server starting on port ${PORT}`);
});

app.get("/api", async (req, res) => {
  debugger;
  console.log(`incoming request ${req.query.date}`);
  const data = await getCurrency(req.query.date);
  // console.log(data);
  res.json(data);
});

app.get("/ratesDynamic", async (req, res) => {
  debugger;
  const ratesDynamic = await getRatesDynamic(req.query);
  // console.log(ratesDynamic);
  res.json(ratesDynamic);
});

app.get("/", async (req, res) => {
  debugger;
  // const data = await getCurrency(req.query.date);
  res.json("no request data");
});
