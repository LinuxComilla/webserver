define(["lib/react","components2/game","lib/socket.io-1.0.6","lib/clib","engine"],function(e,t,n,r,i){function u(){e.renderComponent(t({engine:s}),document.getElementById("game")),o&&(o.innerHTML=r.formatSatoshis(s.balanceSatoshis))}var s=new i;s.on("all",function(e){u()}),u();var o=document.getElementById("balance_bits")});