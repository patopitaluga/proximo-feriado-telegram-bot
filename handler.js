require('dotenv').config();
const axios = require('axios');
const moment = require('moment-timezone');
const feriados = require('./feriados');

const meses = ['', 'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const weekDays = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

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

  const now = moment();
  const nowInArgentina = now.tz('America/Argentina/Buenos_Aires');
  let responseText = '';
  for (i = 0; i < feriados.length; i++) {
    const thisFeriado = feriados[i];
    const thisFeriadoMmnt = moment(thisFeriado.date);
    if (thisFeriadoMmnt.isAfter(nowInArgentina)) {
      responseText = 'El próximo feriado es el ' + weekDays[thisFeriadoMmnt.day()] + ' ' + thisFeriadoMmnt.format('D') + ' de ' + meses[Number(thisFeriadoMmnt.format('M'))] +' "' + thisFeriado.name + '".';
      if (thisFeriado.type)
        responseText += ' Es de tipo ' + thisFeriado.type + '.';
      if (thisFeriado.movedFrom)
        responseText += ' Trasladado del día ' + thisFeriado.movedFrom + '.';
      if (thisFeriado.nextTo)
        responseText += ' Puede conformar un grupo de ' + thisFeriado.nextTo + '.';

      // console.log(responseText);
      break;
    }
  };

  await sendToUser(body.message.chat.id, responseText);
  return { statusCode: 200 };
};
