const express = require("express");
const needle = require("needle");
const cors = require("cors");
const axios = require("axios");
const convert = require("xml-js");
const { response } = require("express");
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
  return(`${dd}/${mm}/${yy}`);
};

const getCurrencyDataToday = async () => {
  console.log("getCurrencyData>>>>>>>>>>>>> ");

  const curData = await needle(
    "get",
    "http://www.cbr.ru/scripts/XML_daily.asp",
    {
      compressed: true,
      content_type: true,
      parse_response: false,
      decode_response: true,
    }
  ).then((response) => {
    const convertedData = convert.xml2js(response.body, {
      compact: true,
      spaces: 1,
    });
    console.log(convertedData);
    return convertedData;
  });
  return curData;
};

const getCurrencyDataYesterday = async () => {
  const curData = await needle(
    "get",
    `http://www.cbr.ru/scripts/XML_daily.asp?date_req=${yesterdayDate()}`,
    {
      compressed: true,
      content_type: true,
      parse_response: false,
      decode_response: true,
    }
  ).then((response) => {

    const convertedData = convert.xml2js(response.body, {
      compact: true,
      spaces: 1,
    });
    console.log(convertedData);
    return convertedData;
  });

  return curData;
};

app.use(cors());

app.listen(PORT, () => {
  console.log(`Server starting on port ${PORT}`);
});

app.get("/today", async (req, res) => {
  console.log("get request");
  const data = await getCurrencyDataToday();
  console.log("data >>>>>>>>>>> ", JSON.stringify(data));
  const data2 = "bla";
  //   res.setEncoding('utf8');
  res.json(data);
});

app.get("/yesterday", async (req, res) => {
  console.log("get request");
  const data = await getCurrencyDataYesterday();
  console.log("data >>>>>>>>>>> ", JSON.stringify(data));
  const data2 = "bla";
  //   res.setEncoding('utf8');
  res.json(data);
});
