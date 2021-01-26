require('dotenv').config();
const axios = require('axios');
const proxferiado = require('./proxferiado');

/**
 *
 *
 * @param {string} _chatId -
 * @param {string} _text -
 */
const sendToUser = async(_chatId, _text) => {
  return axios({
    method: 'get',
    url: `https://api.telegram.org/bot${ process.env.TELEGRAM_TOKEN }/sendMessage`,
    data: {
      chat_id: _chatId,
      text: _text,
    }
  })
    .catch((_err) => {
      console.log(_err.response.status);
      console.log(_err.response.data);
    });
};

/**
 *
 *
 * @param {string} _event -
 */
module.exports.proxferiadobot = async(_event) => {
  const body = JSON.parse(_event.body);

  if (body.message.text === '/start') {
    await sendToUser(body.message.chat.id, 'Hola, soy el bot que dice el próximo feriado. Cuando digas cualquier texto te voy a contestar con información sobre el próximo feriado en Argentina para el año 2021');
    return { statusCode: 200 };
  }
  const responseText = proxferiado(body.message.text);

  if (body.message.chat)
    await sendToUser(body.message.chat.id, responseText);
  else
    console.log(responseText); // testing or using cli
  return { statusCode: 200 };
};
