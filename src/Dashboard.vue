<template>
	<div class="Dashboard-01">
		<Header :device="device" :trackInforProps="search_trackInfor" :trackIndex="trackIndex"/>
	    <backgroundCanvas />
	    <PlayView :trackInfor="trackInfor" :statusPlayView="playview_status" :updateStatusByDashboard="statusUpdatePlayview" :currentTimeTrack="currentTimeTrack" :seekTime="seekTime" :errPlayView="err" :soundvolume="setVolumeFunc"/>
	</div>
</template>

<script>
	import Header from './components/Header';
	import backgroundCanvas from './components/background';
	import PlayView from './components/PlayView';
	import defaultDb  from './serve/defaultDb.json';
	import SC from './SC/SC';

	export default {
	  name: 'dashboard',
	  components: {
	    Header,
	    backgroundCanvas,
	    PlayView,
	  },
	  
	  data(){
	  	return  {
		  	device : "mobile", // mobile , desktop
	  		trackInfor : defaultDb[0],
			status : "pause", // play , pause
			statusUpdatePlayview : "pause",
	  		sound : null,
	  		trackId : defaultDb[0].id,
	  		trackIndex : 0,
	  		trackList : defaultDb,
	  		currentTimeTrack : 0,
	  		err : false,
	  		soundVolume: 0.5,
	  	}
	  },

	  watch : {
	  	trackId()
	  	{
	  		this.playTrack();
	  	},

	  	status()
	  	{
	  		if (this.status === "pause") {
	  			// this.statusUpdatePlayview = "done"; // chi dung statusUpdatePlayView de control playview lan dau an vao bai hat
	  			this.sound.pause();
	  		} else if (this.status === "play") {
	  			if (this.sound === null) {
	  				this.playTrack();
	  			} else {
	  				this.sound.play()
	  			}
	  		} else if (this.status === "next") {
	  			this.trackIndex = (this.trackIndex + 1)%this.trackList.length;
	  			this.trackId = this.trackList[this.trackIndex].id;
	  			this.trackInfor = this.trackList[this.trackIndex];
	  		} else if (this.status === "prev") {
	  			if (this.trackIndex>0) {
	  				this.trackIndex = (this.trackIndex - 1)%this.trackList.length;
	  			} else {
	  				this.trackIndex = this.trackList.length -1;	
	  			}
	  				this.trackId = this.trackList[this.trackIndex].id;
	  				this.trackInfor = this.trackList[this.trackIndex];
	  		}
	  	},

	  	soundVolume()
	  	{
	  		if (this.sound) {
	  			this.sound.setVolume(this.soundVolume);
	  		}
	  	}
	  },

	  methods : {
	  	search_trackInfor(index, trackList)
	  	{
	  		this.trackIndex = index;
	  		this.trackList = trackList;
	  		this.trackId = this.trackList[index].id;
  			this.trackInfor = this.trackList[this.trackIndex];
	  	},
	  	playview_status(status)
	  	{
	  		this.status = status;
	  	},

	  	SoundListenFunction()
	  	{	
	  		this.sound.on(
	  			'state-change',
		 		function(){
		 			 if (this.sound.getState === "plaing") {
		 				this.statusUpdatePlayview = "play";
		 			} else if( this.sound.getState === "loading"){
		 				alsert('loading');
		 			}
  				}.bind(this)
			).on(
	  			'play',
	  			function(){
	  				this.statusUpdatePlayview = "play";
	  			}.bind(this)
  			).on(
  				"pause",
  				function(){
	  				this.statusUpdatePlayview = "pause";
	  			}.bind(this)
	  		).on(
	  			"finish",
	  			function(){
		  			this.statusUpdatePlayview = "finish";
		  			this.trackIndex = (this.trackIndex + 1)%this.trackList.length;
		  			console.log(this.trackList.length, this.trackIndex);
		  			this.trackId = this.trackList[this.trackIndex].id;
		  			this.trackInfor = this.trackList[this.trackIndex];
		  		}.bind(this)
		  	)
	  	},

	  	async playTrack()
	  	{
	  		if (this.sound) {
	  			this.sound.pause();
	  		}

	  		try {
  				this.sound = await SC.stream('tracks/'+this.trackId);
  				this.sound.setVolume(this.soundVolume);
	  			this.err = false;
	  		} catch(err){
	  			this.err = true;
	  			alert('loi cmnr , kiem tra lai mang xem nao @@')
	  		}

	  		if (!this.err) {
	  			this.SoundListenFunction();
	  			this.sound.play();
	  		} else {
	  			this.statusUpdatePlayview = "err";
	  		}
	  	},
	  	seekTime(seekTime)
	  	{
	  		this.sound.seek(seekTime);
	  	},
	  	setVolumeFunc(volume)
	  	{
	  		volume*=0.01;
	  		volume = 1-volume;
	  		volume = volume.toFixed(2);
	  		this.soundVolume = volume;
	  	}
	  },

	  created(){
	  	if (window.innerWidth > 992) {
	  		this.device = "desktop";
	  	}

	  	document.addEventListener("visibilitychange", function(){
	  		if (this.sound !== null) {
	  			this.currentTimeTrack = this.sound.currentTime();
	  			console.log('sent currentTimeTrack')
	  		}
		}.bind(this), false);
	  },
	}
</script>
