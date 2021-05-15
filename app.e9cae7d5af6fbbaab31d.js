(()=>{"use strict";(()=>{function e(e,t){let i=document.querySelector("#viewing"),s=e.youtubeUrl.split("=")[1];if(console.log(s),null!=e.player&&null!=e.youtubeUrl){e.player.setVideoId(s);let t=e.player.getPlayer();return t.classList.add("overlay"),t}return i.cloneNode(!1)}class t{constructor(e){this.kosyClient=window.parent,this.kosyApp=e}startApp(){return new Promise(((e,t)=>{window.addEventListener("message",(t=>{let i=t.data;switch(i.type){case"receive-initial-info":e(i.payload);break;case"client-has-joined":this.kosyApp.onClientHasJoined(i.payload);break;case"client-has-left":this.kosyApp.onClientHasLeft(i.clientUuid);break;case"get-app-state":const t=this.kosyApp.onRequestState();this._sendMessageToKosy({type:"receive-app-state",payload:t,clientUuids:i.clientUuids});break;case"set-app-state":this.kosyApp.onProvideState(i.state);break;case"receive-message":this.kosyApp.onReceiveMessage(i.payload)}})),this._sendMessageToKosy({type:"ready-and-listening"})}))}stopApp(){this._sendMessageToKosy({type:"stop-app"})}relayMessage(e){this._sendMessageToKosy({type:"relay-message",payload:e})}_sendMessageToKosy(e){this.kosyClient.postMessage(e,"*")}}class i{constructor(e,t,i,s,a){this.dispatch=s,this.isHost=i,this.origin=e,this.player=new YT.Player("viewing",{height:"0px",width:"0px",videoId:t,events:{onReady:()=>this.onPlayerReady(),onStateChange:e=>this.onStateChanged(e)},playerVars:{enablejsapi:1,autoplay:1,controls:this.isHost?1:0,disablekb:this.isHost?0:1,origin:this.origin,fs:1,rel:0,modestbranding:1,showinfo:0,autohide:this.isHost?0:1,start:a}})}onStateChanged(e){this.dispatch({type:"youtube-video-state-changed",payload:{state:e.data,time:e.target.getCurrentTime()}})}setVideoId(e){this.videoId=e}getPlayer(){let e=this.player.getIframe();return this.isHost||e.classList.add("remove-click"),e}getCurrentState(){return null!=this.player&&this.player.getPlayerState?this.player.getPlayerState():null}loadVideo(){null!=this.videoId&&""!=this.videoId&&(this.player.loadVideoById(this.videoId,0,"large"),this.player.setSize(window.innerWidth,window.innerHeight))}handleStateChange(e,t){if(null!=this.player&&this.player.getPlayerState&&this.player.getPlayerState()!=e)switch(null!=t&&this.player.seekTo(t,!0),e){case YT.PlayerState.BUFFERING:case YT.PlayerState.PLAYING:case YT.PlayerState.UNSTARTED:case YT.PlayerState.CUED:this.player.playVideo();break;case YT.PlayerState.PAUSED:this.player.pauseVideo();break;case YT.PlayerState.ENDED:}}onPlayerReady(){null!=this.videoId&&(this.loadVideo(),this.player.playVideo(),this.isHost&&(this.interval=window.setInterval((()=>{this.getCurrentStateAndTime()}),500)))}getCurrentStateAndTime(){let e=this.player.getPlayerState(),t=this.player.getCurrentTime();this.dispatch({type:"youtube-video-state-changed",payload:{state:e,time:t}}),e==YT.PlayerState.ENDED&&null!=this.interval&&clearInterval(this.interval)}}var s;!function(s){var a;(function(s){class a{constructor(){this.state={youtubeUrl:"https://www.youtube.com/embed?v=1skBf6h2ksI",videoState:null},this.kosyApi=new t({onClientHasJoined:e=>this.onClientHasJoined(e),onClientHasLeft:e=>this.onClientHasLeft(e),onReceiveMessage:e=>this.processMessage(e),onRequestState:()=>this.getState(),onProvideState:e=>this.setState(e)})}start(){var e,t,i,s,a;return t=this,i=void 0,a=function*(){let t=yield this.kosyApi.startApp();this.initializer=t.clients[t.initializerClientUuid],this.currentClient=t.clients[t.currentClientUuid],this.state=null!==(e=t.currentAppState)&&void 0!==e?e:this.state,this.isApiReady=!1,this.setupPlayerScript(),this.renderComponent(),window.addEventListener("message",(e=>{this.processComponentMessage(e.data)}))},new((s=void 0)||(s=Promise))((function(e,n){function o(e){try{l(a.next(e))}catch(e){n(e)}}function r(e){try{l(a.throw(e))}catch(e){n(e)}}function l(t){var i;t.done?e(t.value):(i=t.value,i instanceof s?i:new s((function(e){e(i)}))).then(o,r)}l((a=a.apply(t,i||[])).next())}))}setupPlayerScript(){window.onYouTubeIframeAPIReady=()=>{this.onYouTubeIframeAPIReady()};const e=document.createElement("script");e.src="https://www.youtube.com/iframe_api";const t=document.getElementsByTagName("script")[0];t.parentNode.insertBefore(e,t)}onYouTubeIframeAPIReady(){this.isApiReady=!0,this.player=new i(window.origin,"",this.initializer.clientUuid==this.currentClient.clientUuid,(e=>this.processComponentMessage(e)),this.state.time),this.renderComponent()}setState(e){this.state=e,this.renderComponent()}getState(){return this.state}onClientHasJoined(e){}onClientHasLeft(e){e===this.initializer.clientUuid&&this.kosyApi.stopApp()}processMessage(e){switch(e.type){case"close-integration":this.kosyApi.stopApp();break;case"receive-youtube-video-state":this.isApiReady&&(this.state.videoState=e.payload.state,this.state.time=e.payload.time,this.state.videoState==YT.PlayerState.ENDED&&(console.log("Video ended, clearing youtube url"),this.state.videoState=null,this.kosyApi.stopApp()),this.renderComponent())}}processComponentMessage(e){switch(e.type){case"close-integration":this.kosyApi.relayMessage({type:"close-integration"});break;case"youtube-video-state-changed":this.kosyApi.relayMessage({type:"receive-youtube-video-state",payload:e.payload})}}renderComponent(){!function(t,i){var s;let a,n=document.getElementById("root"),o=n.firstChild;if(a=e,null!=t.videoState&&null!=o&&(o.hidden=!1,t.player.handleStateChange(t.videoState,t.time)),(null==t.videoState||null==(null===(s=t.player)||void 0===s?void 0:s.videoId))&&null!=a){var r=n.cloneNode(!1);n.parentNode.replaceChild(r,n),r.appendChild(a(t,i))}}({videoState:this.state.videoState,time:this.state.time,currentClient:this.currentClient,initializer:this.initializer,player:this.player,youtubeUrl:this.state.youtubeUrl},(e=>this.processComponentMessage(e)))}log(...e){var t,i;console.log(`${null!==(i=null===(t=this.currentClient)||void 0===t?void 0:t.clientName)&&void 0!==i?i:"New user"} logged: `,...e)}}s.App=a,(new a).start()})((a=s.Integration||(s.Integration={})).Youtube||(a.Youtube={}))}(s||(s={}))})()})();