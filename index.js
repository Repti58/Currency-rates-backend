const express = require("express");
const needle = require("needle");
const cors = require("cors");
const convert = require("xml-js");
const app = express();
const PORT = process.env.port || 3003;

let currencyDate;
let prevCurrencyDate;
const yesterdayDate = () => {
  const date = new Date(currencyDate.split(".").reverse().join(","));
  let dd = date.getDate() - 1;
  if (dd < 10) dd = "0" + dd;

  let mm = date.getMonth() + 1;
  if (mm < 10) mm = "0" + mm;

  let yy = date.getFullYear();
  if (yy < 10) mm = "0" + yy;
  console.log(`yesterdayDate ${dd}/${mm}/${yy}`);
  return `${dd}/${mm}/${yy}`;
};

const getCurrency = async (props) => {     
  debugger;
  let ratesDataToday;
  let ratesDataYesterday;

  await needle("get", `http://www.cbr.ru/scripts/XML_daily.asp?date_req=${props}`, {
    parse_response: false,
  })
    .then((response) => {
      response = convert.xml2js(response.body, {
        compact: true,
        spaces: 1,
      });
      console.log(`response>>>>>>`, response);
      ratesDataToday = response.ValCurs.Valute;
      currencyDate = response.ValCurs._attributes.Date;  
      console.log(`currencyDate`, currencyDate);
      console.log("ratesDataToday>>>>>>>>", ratesDataToday);   
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
      console.log("ratesDataYesterday>>>>>>>>", ratesDataYesterday);
    })
    .catch((err) => console.log("get yesterday", err));

  const merge = [[]];  
  merge.unshift({ currencyDate, prevCurrencyDate });

  for (let i = 0; i < ratesDataToday.length; i++) {
    merge[1].push({
      // currencyDate,
      currencyTicker: ratesDataToday[i].CharCode._text,
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
          Number(ratesDataToday[i].Value._text.replace(",", ".")) -
          Number(ratesDataYesterday[i].Value._text.replace(",", "."))
        ).toFixed(2)
      ),
    });
  }
  return merge;
};

// const getCurrencyForDate = async (props) => {
//   console.log(props);
//   let currencyForDate;
//   await needle(
//     "get",
//     `http://www.cbr.ru/scripts/XML_daily.asp?date_req=${props}`,
//     {
//       parse_response: false,
//     }
//   )
//     .then((response) => {
//       response = convert.xml2js(response.body, {
//         compact: true,
//         spaces: 1,
//       });
//       currencyForDate = response.ValCurs.Valute;
//       currencyDate = response.ValCurs._attributes.Date;
//     })
//     .catch((err) => console.log("get yesterday", err));

//   const currencyForDateRebuild = [[]];
//   currencyForDateRebuild.unshift({ currencyDate })
//   for (let i = 0; i < currencyForDate.length; i++) {
//     currencyForDateRebuild[1].push({
//       currencyTicker: currencyForDate[i].CharCode._text,
//       currencyName: currencyForDate[i].Name._text,
//       currencyNominal: currencyForDate[i].Nominal._text,
//       currencyPriceToday: String(
//         Number(currencyForDate[i].Value._text.replace(",", ".")).toFixed(2) 
//       ),
//       currencyPriceYesterday: "",
//       difference: "",
//     });
//   }
//   return currencyForDateRebuild;
// };

app.use(cors());

app.listen(PORT, () => {
  console.log(`Server starting on port ${PORT}`);
});

app.get("/api", async (req, res) => {
  console.log("get request");
  const data = await getCurrency(req.query.date);
  console.log("data >>>>>>>>>>> ", JSON.stringify(data));
  res.json(data);
});

// app.get("/date_request", async (req, res) => {
//   console.log("get request CurrencyForDate", req.query.date);
//   const data = await getCurrencyForDate(req.query.date);
//   console.log("data >>>>>>>>>>> ", JSON.stringify(data));
//   res.json(data);
// }); 
