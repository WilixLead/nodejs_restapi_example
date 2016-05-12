# nodejs_restapi_example

## Requirements
- Node.js *5.10.0*
- NPM *3.8.3*
- MongoDB *3.2*

## Installation
Just do next simple steps in console

`git clone https://github.com/WilixLead/nodejs_restapi_example`

`cd nodejs_restapi_example`

### Testing
`npm i`

`npm test`

See `./coverage` directory for results

### Run server
`npm i --prod`

`npm start`

## Notes
Configulation file can be descovered in `./config/config.js`
You also can owerride this config by placing `local.config.js` to `./config` directory.
For example I place my `local.config.js`, but STRONGLY recommended add line
`config/local.config.js` to `.gitignore` file