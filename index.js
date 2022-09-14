const express = require("express");
const needle = require("needle");
const cors = require("cors");
const convert = require("xml-js");
const app = express();
const PORT = process.env.port || 3003;

let currencyDate;
let prevCurrencyDate;
const yesterdayDate = () => {
  console.log('yesterdayDate func start');
  if (currencyDate) {
    const date = new Date(currencyDate.split(".").reverse().join("."));
    // console.log(`date>>>>>>`, date);
    const yesterdayDate = date.getDate() - 1;
    date.setDate(yesterdayDate);
    console.log('yesterday date func sucsessful>>>>>>>>>>', date.toLocaleDateString());
    return date.toLocaleDateString();
  } else return undefined;
};

const getCurrency = async (props) => {
  debugger;
  let ratesDataToday;
  let ratesDataYesterday;

  console.log('needle today req start');
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
        spaces: 1,
      });
      // console.log(`response get today>>>>>>>>>>`, response.ValCurs.Valute[5]);
      ratesDataToday = response.ValCurs.Valute;
      currencyDate = response.ValCurs._attributes.Date;
      console.log(`currencyDate`, currencyDate);
      // console.log("ratesDataToday>>>>>>>>", ratesDataToday);
      console.log('needle today req sucsessfull');
    })
    .catch((err) => console.log("get today", err));

  console.log('needle yesterday req start');
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
      // console.log('response get yesterday>>>>>>>>>>', response.ValCurs.Valute[5]);
      
      ratesDataYesterday = response.ValCurs.Valute;
      prevCurrencyDate = response.ValCurs._attributes.Date;
      // console.log("ratesDataYesterday>>>>>>>>", ratesDataYesterday);
      console.log('needle yesterday req sucsessfull');
    })
    .catch((err) => console.log("get yesterday", err));

  const merge = [[]];
  merge.unshift({ currencyDate, prevCurrencyDate });
  if (ratesDataToday) {
    console.log("ratesDataToday>>>>>>>>>>>>", ratesDataToday[0]);
    for (let i = 0; i < ratesDataToday.length; i++) {
      // console.log(
      //   "ratesDataToday[i].CharCode>>>>>>>>>>",
      //   ratesDataToday[i].CharCode
      // );
      merge[1].push({
        id: String(i),
        currencyTicker: !ratesDataToday[i].CharCode
          ? undefined
          : ratesDataToday[i].CharCode._text,
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
  return merge;
};

app.use(cors());

app.listen(PORT, () => {
  console.log(`Server starting on port ${PORT}`);
});

app.get("/api", async (req, res) => {
  console.log("get request");
  const data = await getCurrency(req.query.date);
  // console.log("data >>>>>>>>>>> ", JSON.stringify(data)); 
  console.log("data >>>>>>>>>>> ", JSON.stringify(data[0])); 
  res.json(data);
});
