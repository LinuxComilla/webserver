define(["lib/socket.io-1.0.6","lib/events","lib/lodash"],function(e,t,n){function o(){var i=this;n.extend(this,t),i.ws=e(r),i.isConnected=!1,i.username=null,i.balanceSatoshis=null,i.chat=null,i.tableHistory=null,i.playerInfo=null,i.gameState=null,i.userState=null,i.created=null,i.gameId=null,i.startTime=null,i.placingBet=!1,i.autoPlay=!1,i.cashingOut=!1,i.nextBetAmount=null,i.nextAutoCashout=0,i.lastBet=null,i.lastGameWonAmount=null,i.lastGameBonus=null,i.lastGameCrashedAt=!1,i.lastBonus=null,i.ws.on("game_started",function(){i.gameState="IN_PROGRESS",i.startTime=Date.now(),i.lastGameTick=i.startTime,i.autoPlay||(i.nextBetAmount=null,i.nextAutoCashout=null),i.trigger("game_started")}),i.ws.on("game_tick",function(e){i.lastGameTick=Date.now()}),i.ws.on("error",function(e){console.log("on error: ",e),i.trigger("error",e)}),i.ws.on("game_crash",function(e){for(var t in e.bonuses)console.assert(i.playerInfo[t]),i.playerInfo[t].bonus=e.bonuses[t],i.username===t&&(i.balanceSatoshis+=e.bonuses[t]);var n={created:i.created,ended:!0,game_crash:e.game_crash,game_id:i.gameId,hash:i.hash,player_info:i.playerInfo,seed:e.seed};i.tableHistory.length>=40&&i.tableHistory.pop(),i.tableHistory.unshift(n),i.gameState="ENDED",i.lastGameCrashedAt=e.game_crash,i.lastBonus=i.playerInfo[i.username]?i.playerInfo[i.username].bonus:null,i.userState="WATCHING",i.trigger("game_crash")}),i.ws.on("game_starting",function(e){i.gameState="STARTING",i.gameId=e.game_id,i.hash=e.hash,i.startTime=new Date(Date.now()+e.time_till_start),i.lastBet=null,i.lastGameWonAmount=null,i.lastGameCrashedAt=null,i.lastBonus=null,i.playerInfo={},i.nextBetAmount&&i.doBet(i.nextBetAmount,i.nextAutoCashout,function(e){console.log("Response from placing a bet: ",e)}),i.trigger("game_starting",e)}),i.ws.on("player_bet",function(e){i.username===e.username&&(i.userState="PLAYING",i.balanceSatoshis-=e.bet,i.lastBet=e.bet,i.trigger("user_bet")),i.playerInfo[e.username]={bet:e.bet},i.trigger("player_bet",e)}),i.ws.on("cashed_out",function(e){i.username===e.username&&(i.lastGameWonAmount=e.amount,i.balanceSatoshis+=e.amount,i.userState="WATCHING",i.trigger("user_cashed_out"));if(!i.playerInfo[e.username])return console.warn("Username not found in playerInfo at cashed_out: ",e.username);i.playerInfo[e.username].stopped_at=e.stopped_at,i.playerInfo[e.username].amount=e.amount,i.trigger("cashed_out",e)}),i.ws.on("msg",function(e){i.chat.push(e),i.trigger("msg",e)}),i.ws.on("update",function(){alert("Please refresh your browser! We just pushed a new update to the server!")}),i.ws.on("connect",function(){u(function(e,t){if(e&&e!=401){console.error("request ott error:",e),confirm("An error, click to reload the page: "+e)&&location.reload();return}i.ws.emit("join",{ott:t},function(e,t){if(e){console.error("Error when joining the game...",e);return}i.balanceSatoshis=t.balance_satoshis,i.chat=t.chat,i.username=t.username,i.isConnected=!0,i.gameState=t.state,i.playerInfo=t.player_info,i.userState=i.playerInfo[i.username]&&!i.playerInfo[i.username].stopped_at?"PLAYING":"WATCHING",i.gameId=t.game_id,i.hash=t.hash,i.created=t.created,i.startTime=new Date(Date.now()-t.elapsed),i.tableHistory=t.table_history,i.gameState=="IN_PROGRESS"&&(i.lastGameTick=Date.now()),i.gameState=="ENDED"&&(i.lastGameCrashedAt=t.crashed_at),i.trigger("connected")})})}),i.ws.on("disconnect",function(e){i.isConnected=!1,console.log("Client disconnected |",e,"|",typeof e),i.trigger("disconnected")})}function u(e){try{var t=new XMLHttpRequest;if(!t)throw new Error("Your browser doesn't support xhr");t.open("POST","/ott",!0),t.setRequestHeader("Accept","text/plain"),t.send()}catch(n){console.error(n),alert("Requesting token error: "+n),location.reload()}t.onload=function(){if(t.status==200){var n=t.responseText;e(null,n)}else t.status==401?e(t.status):e(t.responseText)}}function a(e){console.assert(typeof e=="number"&&e>=0);var t=6e-5;return Math.floor(100*Math.pow(Math.E,t*e))/100}var r=window.document.location.host==="www.moneypot.com"?"https://moneypot.jit.su":window.document.location.host,i=600,s=300;return o.prototype.say=function(e){console.assert(e.length>1&&e.length<500),this.ws.emit("say",e)},o.prototype.nextGameIn=function(){return console.assert(this.gameState==="STARTING"),Math.max(this.startTime-Date.now(),0)},o.prototype.bet=function(e,t,n,r){console.assert(typeof e=="number"),console.assert(!t||typeof t=="number"&&t>=101),this.autoPlay=n,this.nextBetAmount=e,this.nextAutoCashout=t;if(this.gameState==="STARTING")return this.doBet(e,t,r);r(null,"WILL_JOIN_NEXT"),this.trigger("bet_queued")},o.prototype.doBet=function(e,t,n){var r=this;this.ws.emit("place_bet",e,t,function(e){return e?(console.warn("place_bet error: ",e),e!=="GAME_IN_PROGRESS"&&e!=="ALREADY_PLACED_BET"&&(alert("There was an error, please reload the window: "+e),r.autoPlay=!1),n(e)):(r.trigger("bet_placed"),n(null))})},o.prototype.cancelAutoPlay=function(){this.autoPlay=!1},o.prototype.cancelBet=function(){this.autoPlay=!1;if(!this.nextBetAmount)return console.error("Can not cancel next bet, wasn't going to make it...");this.nextBetAmount=null,this.trigger("cancel_bet")},o.prototype.cashOut=function(e){var t=this;this.cashingOut=!0,this.ws.emit("cash_out",function(n){t.cashingOut=!1,n&&console.warn("Cashing out error: ",n),e(n)})},o.prototype.getGamePayout=function(){console.assert(this.gameState==="IN_PROGRESS");if(Date.now()-this.lastGameTick<s)var e=Date.now()-this.startTime;else var e=this.lastGameTick-this.startTime+s;var t=a(e);return console.assert(isFinite(t)),t},o.prototype.calcGamePayout=function(e){return a(e)},o.prototype.getElapsedTime=function(){return this.gameState==="IN_PROGRESS"?Date.now()-this.startTime:null},o});