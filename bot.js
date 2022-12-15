const TelegramBot = require('node-telegram-bot-api');
const express = require('express')
const bodyParser = require('body-parser');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

require('dotenv').config();

const token = process.env.TELEGRAM_TOKEN;
let bot;

bot = new TelegramBot(token, {
  polling: true
});


// Matches "/link-telegram"
bot.onText(/\/link_wallet/, (msg, match) => {
  bot.sendMessage(msg.chat.id, `<b>Please enter a phone number </b>`, {parse_mode: 'HTML'});
});

// Matches "/link-telegram {text}"
bot.onText(/\/link_wallet (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const data = match[1];

  //console.log(`${process.env.WALLET_API_URL}/link-telegram/?phone=${data}&telegram_token=${msg.from.id}&api_token=${process.env.SECRET_KEY}`)

  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open( "GET", `${process.env.WALLET_API_URL}/link-telegram/?phone=${data}&telegram_token=${msg.from.id}&api_token=${process.env.SECRET_KEY}`, false ); // false for synchronous request
  xmlHttp.send( null );
  const jsonResponse = JSON.parse(xmlHttp.responseText)

  //console.log(jsonResponse.response.status)

  if (jsonResponse.response.status === "Success") {
    bot.sendMessage(chatId, `<b>Successfully linked telegram to the wallet </b>`, {parse_mode: 'HTML'});
  }
  if (jsonResponse.response.status === "Not found") {
    bot.sendMessage(chatId, `<b>Could not find wallet linked to following phone number. Please register a new wallet at: https://no-code-wallet.bird-house.org/version-test/home </b>`, {parse_mode: 'HTML'});
  }
  if (jsonResponse.response.status === "Already linked") {
    bot.sendMessage(chatId, `<b>Your telegram is already linked to the wallet </b>`, {parse_mode: 'HTML'});
  }

  /*axios
    .get(`${process.env.WALLET_API_URL}/link-telegram/?phone=${data}&telegram_token=${msg.from.id}&api_token=${process.env.SECRET_KEY}`, {
      params: {},
      headers: {}
    })
    .then(response => {
      const parsedHtml = parser(response.data);
      bot.sendMessage(chatId, parsedHtml, { parse_mode: 'HTML' });
    })
    .catch(error => {
      const errorText = error.response.status === 404 ? `No definition found for the word: <b>${word}</b>` : `<b>An error occured, please try again later</b>`;
      bot.sendMessage(chatId, errorText, { parse_mode:'HTML'})
    });
   */
});

// Matches "/deposit"
bot.onText(/\/deposit/, (msg, match) => {
  bot.sendMessage(msg.chat.id, `<b>Please an amount for deposit </b>`, {parse_mode: 'HTML'});
});

// Matches "/deposit {text}"
bot.onText(/\/deposit (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const data = match[1];

  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open( "GET", `${process.env.WALLET_API_URL}/deposit/?amount=${data}&telegram_token=${msg.from.id}&api_token=${process.env.SECRET_KEY}`, false ); // false for synchronous request
  xmlHttp.send( null );
  const jsonResponse = JSON.parse(xmlHttp.responseText)

  //console.log(xmlHttp.responseText)

  if (jsonResponse.status === "success") {
    bot.sendMessage(chatId, `<b>${jsonResponse.response.link}</b>`, {parse_mode: 'HTML'});
  } else {
    bot.sendMessage(chatId, `<b>Error appeared</b>`, { parse_mode:'HTML'})
  }
});

// Matches "/withdraw"
bot.onText(/\/withdraw/, (msg, match) => {
  bot.sendMessage(msg.chat.id, `<b>Please an amount for deposit </b>`, {parse_mode: 'HTML'});
});

// Matches "/withdraw {text}"
bot.onText(/\/withdraw (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const data = match[1];

  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open( "GET", `${process.env.WALLET_API_URL}/withdraw/?amount=${data}&telegram_token=${msg.from.id}&api_token=${process.env.SECRET_KEY}`, false ); // false for synchronous request
  xmlHttp.send( null );
  const jsonResponse = JSON.parse(xmlHttp.responseText)

  //console.log(xmlHttp.responseText)

  if (jsonResponse.status === "success") {
    bot.sendMessage(chatId, `<b>${jsonResponse.response.link}</b>`, {parse_mode: 'HTML'});
  } else {
    bot.sendMessage(chatId, `<b>Error appeared</b>`, { parse_mode:'HTML'})
  }
});

// Matches "/get_balance"
bot.onText(/\/get_balance/, (msg, match) => {
  const chatId = msg.chat.id;
  const data = match[1];

  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open( "GET", `${process.env.WALLET_API_URL}/get-balance/?telegram_token=${msg.from.id}&api_token=${process.env.SECRET_KEY}`, false ); // false for synchronous request
  xmlHttp.send( null );
  const jsonResponse = JSON.parse(xmlHttp.responseText)

  //console.log(xmlHttp.responseText)

  if (jsonResponse.status === "success") {
    bot.sendMessage(chatId, `<b>${jsonResponse.response.balance}</b>`, {parse_mode: 'HTML'});
  } else {
    bot.sendMessage(chatId, `<b>Error appeared</b>`, { parse_mode:'HTML'})
  }
});

// Matches "/start"
bot.onText(/\/start/, (msg, match) => {
  const chatId = msg.chat.id;
  const data = match[1];

  bot.sendMessage(chatId, `<b>
 Following requests are avaliable: 
 "/link_wallet {phone_number(format: +1234567890)}",
 "/deposit {amount}",
 "/withdraw{amount}",
 "/get_balance"
  </b>`, { parse_mode:'HTML'})
});


const app = express();

app.use(bodyParser.json());

app.listen(process.env.PORT);

app.post('/' + bot.token, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});
