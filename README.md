# mountebank-ws
This is a web socket plugin for [Mountebank](http://www.mbtest.org/docs/protocols/custom).

## Modelling different web socket scenarios
### Request-Response
Client sends a request message and server sends a response message

```
{
  "predicates": [
    {
      "equals": {
        "message": "foo"
      }
    }
  ],
  "responses": [
    {
      "is": "bar"
    }
  ]
}
```
### Request-Stream response
Client sends a request (subscribe). Server starts streaming responses. Client can also unsubscribe.

```
{
  "predicates": [
    {
      "equals": {
        "message": "start_ticker"
      }
    }
  ],
  "responses": [
    {
      "is": {
        "__MB_CUSTOM_RESPONSE": {
          "command": "start_stream",
          "source": "random_price",
          "interval": 1000,
          "id": "price"
        }
      }
    }
  ]
}
```

```
{
  "predicates": [
    {
      "equals": {
        "message": "stop_ticker"
      }
    }
  ],
  "responses": [
    {
      "is": {
        "__MB_CUSTOM_RESPONSE": {
          "command": "stop_stream",
          "id": "price"
        }
      }
    }
  ]
}
```


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
