const _  = require('lodash');
const winston = require('./log/log.js');
const config = require('./config.js');
const handleuserpc = require('./handler/pc/index.js');
const handleuserapp = require('./handler/app/index.js');
const PubSub = require('pubsub-js');
const usersubfn = require('./handler/socketsubscribe');
const getdevicesids = require('./handler/getdevicesids');
const debug = require('debug')('appsrv:srvws');

const startwebsocketsrv = (http)=>{
  let io = require('socket.io')(http);

  io.on('connection', (socket)=>{
    //console.log('a user connected');

    let ctx = {};//for each connection
    usersubfn(socket,ctx);

    getdevicesids(ctx.userid,(deviceIds)=>{
      debug(`--->${JSON.stringify(deviceIds)}`);
      _.map(deviceIds,(DeviceId)=>{
        PubSub.subscribe(`push.device.${DeviceId}`,ctx.userDeviceSubscriber);
      });
    });
    //ctx.tokensubscribe = PubSub.subscribe('allmsg', ctx.userSubscriber);

    socket.on('pc',(payload)=>{
      if(!ctx.usertype){
        ctx.usertype = 'pc';
      }
      // //console.log('\npc get message:' + JSON.stringify(payload));
      winston.getlog().info('ctx:', JSON.stringify(ctx));
      handleuserpc(socket,payload,ctx);
    });

    socket.on('app',(payload)=>{
      if(!ctx.usertype){
        ctx.usertype = 'app';
      }
      // //console.log('\napp get message:' + JSON.stringify(payload));
      winston.getlog().info('ctx:', JSON.stringify(ctx));
      handleuserapp(socket,payload,ctx);
    });


    socket.on('error',(err)=>{
      PubSub.unsubscribe( ctx.userDeviceSubscriber );
      socket.disconnect(true);
    });

    socket.on('disconnect', ()=> {
      PubSub.unsubscribe( ctx.userDeviceSubscriber );
    });
  });

};

exports.startsrv = startwebsocketsrv;
