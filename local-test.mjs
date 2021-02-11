import dotenv from 'dotenv';
import testHandler from './handler.js';

testHandler.proxferiadobot({
  body: JSON.stringify({
    message: {
      chat: {
        id: process.env.TESTING_CHAT_ID,
      },
      text: 'febrero', // for testing calendar image
    },
  }),
});
