const feriados = require('./feriados');
const dayjs = require('dayjs');
const timezone = require('dayjs/plugin/timezone');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('America/Argentina/Buenos_Aires');
const path = require('path');

const monthsLocale = ['', 'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const weekDaysLocale = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

/**
 * Próximo Feriado main function. Might be run in the serverless function handler or as a terminal client.
 *
 * @param {string} _args - (optional)
 * @return {object} -
 */
const proxferiado = (_args) => {
  let txNextToWhichDate = 'próximo feriado es en';
  let txLater = '';
  let theDate = dayjs().startOf('day');
  if (_args && _args.length === 10) {
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
  if (_args) {
    const dateParts = _args.split(' ');
    if (!isNaN(dateParts[0]) && dateParts[1] === 'de') {
      for (let m = 1; m <= 12; m++) {
        if (dateParts[2] === monthsLocale[m]) {
          txNextToWhichDate = 'feriado más próximo al ' + dateParts[0] + ' de ' + monthsLocale[m] + ' es'
          txLater = ' después';
          theDate = dayjs('2021-' + ('0' + m).slice(-2) + '-' + ('0' + dateParts[0]).slice(-2));
        }
      }
    }
  }

  let responseText = '';
  for (i = 0; i < feriados.length; i++) {
    if (feriados[i].date === theDate.format('YYYY-MM-DD')) {
      if (txLater === '')
        responseText = 'Hoy es feriado, ' + theDate.format('DD/MM') + ' "' + feriados[i].name + '". ';
      else
        responseText = 'El ' + theDate.format('DD/MM') + ' es feriado, "' + feriados[i].name + '". ';
    }
  }
  for (i = 0; i < feriados.length; i++) {
    const thisFeriado = feriados[i];
    let thisFeriadoDate = dayjs(thisFeriado.date);
    if (thisFeriadoDate.isAfter(theDate)) {
      const txHowManyDaysTo = thisFeriadoDate.diff(theDate, 'days');
      responseText += `El ${ txNextToWhichDate } *${ txHowManyDaysTo } día${ ((txHowManyDaysTo > 1) ? 's' : '') }*${ txLater }. El `;
      responseText += '*' +
        weekDaysLocale[thisFeriadoDate.day()] + ' ' + thisFeriadoDate.format('D') +
        ' de ' + monthsLocale[Number(thisFeriadoDate.format('M'))] +'* "' + thisFeriado.name + '".';
      if (thisFeriado.type)
        responseText += ' Es de tipo ' + thisFeriado.type + '.';
      if (thisFeriado.movedFrom)
        responseText += ' Trasladado del día ' + thisFeriado.movedFrom + '.';
      if (thisFeriado.nextTo)
        responseText += ' Puede conformar un grupo de ' + thisFeriado.nextTo + '.';

      responseText += ' [Agregar a Google Calendar](https://www.google.com/calendar/render?action=TEMPLATE&text=' + thisFeriado.name.replace(/ /g, '%20') +
        '&dates=' + thisFeriadoDate.format('YYYYMMDD') + '%2F' +
        thisFeriadoDate.add(1, 'days').format('YYYYMMDD');

      responseText = responseText.replace('en *1 día*', '*mañana*');
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
  let argsText = '';
  let space = '';
  for (let c = 2; c < process.argv.length; c++) {
    argsText += space + process.argv[c];
    space = ' ';
  }

  const responseText = proxferiado(argsText);
  console.log(responseText);
}
