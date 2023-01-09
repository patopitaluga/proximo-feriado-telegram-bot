require('dotenv').config(); // to get TELEGRAM_TOKEN from .env file
const axios = require('axios'); // to send the message / image to telegram api
const FormData = require('form-data'); // to build the object to send image
const getTheHolyDay = require('./get-the-holiday');

const monthsLocale = ['', 'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

/**
 * Sends a text message to a Telegram user using the Telegram api.
 *
 * @param {string|number} _ -
 * @return {boolean}
 */
const isANumber = (_) => {
  return !isNaN(_);
};

/**
 * Sends a text message to a Telegram user using the Telegram api.
 *
 * @param {string} _chatId -
 * @param {string} _text -
 */
const sendMessage = async(_chatId, _text) => {
  if (typeof _text !== 'string') throw new Error('_text argument was expected to be a string. Instead it\'s a ' + typeof _text);
  if (_chatId === 'localtesting')
    return console.log(_text); // testing or using cli

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
      console.log('Error sending message ' + _err.response.status + ' ' + _err.response.data);
    });
};

/**
 * Sends an image to a Telegram user using the Telegram api.
 *
 * @param {string} _chatId -
 * @param {string} _text -
 * @param {string} _filename -
 */
const sendImage = async(_chatId, _text, _filename) => {
  if (_chatId === 'localtesting')
    return console.log('Local testing: Image would be sent.'); // testing or using cli

  const theFormData = new FormData();
  theFormData.append('chat_id', _chatId);
  theFormData.append('photo', require('fs').createReadStream(require('path').resolve(__dirname, './images/' + _filename)));
  theFormData.append('caption', _text);

  return axios({
    method: 'post',
    url: `https://api.telegram.org/bot${ process.env.TELEGRAM_TOKEN }/sendPhoto?chat_id=${ _chatId }`,
    data: theFormData,
    headers: {
      'Content-Type': 'multipart/form-data; boundary=' + theFormData._boundary,
      'file-name': _filename,
    },
  })
    .catch((_err) => {
      console.log('Error uploading image ' + _err.response.status + ' ' + _err.response.data);
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
    await sendMessage(body.message.chat.id, `Hola, soy el bot que dice el próximo feriado. Cuando escribas la palabra "próximo" te voy a contestar con información sobre el próximo feriado en Argentina

También me podés escribir una fecha y te puedo decir el feriado siguiente a esa fecha. Para otros comandos escribí ayuda.
`);
    return { statusCode: 200, };
  }

  const currentYear = 2023;

  // if the text is a specific month
  const matchMonth = monthsLocale.find((_eachMonth) => _eachMonth === body.message.text.toLowerCase());
  if (matchMonth) {
    await sendImage(body.message.chat.id, `Este es el calendario de feriados del mes de ${matchMonth} de ${currentYear}`, `${currentYear}/${matchMonth}.png`);
    return { statusCode: 200, };
  }

  if (
    body.message.text.toLowerCase() === 'hoy' ||
    body.message.text.toLowerCase() === 'próximo' ||
    body.message.text.toLowerCase() === 'proximo' ||
    body.message.text.toLowerCase() === 'próximo feriado' ||
    body.message.text.toLowerCase() === 'proximo feriado'
  ) {
    const result = getTheHolyDay();
    await sendMessage(body.message.chat.id,
      ((result.thatDayIsHoliday) ?
      'Hoy es feriado, *' + result.dateAsText + '* "' + result.description + '". ' :
      `El próximo feriado es en *${ result.daysInTheFuture } día${ ((result.daysInTheFuture > 1) ? 's' : '') }*. ${ result.description }`
      )
    );
    return { statusCode: 200, };
  }

  const words = body.message.text.split(' ');
  if (isANumber(words[0]) && words[1] === 'de' && monthsLocale.some((_eachMonth) => _eachMonth === words[2].toLowerCase())) {
    const result = getTheHolyDay(currentYear + '-' + ('0' + monthsLocale.indexOf(words[2].toLowerCase())).slice(-2) + '-' + ('0' + words[0]).slice(-2));
    await sendMessage(body.message.chat.id,
      ((result.thatDayIsHoliday) ?
      'El ' + result.dateAsText + ' es feriado. ' + result.description :
      `El feriado más próximo al ${ result.dateAsText } es *${ result.daysInTheFuture } día${ ((result.daysInTheFuture > 1) ? 's' : '') }* depués. ${ result.description }`
      )
    );
    return { statusCode: 200, };
  }

  if ( // YYYY-MM-DD || YYYY/MM/DD
    body.message.text.length === 10 &&
    isANumber(body.message.text.substr(0, 4)) &&
    (body.message.text.substr(4, 1) === '-' || body.message.text.substr(4, 1) === '/') &&
    isANumber(body.message.text.substr(5, 2)) &&
    (body.message.text.substr(7, 1) === '-' || body.message.text.substr(7, 1) === '/') &&
    isANumber(body.message.text.substr(10, 2))
  ) {
    const result = getTheHolyDay(body.message.text.replace(/\//g, '-'));
    await sendMessage(body.message.chat.id,
      ((result.thatDayIsHoliday) ?
      'El ' + result.dateAsText + ' es feriado. ' + result.description :
      `El feriado más próximo al ${ result.dateAsText } es *${ result.daysInTheFuture } día${ ((result.daysInTheFuture > 1) ? 's' : '') }* depués. ${ result.description }`
      )
    );
    return { statusCode: 200, };
  }
  if ( // DD-MM-YYYY || DD/MM/YYYY
    body.message.text.length === 10 &&
    isANumber(body.message.text.substr(0, 2)) &&
    (body.message.text.substr(2, 1) === '-' || body.message.text.substr(2, 1) === '/')  &&
    isANumber(body.message.text.substr(3, 2)) &&
    (body.message.text.substr(5, 1) === '-' || body.message.text.substr(5, 1) === '/') &&
    isANumber(body.message.text.substr(6, 4))
  ) {
    const result = getTheHolyDay(body.message.text.substr(6, 4) + '-' + body.message.text.substr(3, 2) + '-' + body.message.text.substr(0, 2));
    await sendMessage(body.message.chat.id,
      ((result.thatDayIsHoliday) ?
      'El ' + result.dateAsText + ' es feriado. ' + result.description :
      `El feriado más próximo al ${ result.dateAsText } es *${ result.daysInTheFuture } día${ ((result.daysInTheFuture > 1) ? 's' : '') }* depués. ${ result.description }`
      )
    );
    return { statusCode: 200, };
  }

  if (body.message.text.toLowerCase() === 'ayuda') {
    await sendMessage(body.message.chat.id, 'Si querés saber cuál es el próximo feriado desde hoy escribí la palabra "próximo", si no, escribí la fecha de la que querés información o el nombre del mes. Para otros comandos escribí "ayuda".');
    return { statusCode: 200, };
  }

  await sendMessage(body.message.chat.id, 'Si querés saber cuál es el próximo feriado desde hoy escribí la palabra "próximo", si no, escribí la fecha de la que querés información o el nombre del mes. Para otros comandos escribí "ayuda".');
  return { statusCode: 200, };
};
