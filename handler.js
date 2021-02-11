require('dotenv').config();
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const proxferiado = require('./proxferiado');
const path = require('path');

/**
 *
 *
 * @param {string} _chatId -
 * @param {string} _text -
 */
const sendMessage = async(_chatId, _text) => {
  return axios({
    method: 'get',
    url: `https://api.telegram.org/bot${ process.env.TELEGRAM_TOKEN }/sendMessage`,
    data: {
      chat_id: _chatId,
      text: _text,
      parse_mode: 'Markdown',
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
 * @param {string} _chatId -
 * @param {string} _text -
 * @param {string} _filename -
 */
const sendImage = async(_chatId, _text, _filename) => {
  const theFormData = new FormData();
  theFormData.append('chat_id', _chatId);
  theFormData.append('data', fs.createReadStream(path.resolve(__dirname, './images/' + _filename)));

  console.log('Uploading image');
  return axios({
    method: 'post',
    url: `https://api.telegram.org/bot${ process.env.TELEGRAM_TOKEN }/sendImage`,
    data: theFormData,
    headers: {
      'Content-Type': 'multipart/form-data; boundary=' + theFormData._boundary,
      'file-name': _filename,
    },
  })
    .then((_response) => {
      console.log('Image uploaded');
      console.log(_response.data);
    });
    .catch((_err) => {
      console.log('Error uploading image');
      console.log(_err);
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
    await sendMessage(body.message.chat.id, `Hola, soy el bot que dice el próximo feriado. Cuando digas cualquier texto te voy a contestar con información sobre el próximo feriado en Argentina para el año 2021

También me podés escribir una fecha en cualquier formato y te puedo decir el feriado siguiente a esa fecha.
`);
    return { statusCode: 200 };
  }

  if (body.message.text === 'febrero') {
    sendImage(body.message.chat.id, 'Este es el calendario del mes de ferbrero', 'febrero.png');
    return { statusCode: 200 };
  }

  if (body.message.chat) {
    const responseText = proxferiado(body.message.text);
    await sendMessage(body.message.chat.id, responseText);
    return { statusCode: 200 };
  }

  console.log(response.text); // testing or using cli
};
