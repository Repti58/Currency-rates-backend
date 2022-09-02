const express = require("express");
const cors = require("cors");
const axios = require("axios");
const convert = require("xml-js");
const { response } = require("express");
const app = express();
const PORT = process.env.port || 3003;



const getCurrencyData = async () => {
  console.log("getCurrencyData>>>>>>>>>>>>> ");
  const curData = await axios
    .request({
      method: "GET",
      url: "http://www.cbr.ru/scripts/XML_daily.asp",
      responseType: "arraybuffer",
      responseEncoding: "binary",
    })
    // .get("http://www.cbr.ru/scripts/XML_daily.asp", {params: {responseEncoding: 'windows-1251'}})

    .then((response) => {
      response = response.data;
      //   response.setEncoding("utf8");
      console.log("response >>>>> ", response);
      return convert.xml2js(response, { compact: true, spaces: 1 });
      // console.log('convert to json>>>>>>>>>>>>>>> ', convertedData);
    })
    .catch((error) => {
      console.log(`error >>>>`, error.response);
    });
  return curData;
};

app.use(cors());

app.listen(PORT, () => {
  console.log(`Server starting on port ${PORT}`);
});

app.get("/api", async (req, res) => {
  console.log("get request");
  const data = await getCurrencyData();
  console.log("data >>>>>>>>>>> ", JSON.stringify(data));
  const data2 = "bla";
  //   res.setEncoding('utf8');
  res.json(data);
});
