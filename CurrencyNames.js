module.exports = function (ticker) {
  switch (ticker) { 
    case "AUD":
      return "Австралийский доллар";
    case "AZN":
      return "Азербайджанский манат";
    case "GBP":
      return "Фунт стерлингов Соединенного королевства";
    case "AMD":
      return "Армянский драм";
    case "BYN":
      return "Белорусский рубль";
    case "BGN":
      return "Болгарский лев";
    case "BRL":
      return "Бразильский реал";
    case "HUF":
      return "Венгерский форинт";
    case "VND":
      return "Вьетнамский донг";
    case "HKD":
      return "Гонконгский доллар";
    case "GEL":
      return "Грузинский лари";
    case "DKK":
      return "Датская крона";
    case "AED":
      return "Дирхам ОАЭ";
    case "USD":
      return "Доллар США";
    case "EUR":
      return "Евро";
    case "EGP":
      return "Египетский фунт";
    case "INR":
      return "Индийская рупия";
    case "IDR":
      return "Индонезийская рупия";
    case "KZT":
      return "Казахстанский тенге";
    case "CAD":
      return "Канадский доллар";
    case "QAR":
      return "Катарский риал";
    case "KGS":
      return "Киргизский сом";
    case "CNY":
      return "Китайский юань";
    case "MDL":
      return "Молдавский лей";
    case "NZD":
      return "Новозеландский доллар";
    case "NOK":
      return "Норвежская крона";
    case "PLN":
      return "Польский злотый";
    case "RON":
      return "Румынский лей";
    case "XDR":
      return "СДР (специальные права заимствования)";
    case "SGD":
      return "Сингапурский доллар";
    case "TJS":
      return "Таджикский сомони";
    case "THB":
      return "Таиландский бат";
    case "TRY":
      return "Турецкая лира";
    case "TMT":
      return "Новый туркменский манат";
    case "UZS":
      return "Узбекский сум";
    case "UAH":
      return "Украинская гривна";
    case "CZK":
      return "Чешская крона";
    case "SEK":
      return "Шведская крона";
    case "CHF":
      return "Швейцарский франк";
    case "RSD":
      return "Сербский динар";
    case "ZAR":
      return "Южноафриканский рэнд";
    case "KRW":
      return "Вон Республики Корея";
    case "JPY":
      return "Японская иена";
    default:
      return "-";
  }
};
