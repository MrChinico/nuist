const _ = require('lodash');
const DBModels = require('../db/models.js');

// const systemconfig =  {
//     "warningrulelevel0" : [
//           {
//               "content" : "温度过高",
//               "value" : "40",
//               "op" : ">",
//               "name" : "temperature"
//           },
//           {
//               "content" : "10级以上大风",
//               "value" : "10",
//               "op" : ">",
//               "name" : "windspeed"
//           }
//       ],
//       "warningrulelevel1" : [
//           {
//               "content" : "8级以上大风",
//               "value" : "8",
//               "op" : ">",
//               "name" : "windspeed"
//           },
//           {
//               "content" : "高温天气",
//               "value" : "38",
//               "op" : ">",
//               "name" : "temperature"
//           }
//       ],
//       "warningrulelevel2" : [
//           {
//               "content" : "降温,注意保暖",
//               "value" : "10",
//               "op" : "<",
//               "name" : "temperature"
//           },
//           {
//               "content" : "空气太干燥",
//               "value" : "10",
//               "op" : "<",
//               "name" : "humidity"
//           },
//           {
//               "content" : "无风",
//               "value" : "2",
//               "op" : "<",
//               "name" : "windspeed"
//           }
//       ]
// };


const getalarmrules = (systemconfig)=>{
  let alarmrules = {};
  _.map(systemconfig.warningrulelevel0,(v)=>{
    if(!!alarmrules[v.name]){
      alarmrules[v.name].push({
        rule:v,
        warninglevel:'高'
      });
    }
    else{
      alarmrules[v.name] = [{
        rule:v,
        warninglevel:'高'
      }];
    }
  });
  _.map(systemconfig.warningrulelevel1,(v)=>{
    if(!!alarmrules[v.name]){
      alarmrules[v.name].push({
        rule:v,
        warninglevel:'中'
      });
    }
    else{
      alarmrules[v.name] = [{
        rule:v,
        warninglevel:'中'
      }];
    }
  });
  _.map(systemconfig.warningrulelevel2,(v)=>{
    if(!!alarmrules[v.name]){
      alarmrules[v.name].push({
        rule:v,
        warninglevel:'低'
      });
    }
    else{
      alarmrules[v.name] = [{
        rule:v,
        warninglevel:'低'
      }];
    }
  });
  return alarmrules;
}

const getresultalarmmatch = (alarmdata,alarmrules)=>{
  let resultalarmmatch = [];
  _.map(alarmdata,(v,key)=>{
    //"AL_Trouble_Code" : 181
    if(!!alarmrules[key]){
      _.map(alarmrules[key],(valarmrules)=>{
        const rule = valarmrules.rule;
        // {
        //     "content" : "故障228代码报警",
        //     "value" : "228",
        //     "op" : "=",
        //     "name" : "AL_Trouble_Code"
        // }
        let valueint = rule.value;
        try{
          if(typeof valueint === 'string'){
            valueint = parseFloat(valueint);
          }
        }
        catch(e){

        }

        if(rule.op === '='){
          if(valueint == v){
            resultalarmmatch.push({
              value:v,
              type:key,
              level:_.get(valarmrules,'warninglevel'),
              content:_.get(rule,'content','')
            });
          }
        }
        else if(rule.op === '>'){
          if(v > valueint){
            resultalarmmatch.push({
              value:v,
              type:key,
              level:_.get(valarmrules,'warninglevel'),
              content:_.get(rule,'content','')
            });
          }
        }
        else if(rule.op === '<'){
          if(v < valueint){
            resultalarmmatch.push({
              value:v,
              type:key,
              level:_.get(valarmrules,'warninglevel'),
              content:_.get(rule,'content','')
            });
          }
        }//else if
      });//_.map(alarmrules[key],(valarmrules)=>{
    };//if(!!alarmrules[key]){
  });//_.map(alarmdata,(v,key)=>{
  return resultalarmmatch;
}


const matchalarm = (realtimedata,callbackfn)=>{
  const systemconfigModel = DBModels.SystemConfigModel;
  systemconfigModel.findOne({}).lean().exec((err, systemconfig)=> {
    if(!err && !!systemconfig){
      const alarmrules = getalarmrules(systemconfig);
      let resultalarmmatch = getresultalarmmatch(realtimedata,alarmrules);

      resultalarmmatch = _.sortBy(resultalarmmatch,(v)=>{
        if(v.warninglevel === '高'){
          return 0;
        }
        if(v.warninglevel === '中'){
          return 1;
        }
        if(v.warninglevel === '低'){
          return 2;
        }
        return 3;
      });
      resultalarmmatch = _.sortedUniqBy(resultalarmmatch,(v)=>{
        return v.type;
      });
      callbackfn(resultalarmmatch);
    }
  });
}

exports.matchalarm = matchalarm;
