const config = require('./src/config');
const tcpsrv = require('./src/handler/tcpsrv');
const mongoose     = require('mongoose');
const debug = require('debug')('srvtcp:app');
const winston = require('./src/log/log.js');
const PubSub = require('pubsub-js');
const redis = require('./src/redis/index.js');
const moment = require('moment');
const _ = require('lodash');

mongoose.Promise = global.Promise;
mongoose.connect(config.mongodburl,{
    // This options is 1 second by default, its possible the ha
    // takes longer than 30 seconds to recover.
    reconnectInterval: 5000,
    // This options is 30 by default, why not make it 60
    reconnectTries: Number.MAX_VALUE
  });


debug(`mongodburl:${config.mongodburl}`);
winston.initLog();
winston.getlog().info(`appversion:${config.appversion},mongodburl:${config.mongodburl}`);

mongoose.connection.on("connected",function(){
  debug("mongoose connect sucess");
  tcpsrv.starttcpsrv();
})


PubSub.subscribe(`nuistdata`, ( msg, data )=>{
    debug(`-->用户订阅消息:${msg}`);
    debug(`-->用户订阅数据:${JSON.stringify(data)}`);
    //---------------添加其他模拟数据--------------
    const simuloator_realtimedata = {
          "datatime":moment().format('YYYY-MM-DD HH:mm:ss'),
          "pressure" : _.random(parseInt(config.pressure_data_min), parseInt(config.pressure_data_max)),//pressure
          "winddirection" : _.random(parseInt(config.winddirection_data_min), parseInt(config.winddirection_data_max)),
          "windspeed" : _.random(parseInt(config.windspeed_data_min), parseInt(config.windspeed_data_max)),
          "humidity" : _.random(parseInt(config.humidity_data_min), parseInt(config.humidity_data_max)),
          "rainfall" : _.random(parseInt(config.rainfall_data_min), parseInt(config.rainfall_data_max)),
          "temperature" : _.random(parseInt(config.temperature_data_min), parseInt(config.temperature_data_max)),
          "deformation":_.random(parseInt(config.deformation_data_min), parseInt(config.deformation_data_max)),
          "voltage":_.random(parseInt(config.voltage_data_min), parseInt(config.voltage_data_max)),
          "stress0":_.random(parseInt(config.stress0_data_min), parseInt(config.stress0_data_max)),
          "stress1":_.random(parseInt(config.stress1_data_min), parseInt(config.stress1_data_max)),
          "osmoticpressure":_.random(parseInt(config.osmoticpressure_data_min), parseInt(config.osmoticpressure_data_max)),//渗压
          "no":_.random(parseInt(config.no_data_min), parseInt(config.no_data_max)),
          "co":_.random(parseInt(config.co_data_min), parseInt(config.co_data_max)),
          "pm2d5":_.random(parseInt(config.pm2d5_data_min), parseInt(config.pm2d5_data_max)),
          "h2s":_.random(parseInt(config.h2s_data_min), parseInt(config.h2s_data_max)),
          "no2":_.random(parseInt(config.no2_data_min), parseInt(config.no2_data_max)),
          "o3":_.random(parseInt(config.o3_data_min), parseInt(config.o3_data_max)),
          "level":_.random(parseInt(config.level_data_min), parseInt(config.level_data_max)),//液位
          "displacement":_.random(parseInt(config.displacement_data_min), parseInt(config.displacement_data_max)),//位移
          "steelbarmeter":_.random(parseInt(config.steelbarmeter_data_min), parseInt(config.steelbarmeter_data_max))//钢筋计
        };

    _.map(simuloator_realtimedata,(v,k)=>{
      if(!_.get(data,`realtimedata.${k}`)){
        _.set(data,`realtimedata.${k}`,v);
      }
    });


    debug(`-->发布数据:${JSON.stringify(data)}`);

    redis.publish('nuistiotdata_realtimedata',data);
});
