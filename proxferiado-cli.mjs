// cli to run node proxferiado from terminal

import * as path from 'path';
import testHandler from './handler.js';

// If the argv of "node proxferiado" are set is being run as terminal client.
if (
  path.parse(process.argv[0]).name === 'node' &&
  path.parse(process.argv[1]).name === 'proxferiado-cli'
) {
  let argsText = '';
  let space = '';
  for (let c = 2; c < process.argv.length; c++) {
    argsText += space + process.argv[c];
    space = ' ';
  }

  testHandler.proxferiadobot({
    body: JSON.stringify({
      message: {
        chat: {
          // id: process.env.TESTING_CHAT_ID,
          id: 'localtesting',
        },
        text: argsText,
      },
    }),
  });
}
