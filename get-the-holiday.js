const holydaysCurrentYear = require('./feriados-2023');

const dayjs = require('dayjs');
const timezone = require('dayjs/plugin/timezone');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('America/Argentina/Buenos_Aires');

const monthsLocale = ['', 'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const weekDaysLocale = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

/**
 * GetTheHolyDay function.
 *
 * @param {string} _theDateAsString - (optional) YYYY-MM-DD
 * @return {object} - { daysInTheFuture: 20, description: 'text', }
 */
module.exports = (_theDateAsString) => {
  const theDate = ((_theDateAsString) ? dayjs(_theDateAsString).startOf('day') : dayjs().startOf('day'));

  let thatDayIsHoliday = false;
  let responseText = '';
  for (i = 0; i < holydaysCurrentYear.length; i++) {
    if (holydaysCurrentYear[i].date === theDate.format('YYYY-MM-DD'))
      thatDayIsHoliday = true;
  }
  const nextFeriado = holydaysCurrentYear.find((_) => _.date === theDate.format('YYYY-MM-DD') || dayjs(_.date).isAfter(theDate));
  if (nextFeriado) {
    const theFeriadoDate = dayjs(nextFeriado.date);
    const txHowManyDaysTo = theFeriadoDate.diff(theDate, 'days');
    responseText += 'El *' +
      weekDaysLocale[theFeriadoDate.day()] + ' ' + theFeriadoDate.format('D') +
      ' de ' + monthsLocale[Number(theFeriadoDate.format('M'))] +'* "' + nextFeriado.name + '".';
    if (nextFeriado.type)
      responseText += ' Es de tipo ' + nextFeriado.type + '.';
    if (nextFeriado.movedFrom)
      responseText += ' Trasladado del día ' + nextFeriado.movedFrom + '.';
    if (nextFeriado.nextTo)
      responseText += ' Puede conformar un grupo de ' + nextFeriado.nextTo + '.';

    responseText += ' [Agregar a Google Calendar](https://www.google.com/calendar/render?action=TEMPLATE&text=' + nextFeriado.name.replace(/ /g, '%20') +
      '&dates=' + theFeriadoDate.format('YYYYMMDD') + '%2F' +
      theFeriadoDate.add(1, 'days').format('YYYYMMDD');

    responseText = responseText.replace('en *1 día*', '*mañana*');
    return {
      daysInTheFuture: txHowManyDaysTo,
      dateAsText: theDate.format('D') + ' de ' + monthsLocale[Number(theDate.format('M'))],
      description: responseText,
      thatDayIsHoliday: thatDayIsHoliday,
    };
  }
};
