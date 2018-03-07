const config = require('../../config.js');
const DBModels = require('../../db/models.js');
const mongoose  = require('mongoose');
const winston = require('../../log/log.js');
const debug = require('debug')('appsrv:historydevice');
const _ = require('lodash');
const moment = require('moment');

const getlimitstarttime = (periodname,endtime,starttime)=>{
  //加限制条件,如果月份,最多1年
  //如果星期,最多3月
  //如果天数，最多15天
  //如果小时,最多1天
  //如果分钟,最多1小时
  let starttimeleast = starttime;
  if(periodname === 'monthly'){
    starttimeleast = moment(endtime).subtract(12, 'months').format('YYYY-MM-DD 00:00:00');
  }
  else if(periodname === 'weekly'){
    starttimeleast = moment(endtime).subtract(3, 'months').format('YYYY-MM-DD 00:00:00');
  }
  else if(periodname === 'daily'){
    starttimeleast = moment(endtime).subtract(15, 'days').format('YYYY-MM-DD 00:00:00');
  }
  else if(periodname === 'hourly'){
    starttimeleast = moment(endtime).subtract(24, 'hours').format('YYYY-MM-DD HH:00:00');
  }
  else if(periodname === 'minutely'){
    starttimeleast = moment(endtime).subtract(1, 'hours').format('YYYY-MM-DD HH:mm:00');
  }
  starttimeleast = starttimeleast > starttime?starttimeleast:starttime;
  return starttimeleast;
}

const getticktimestring = (periodname,ticktime)=>{
  debug(`getticktimestring--->${periodname},${ticktime}`);

  let ticktimestring;
  if(periodname === 'monthly'){
    ticktimestring = moment(ticktime).format('YYYY.MM');
  }
  else if(periodname === 'minutely'){
    ticktimestring = moment(ticktime).format('HH:mm');
  }
  else if(periodname === 'hourly'){
    ticktimestring = moment(ticktime).format('DD HH');
  }
  else{
    ticktimestring = moment(ticktime).format('MM.DD');
  }
  return ticktimestring;
}

exports.gethistorydevicelist = (actiondata,ctx,callback)=>{

    const periodname = _.get(actiondata,'periodname');
    const starttime = _.get(actiondata,'starttime');
    const endtime = _.get(actiondata,'endtime');
    const _id = _.get(actiondata,'_id');
    const did = mongoose.Types.ObjectId(_id);

    //get--->{"periodname":"hourly","starttime":"2018-03-07 22:27:39","endtime":"2018-03-07 23:27:39","_id":"5a5a1fc9ebaeb976fd5d325d"}
    let trunklen = 13;//'YYYY-MM-DD HH:mm:ss'
    //// monthly weekly daily hourly minutely
    if(periodname === 'monthly'){
      trunklen = 7;
    }
    else if(periodname === 'weekly'){
      trunklen = 10;//daily
    }
    else if(periodname === 'daily'){
      trunklen = 10;//daily
    }
    else if(periodname === 'hourly'){
      trunklen = 13;//hourly
    }
    else if(periodname === 'minutely'){
      trunklen = 16;//minutely
    }
    //加限制条件,如果月份,最多1年
    //如果星期,最多3月
    //如果天数，最多15天
    //如果小时,最多1天
    //如果分钟,最多1小时
    const starttimeleast = getlimitstarttime(periodname,endtime,starttime);
    debug(`get--->${JSON.stringify({starttimeleast,starttimeleast})}`);

    const maxcount = periodname === 'weekly'?70:10;

    const historydeviceModel = DBModels.HistoryDeviceModel;
    historydeviceModel.aggregate([
        {
            $match:
            {
                did:did,
                UpdateTime:{
                  $gte: starttimeleast,
                  $lte: endtime
                }
            }
        },
        {
            $group:
            {
                _id:
                {
                    ticktime:
                    {
                        $substrBytes: [ "$UpdateTime", 0, trunklen ]
                    }
                },
                temperature:
                {
                    $avg: "$realtimedata.temperature"
                },
                rainfall:
                {
                    $avg: "$realtimedata.rainfall"
                },
                humidity:
                {
                    $avg: "$realtimedata.humidity"
                },
                windspeed:
                {
                    $avg: "$realtimedata.windspeed"
                },
                winddirection:
                {
                    $avg: "$realtimedata.winddirection"
                },
                pressure:
                {
                    $avg: "$realtimedata.pressure"
                },

            }
        },
        {
            $sort: {
                "_id.ticktime": -1
            }
        }
    ],(err,result)=>{
      debug(err);

      let listret = {
        ticktime:[],
        ticktimestring:[],
        temperature:[],
        rainfall:[],
        humidity:[],
        windspeed:[],
        winddirection:[],
        pressure:[],
      };
      if(!err && !!result){
          const maxcountcur = maxcount > result.length?result.length:maxcount;
          for(let i=0 ;i<maxcountcur;i++){
            const v = result[i];
            listret.ticktime.push(v._id.ticktime);
            listret.ticktimestring.push(getticktimestring(periodname,v._id.ticktime));
            listret.temperature.push(v.temperature);
            listret.rainfall.push(v.rainfall);
            listret.humidity.push(v.humidity);
            listret.windspeed.push(v.windspeed);
            listret.winddirection.push(v.winddirection);
            listret.pressure.push(v.pressure);
          }

          const payload = {
            _id,
            listret
          };
          debug(payload);
          callback({
            cmd:'gethistorydevicelist_result',
            payload
          });
      }
      else{
        callback({
          cmd:'common_err',
          payload:{errmsg:err.message,type:'gethistorydevicelist'}
        });
      }
      // callbackfn(listret);
    });
  };
