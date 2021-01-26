const _ = require('./handler');

_.proxferiadobot({
  body: JSON.stringify({
    message: {
      chat: { id: 1 },
      text: 'hi',
    },
  }),
});
