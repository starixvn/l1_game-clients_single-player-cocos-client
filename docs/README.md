# Using Msgpack parser for socket.io

Simply add the following property to the Config.js file of the environment you want.

```
{
    enableMsgpackParserOnGame: {
        [GameId]: true
    }
}
```

With GameId is the Id of game you want to enable msgpack parser, example: 

```
{
    enableMsgpackParserOnGame: {
        45: true
    }
}
```
