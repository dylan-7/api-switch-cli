#! /usr/bin/env node

/**
 * @file index
 * @author dylan
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
 var apiSwitchCli = function(option, action) {
   fs.readFile(path.resolve('package.json'), 'utf-8', function(error, data) {
     var packageJson = JSON.parse(data);
 
     console.log(boxen(chalk.magenta(packageJson.name + '\n' + packageJson.description), { padding: 4, margin: 2 }));
 
     /**
     * @description Domain of production mode readfile
     * @param {Function} fn function(url) { command }
     * @param {String} url domain
     */
     var asyncAction = function(fn, url) {
       var command = ['cross-env', 'NODE_ENV=development'].concat(fn(url));
 
       Spawn.sync('yarn', command, { stdio: 'inherit' });
     }
 
     var genarator = function(n) {
       var selected = n;
 
       if (!selected) {
         return;
       }
 
       if (process.env.NODE_ENV !== 'production' && !option[selected]) {
         console.error('❌ api-switch-cli:', 'The selected ' + chalk.bgRed(selected)
           + ' is not found. Please confirm that you have configured it');
         return;
       }
 
       var domain = option ? option[selected] : '';
 
       if (process.env.NODE_ENV !== 'production' && !option) {
         console.error('❌ api-switch-cli:', 'must pass in an object!');
         return;
       }
       if (!option) {
         console.error('❌ api-switch-cli:', 'Please pass in an API object!');
         return;
       }
 
       if (process.env.NODE_ENV === 'production') {
         fs.readFile(path.resolve('index.sh'), 'utf-8', function(error, data) {
           var message = '';
 
           if (error) {
             message = error;
           } else {
             try {
               var index = data.lastIndexOf('API_HOST=\"');
 
               if (~index) {
                 domain = JSON.parse(data.substring(index + 9, data.indexOf('\"\n') + 1));
                 isSelect = 'yes';
                 asyncAction(action, domain);
               } else {
                 message = 'API_HOST not found!';
               }
             } catch(err) {
               message = err;
             }
           }
 
           if (message) {
             console.error('❌ api-switch-cli:', message);
           }
         });
       } else {
         if (!domain) {
           console.error('❌ api-switch-cli:', 'Please pass in an API object!');
           return;
         }
 
         asyncAction(action, domain);
       }
     }
 
     if (process.env.NODE_ENV !== 'production') {
       inquirer.prompt([
         {
           type: 'list',
           name: 'name',
           message: '你想要在哪个环境联调呢？',
           choices: ['dev', 'sit', 'mock'],
           filter: function(val) {
             return val.toLowerCase();
           }
         }
       ]).then(answers => {
         genarator(answers.name);
       });
     } else {
       genarator('pro');
     }
   });
 
   return;
 }
 
 module.exports = apiSwitchCli
 