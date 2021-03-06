const PubSub = require("pubsub-js");
const _ = require('lodash');
const moment = require('moment');
const DBModels = require('../db/models.js');
const mongoose  = require('mongoose');
const alarmrule = require('../alarmrule');

const debug = require('debug')('appsrv:redismsg')

// appsrv:redismsg handlermsg_realtimealarm===>{"value":11,"type":"windspeed","level":"高","content":"10级以上大风","DeviceId":"LH001"} +1ms
//   appsrv:redismsg handlermsg_realtimealarm===>{"value":50,"type":"temperature","level":"高","content":"温度过高","DeviceId":"LH001"} +4ms
//   appsrv:redismsg handlermsg_realtimedata===>{"DeviceId":"NODE1","realtimedata":{"pressure":63,"winddirection":341,"windspeed":11,"humidity":39,"rainfall":274,"temperature":50}} +5s
const handlermsg_historydevice = (devicedata)=>{
  const devicedatanew = _.omit(devicedata,['_id']);
  devicedatanew.did = devicedata._id;
  devicedatanew.UpdateTime = moment().format('YYYY-MM-DD HH:mm:ss');

  const dbModel = DBModels.HistoryDeviceModel;
  const entity = new dbModel(devicedatanew);
  entity.save((err,result)=>{
    debug(err);
    debug(`result->${JSON.stringify(result)}`);
  });
};
const handlermsg_alarmdata = (alarmdata)=>{
  alarmdata.UpdateTime = moment().format('YYYY-MM-DD HH:mm:ss');
  const dbModel = DBModels.RealtimeAlarmRawModel;

  const entity = new dbModel(alarmdata);
  entity.save((err,result)=>{
    debug(err);
    debug(`result->${JSON.stringify(result)}`);
    if(!err && !!result){
      PubSub.publish(`push.devicealarm.${result._id}`,result);
    }
  });
};

const handlermsg_realtimedata = (devicedata)=>{
  debug(`handlermsg_realtimedata===>${JSON.stringify(devicedata)}`)
  const deviceModel = DBModels.DeviceModel;
  deviceModel.findOneAndUpdate({DeviceId:devicedata.DeviceId},{$set:{realtimedata:devicedata.realtimedata}},{new:true,upsert:true}).
    lean().exec((err,newdevice)=>{
      //<----------
      if(!err && !!newdevice){
        handlermsg_historydevice(newdevice);

        PubSub.publish(`push.device.${newdevice.DeviceId}`,newdevice);

        alarmrule.matchalarm(newdevice.realtimedata,(resultalarmmatch)=>{
          _.map(resultalarmmatch,(al)=>{
            console.log(al);
            al.DeviceId = devicedata.DeviceId;
            al.did = newdevice._id;
            handlermsg_alarmdata(al);
          });
        });
      }
  });
}




exports.handlermsg_realtimedata = handlermsg_realtimedata;
