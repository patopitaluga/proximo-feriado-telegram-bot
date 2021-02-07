const feriados = require('./feriados');
const dayjs = require('dayjs');
const timezone = require('dayjs/plugin/timezone');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);
dayjs.extend(timezone);
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
  let txNextToWhichDate = 'próximo feriado es en';
  let txLater = '';
  let theDate = dayjs();
  if (_args &&_args.length === 10) {
    if ( // YYYY-MM-DD || YYYY/MM/DD
      !isNaN(_args.substr(0, 4)) &&
      (_args.substr(4, 1) === '-' || _args.substr(4, 1) === '/') &&
      !isNaN(_args.substr(5, 2)) &&
      (_args.substr(7, 1) === '-' || _args.substr(7, 1) === '/') &&
      !isNaN(_args.substr(10, 2))
    ) {
      txNextToWhichDate = 'feriado más próximo al ' + _args + ' es';
      txLater = ' después';
      theDate = dayjs(_args.replace(/\//g, '-'));
    }
    if ( // DD-MM-YYYY || DD/MM/YYYY
      !isNaN(_args.substr(0, 2)) &&
      (_args.substr(2, 1) === '-' || _args.substr(2, 1) === '/')  &&
      !isNaN(_args.substr(3, 2)) &&
      (_args.substr(5, 1) === '-' || _args.substr(5, 1) === '/') &&
      !isNaN(_args.substr(6, 4))
    ) {
      txNextToWhichDate = 'feriado más próximo al ' + _args + ' es'
      txLater = ' después';
      theDate = dayjs(_args.substr(6, 4) + '-' + _args.substr(3, 2) + '-' + _args.substr(0, 2));
    }
  }

  const theDateInArgentina = theDate.tz('America/Argentina/Buenos_Aires'); // get the date inside the function to make it current every time.
  let responseText = '';
  for (i = 0; i < feriados.length; i++) {
    const thisFeriado = feriados[i];
    const thisFeriadoDate = dayjs(thisFeriado.date); // TODO: this is the date in UTC 0 not in Argentina
    if (thisFeriadoDate.isAfter(theDateInArgentina)) {
      const txHowManyDaysTo = thisFeriadoDate.diff(theDate, 'days');
      responseText = `El ${ txNextToWhichDate } **${ txHowManyDaysTo } día${ ((txHowManyDaysTo > 1) ? 's' : '') }**${ txLater }. El `;
      responseText += '**' +
        weekDaysLocale[thisFeriadoDate.day()] + ' ' + thisFeriadoDate.format('D') +
        ' de ' + monthsLocale[Number(thisFeriadoDate.format('M'))] +'** "' + thisFeriado.name + '".';
      if (thisFeriado.type)
        responseText += ' Es de tipo ' + thisFeriado.type + '.';
      if (thisFeriado.movedFrom)
        responseText += ' Trasladado del día ' + thisFeriado.movedFrom + '.';
      if (thisFeriado.nextTo)
        responseText += ' Puede conformar un grupo de ' + thisFeriado.nextTo + '.';
      responseText += ' [Agregar a Google Calendar](https://www.google.com/calendar/render?action=TEMPLATE&text=Feriado%20' + thisFeriado.name.replace(/ /g, '%20') +
        '&dates=' + thisFeriadoDate.format('YYYYMMDD') + 'T0000' + '925Z%2F' +
        thisFeriadoDate.format('YYYYMMDD') + 'T2359' + '925Z)';

      // console.log(responseText);
      return responseText;
      break;
    }
  };
};

module.exports = proxferiado;

// If the argv of "node proxferiado" are set is being run as terminal client.
if (
  path.parse(process.argv[0]).name === 'node' &&
  path.parse(process.argv[1]).name === 'proxferiado'
) {
  const responseText = proxferiado(process.argv[2]);
  console.log(responseText);
}
