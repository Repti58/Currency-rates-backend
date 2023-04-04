const express = require("express");
const needle = require("needle");
const cors = require("cors");
const convert = require("xml-js");
const app = express();
const currencyNames = require("./CurrencyNames");
const PORT = process.env.port || 3003;

let currencyDate;
let prevCurrencyDate;

const yesterdayDate = () => {
  if (currencyDate) {
    const date = new Date(currencyDate.split(".").reverse().join("."));
    const yesterdayDate = date.getDate() - 1;
    date.setDate(yesterdayDate);

    let day = String(date.getDate()).padStart(2, 0);

    let month = String(date.getMonth() + 1).padStart(2, 0);

    let year = date.getFullYear();

    return `${day}/${month}/${year}`;
  } else return undefined;
};

const getCurrency = async (props) => {
  let ratesDataToday;
  let ratesDataYesterday;

  // console.log("needle today req start");
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
      const currencyNominal = ratesDataToday[i].Nominal._text;
      const currencyPriceToday =
        ratesDataToday[i].Value._text.replace(",", ".") / currencyNominal;
      // console.log(currencyPriceToday);
      // console.log(
      //   `${ratesDataToday[i].CharCode._text} + ${currencyNominal} + ${currencyPriceToday}`
      // );
      const currencyPriceYesterday =
        ratesDataYesterday[i].Value._text.replace(",", ".") / currencyNominal;
      mergeTwoDatesData[1].push({
        id: String(i),
        currencyTicker: !ratesDataToday[i].CharCode
          ? undefined
          : ratesDataToday[i].CharCode._text,
        currencyCode: ratesDataToday[i]._attributes.ID,
        // currencyName: ratesDataToday[i].Name._text,
        currencyName: currencyNames(ratesDataToday[i].CharCode._text),
        // currencyNominal: ratesDataToday[i].Nominal._text,
        currencyPriceToday: currencyPriceToday.toFixed(3),
        currencyPriceYesterday: currencyPriceYesterday.toFixed(3),
        difference: (currencyPriceToday - currencyPriceYesterday).toFixed(3),
      });
    }
  }
  return mergeTwoDatesData;
};

// -----!!-----Get dynamic rates data for choosen currency
const getRatesDynamic = async (data) => {
  debugger;
  if (!data.dateStart) return "start date is empty";
  else if (!data.dateEnd) return "end date is empty";
  else if (!data.currencyName) return "currency name is empty";
  else {
    let currencyDynamicArray;
    let ratesDynamic = [];

    await needle(
      "get",
      `https://www.cbr.ru/scripts/XML_dynamic.asp?date_req1=${data.dateStart}&date_req2=${data.dateEnd}&VAL_NM_RQ=${data.currencyName}`,
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
        console.log("currencyDynamicArray", currencyDynamicArray);
        for (let i = 0; i < currencyDynamicArray.length; i++) {
          const currencyValue = currencyDynamicArray[i].Value._text.replace(
            ",",
            "."
          );
          const currencyNominal = currencyDynamicArray[i].Nominal._text;
          ratesDynamic.push([
            currencyDynamicArray[i]._attributes.Date,
            Number((currencyValue / currencyNominal).toFixed(2)),
          ]);
        }
      })
      .catch((err) => console.log("get dynamic", err));
    return ratesDynamic;
  }
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
  console.log("incoming request ratesDynamic");
  console.log(req.query);

  const ratesDynamic = await getRatesDynamic(req.query);
  // console.log(ratesDynamic);
  res.json(ratesDynamic);
});

app.get("/", async (req, res) => {
  debugger;
  // const data = await getCurrency(req.query.date);
  res.json("no request data");
});
