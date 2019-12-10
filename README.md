# api-switch-cli



## Installation
```
yarn add api-switch-cli -D
```

## Usage
// package.json

```js
  "api-switch-cli": {
    "rootFile": ".env",
    "globals": {
      "dev": {
        "http": "https://xxx.net",
        "ws": "wss://ws.xxx.net:1000"
      },
      "test": {
        "http": "https://xxx.net",
        "ws": "wss://ws.xxx.net:1000"
      }
    }
  }
```

## Options
* rootFile API file

* globals local develop API