#! /usr/bin/env node

/**
 * @file index
 * @author dylan
 * @time 12/06/2019
 */

 var fs = require('fs');
 var path = require('path');
 var Spawn = require('cross-spawn');
 var inquirer = require('inquirer');
 var chalk = require('chalk');
 var boxen = require('boxen');

 /**
  *
  * @param {Object} option {dev: 'https:www.xx.com'}
  * @param {Array} action [] command
  */
 var apiSwitchCli = function(action) {
   fs.readFile(path.resolve('package.json'), 'utf-8',
   function(error, data) {
     var isProd = process.env.NODE_ENV === 'production';
     var packageJson = JSON.parse(data);
     var config = packageJson['api-switch-cli'];
     var configKeys = [];

     console.log(boxen(chalk.magenta(process.env.npm_package_name + '\n' + process.env.npm_package_description), {
       padding: 4,
       margin: 2
     }));

     /**
      * @description command cli
      * @param {Function} fn function(url) { command }
      * @param {String} url api url
      */
     var asyncAction = function(fn, url, socket) {
       var command = ['cross-env', 'NODE_ENV=development'].concat(fn(url, socket));

       Spawn.sync('yarn', command, {
         stdio: 'inherit'
       });
     }

     /**
     * @description Domain of production mode readfile
     * @param {Object} globals domain { dev: { http: 'http://www.xxx.com', ws: 'ws:xx.com:1000' } }
     * @param {String} n selected url
     */
     var genarator = function(option) {
       var http = option.http;
       var socket = option.ws;

       if (isProd) {
         if (!config.rootFile) {
           console.error('❌ api-switch-cli:', 'Please configure api-switch-cli [rootFile]!');
           return;
         }
         fs.readFile(path.resolve(config.rootFile), 'utf-8',
         function(error, data) {
           var message = '';
           var urls = data.split('\n');
           var httpUrl = '';
           var socketUrl = '';

           if (error) {
             message = error;
            } else if (!data.trim()) {
              message = 'Please preset your API address.';
            } else {
              if (urls[0].split('=')[0] === 'HOST') {
                httpUrl = JSON.parse(urls[0].split('=')[0] === 'HOST' ? urls[0].split('=')[1] : '');
              }
              if (urls[1].split('=')[0] === 'WS') {
                socketUrl = JSON.parse(urls[1].split('=')[0] === 'WS' ? urls[1].split('=')[1] : '');
              }
              if (httpUrl || socketUrl) {
                try {
                  asyncAction(action, httpUrl, socketUrl);
                } catch(err) {
                  message = err;
                }
              } else {
                message = 'HTTP or WS field not found.';
              }
           }

           if (message) {
             console.error('❌ api-switch-cli:', message);
           }
         });
       } else {
         asyncAction(action, http, socket);
       }
     }

     if (!isProd) {
       if (config.globals && JSON.stringify(config.globals) !== '{}') {
         configKeys = Object.keys(config.globals);
       } else {
         console.error('❌ api-switch-cli:', 'Please configure api-switch-cli [globals]!');
         return;
       }
       inquirer.prompt([{
         type: 'list',
         name: 'name',
         message: '你想要在哪个环境联调呢？',
         choices: configKeys,
         filter: function(val) {
           return val.toLowerCase();
         }
       }]).then(answers => {
         genarator({
           http: process.env['npm_package_api_switch_cli_globals_' + answers.name + '_http'],
           ws: process.env['npm_package_api_switch_cli_globals_' + answers.name + '_ws']
          });
       });
     } else {
       genarator({
         http: '',
         ws: ''
       });
     }
   });

   return;
 }

 module.exports = apiSwitchCli;
