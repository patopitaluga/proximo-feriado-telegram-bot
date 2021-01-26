# Próximo Feriado Argentina Telegram bot

## Deploy

### For the first time
If [the Serverless Framework](https://www.npmjs.com/package/serverless) isn't installed in the local environment yet install it:
```
npm install -g serverless
```

Set AWS credentials in the Serverless Framework
```
serverless config credentials --provider aws --key xxxxxxxxxxxxxx --secret xxxxxxxxxxxxxx
```

If you haven’t retrieved keys before, go to https://console.aws.amazon.com/console/home click on your name on the top right, "Security credencials" (Mis credenciales de seguridad, en español), then "Access Keys (Access Key ID and Secret Access Key)" (Claves de acceso (ID de clave de acceso y clave de acceso secreta), en español) and click the "Create new access key" button.

### Every time
```
serverless deploy
```
