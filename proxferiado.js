// CLI
const feriados = require('./feriados');
const moment = require('moment-timezone');
const path = require('path');

const monthsLocale = ['', 'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const weekDaysLocale = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

/**
 * Próximo Feriado main function. Might be run in the serverless function handler or as a terminal client.
 *
 * @param {string} _args - (optional)
 * @return {string} -
 */
const proxferiado = (_args) => {
  let theDate = moment();
  let beginning = 'El próximo feriado es el ';
  if (_args) {
    if (_args.length === 10) {
      if ( // YYYY-MM-DD || YYYY/MM/DD
        !isNaN(_args.substr(0, 4)) &&
        (_args.substr(4, 1) === '-' || _args.substr(4, 1) === '/') &&
        !isNaN(_args.substr(5, 2)) &&
        (_args.substr(7, 1) === '-' || _args.substr(7, 1) === '/') &&
        !isNaN(_args.substr(10, 2))
      ) {
        beginning = 'El feriado más próximo al ' + _args + ' es el ';
        theDate = moment(_args.replace(/\//g, '-'));
      }
      if ( // DD-MM-YYYY || DD/MM/YYYY
        !isNaN(_args.substr(0, 2)) &&
        (_args.substr(2, 1) === '-' || _args.substr(2, 1) === '/')  &&
        !isNaN(_args.substr(3, 2)) &&
        (_args.substr(5, 1) === '-' || _args.substr(5, 1) === '/') &&
        !isNaN(_args.substr(6, 4))
      ) {
        beginning = 'El feriado más próximo al ' + _args + ' es el ';
        theDate = moment(_args.substr(6, 4) + '-' + _args.substr(3, 2) + '-' + _args.substr(0, 2));
      }
    }
  }

  const theDateInArgentina = theDate.tz('America/Argentina/Buenos_Aires');
  let responseText = '';
  for (i = 0; i < feriados.length; i++) {
    const thisFeriado = feriados[i];
    const thisFeriadoMmnt = moment(thisFeriado.date);
    if (thisFeriadoMmnt.isAfter(theDateInArgentina)) {
      responseText = beginning + weekDaysLocale[thisFeriadoMmnt.day()] + ' ' + thisFeriadoMmnt.format('D') + ' de ' + monthsLocale[Number(thisFeriadoMmnt.format('M'))] +' "' + thisFeriado.name + '".';
      if (thisFeriado.type)
        responseText += ' Es de tipo ' + thisFeriado.type + '.';
      if (thisFeriado.movedFrom)
        responseText += ' Trasladado del día ' + thisFeriado.movedFrom + '.';
      if (thisFeriado.nextTo)
        responseText += ' Puede conformar un grupo de ' + thisFeriado.nextTo + '.';

      // console.log(responseText);
      return responseText;
      break;
    }
  };
};

module.exports = proxferiado;

if (
  path.parse(process.argv[0]).name === 'node' &&
  path.parse(process.argv[1]).name === 'proxferiado'
) {
  const responseText = proxferiado(process.argv[2]);
  console.log(responseText);
}
