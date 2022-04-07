/*
 * config.js
 * Author: Richard Whitney
 * Date: 2021-04-23
 *
 * */



module.exports = {
  port : 8080,//must match the port in nodestart.sh
  sitename: '', /* appears in the upper left corner of your calendar*/
  favicon: 'favicon.png', /* under html/images */
  certpath: '/path/to/certs/', /* ./ if in this directory*/
  certKey: 'domain.key',
  cert: 'chained.pem',
  host: '', /* inconsequential - used only for console logging the domain*/
  dbhost: '192.168.0.0', /* localhost or remote host running mongo */
  dbuser: 'pmd',
  dbpassword: '',
  database: '',
}
