<template>
	<div class="play-view">
		<!-- images title author -->
		<div class="play-view-infor-wrapper">
			<div class="play-view__image-wrapper">
				<div class="play-view__image">
					<img :src="trackInfor.user.avatar_url" :alt="trackInfor.user.username" class="image" />
				</div>
			</div>

			<div class="textbox-01 play-view__information">
				<p class="textbox__title"> {{ trackInfor.title }} </p>
				<p class="textbox__subtitle"> {{ trackInfor.user.username }} </p>
			</div>
		</div>

		<div class="play-view__control" id="play-view__control">
			<!-- progress play -->
			<div class="progress-bar">
				<Progress :duration="trackInfor.duration" :trackid="trackInfor.id" :status="status" :currentTimeTrack="this.$props.currentTimeTrack" :seekTime="seekTimeFunc" :errProgress="errPlayView"/>
			</div>

			<div class="control-main-wrapper">
				<!-- prev, pause/play , next -->
				<div class="control-main control-main-01">
					<div class="control-item">
						<v-touch @tap="prev_click">
							<img :src="prevBtn" alt="prev" id="prev_btn"/>
						</v-touch>
					</div>

					<div class="control-item" >
						<v-touch @tap="pause_or_play_click">
							<img :src="pause_play_img" :alt="status" id="pause_or_play_btn"/>
						</v-touch>
					</div>

					<div class="control-item">
						<v-touch @tap="next_click">
							<img :src="nextBtn" alt="next" id="next_btn"/>
						</v-touch>
					</div>
				</div>
				
				<!-- rain button -->
				<div :class="{'rain-button': true , 'active':rainAudioClass}" @click="rainFunc">
					<img :src="rain" alt="rain" />
				</div>
				
				<!-- volume control -->
				<div :class="{'speaker-button':true, 'active':volumeClass}">
					<img :src="volume" alt="volume"  @click="volumeFunc">
					
						<v-touch @tap="tap_volumeFunc" @panmove="panmove">
					<div class="speaker-volume" id="speaker-volume">
							<div class="speaker__progress" id="speakerProgress"></div>
							<div class="speaker__progress-ball" id="ballVolume">
								<span class="speaker__progress-ball-content">
								</span>
							</div>
					</div> 
						</v-touch>
				</div>
			</div>
		</div>

		<audio ref="rainRef" id="audioId" class="audioRain" :src="rainAudio" type="audio/mp3">
		</audio>
	</div>
</template>

<script>
	import Progress from './Progress';
	import pauseBtn from '../assets/images/pause.png';
	import playBtn from '../assets/images/play.png';
	import prevBtn from '../assets/images/prev.png';
	import nextBtn from '../assets/images/next.png';
	import volume from '../assets/images/speaker.png';
	import rain from '../assets/images/rain.png';
	import rainAudio from '../assets/audio/rainAudio.mp3';
	// import  { component as vTouch } from 'vue2-touch'

	export default {
		name: "PlayView",

		props: {
			trackInfor: Object,
			statusPlayView : Function,
			updateStatusByDashboard: String,
			currentTimeTrack : Number,
			seekTime : Function,
			errPlayView : Boolean,
			soundvolume: Function,
		},

		components : {
			Progress,
			// vTouch
		},

		data(){
			return {
				pause_play_img : playBtn,
				status : "pause",
				pauseBtn,
				playBtn,
				prevBtn,
				nextBtn,
				volume,
				rain,
				rainAudio,
				rainAudioClass : false,
				volumeClass : false,
				volumeOffsetTop: 0,
				ballVolumeOffsetTop: 0,
			}
		},

		methods : {
			pause_or_play_click(e){ // toggle status
				console.log(e.type);
				if (!this.$props.errPlayView) {
					// if (window.innerWidth > 992) {
						this.status = this.status === "pause" ? "play" : "pause";
					// }
					// console.log(">992")
					// else {
						// this.status = this.status === "pause" ? "play" : "pause";	
					// }
				}
			},

			next_click(){
				this.status = "next";
			},

			prev_click(){
				this.status = "prev";
			},

			seekTimeFunc(seekTime){
				this.$props.seekTime(seekTime);
			},

			rainFunc(){
				this.rainAudioClass = !this.rainAudioClass;
				if (this.rainAudioClass) {
					this.$refs.rainRef.play();
				} else {
					this.$refs.rainRef.pause();
				}
			},

			volumeFunc(){
				this.volumeClass = !this.volumeClass;
			},

			tap_volumeFunc(e){
				this.panmove(e);
			},

			panmove(e){
				let y = e.center.y;
				let calculatedY = 100 - (this.volumeOffsetTop - y);
				
				if (calculatedY > 100) {
					calculatedY = 100
				} else if (calculatedY< 0) {
					calculatedY = 0
				}

				document.getElementById('ballVolume').style.top = calculatedY+"%";
				document.getElementById('speakerProgress').style.top = calculatedY+"%";

				this.$props.soundvolume(calculatedY);
			},
		},

		watch : {
			updateStatusByDashboard : function(newVal, oldVal){
				if (newVal== "play") {
					this.status = newVal; // update status by statusUpdatePlayview of dashboard
				} else {
					this.status = "pause";
				}
			}
		},

		updated(){
			// toggle image button by status
			if ( this.status === "pause") {
				this.pause_play_img = this.playBtn
			} else {
				this.pause_play_img = this.pauseBtn;
			}
			
			// change status Dashboard by playView status
			this.$props.statusPlayView(this.status);
		},

		mounted(){
			this.volumeOffsetTop = document.getElementById('play-view__control').offsetTop - document.getElementById('speaker-volume').offsetTop;
		}
	}
</script>