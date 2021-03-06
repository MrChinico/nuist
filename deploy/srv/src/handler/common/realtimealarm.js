const config = require('../../config.js');
const DBModels = require('../../db/models.js');
const mongoose  = require('mongoose');
const winston = require('../../log/log.js');
const _ = require('lodash');
const moment = require('moment');
const getdevicesids = require('../getdevicesids');

//app中的报警分页
exports.getrealtimealarmlist =  (actiondata,ctx,callback)=>{
  const realtimealarmrawModel = DBModels.RealtimeAlarmRawModel;
  let query = actiondata.query || {};
  getdevicesids(ctx.userid,(deviceIds)=>{
    if(!query.DeviceId){
      query.DeviceId = {'$in':deviceIds};
    }
    const queryexec = realtimealarmrawModel.find(query).lean().sort({UpdateTime:-1}).limit(100);
    queryexec.exec((err,list)=>{
        if(!err && !!list){
            callback({
              cmd:'getrealtimealarmlist_result',
              payload:{list}
            });
          }
          else{
            callback({
              cmd:'common_err',
              payload:{errmsg:err.message,type:'getrealtimealarmlist'}
            });
          }
    });
  });
}
