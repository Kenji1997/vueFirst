<template>
	<div class="Header--01">
		<div class="Header__content">
			<div class="search-wrapper">
				<div class="search-form-wrapper">
					<form class="search-form-01">
						<input type="text" class="input-search-01" placeholder="Nhập từ khoá tìm kiếm ..."
						@focus="showTrackListFunc"
						v-model="keySearch"
						ref="input_search"
						>
						<button class="button-search-01" @click.prevent="clickSearchButton"></button>
					</form>
				</div>	
				
				<!-- suggest track -->
				<div :class="{ 'search-result-wrapper': true , 'isLoading': isLoading, 'show': showSuggest }">
					<ul class="search-result">
						<li class="item" v-for="item in suggestList">
							<span href="#" class="suggestText" @click.prevent.self="clickTrackSuggest">
								{{ item }}
							</span>
						</li>
						<!-- { listSuggest } -->
					</ul>
				</div>
				
				<!-- listTrack -->
				<div :class="{'listTrack--wrapper': true, 'show': showTrackList}" ref="listTrack" @scroll="scrollListTrack">
					<ul>
						<li class="item" v-for="(item, index) in trackList">
							<v-touch
								@tap="clickTrack"
							>
								<div class="TrackItem " :data-trackIndex="index">
									<div class="media-wrapper">
										<img :src="item.user.avatar_url" :alt="item.user.username" />
									</div>

									<div class="textbox">
										<p class="title"> {{ item.title }} </p>
										<p class="author"> {{ item.user.username }} </p>
									</div>
								</div>
							</v-touch>
						</li>

						<p :class="{'load': loadClass}" ref="load"></p>
					</ul>

					<!-- { eleLoad } -->
				</div>
			</div>
		</div>
	</div>	
</template>

<script>
	import defaultDb  from '../serve/defaultDb.json';
	import suggestJson from '../suggest.json';
	export default {
		name : "header",
		
		props: {
			device : String,
			trackInforProps : Function,
			trackListStatus : Boolean,
			trackIndex : Number,
		},

		data(){
			return {
				keySearch : "",
				lastkeySearch: "",
				loadClass: false,
				isLoading: false,
				suggestList : [],
				showSuggest : false,
				showTrackList : false,
				trackSuggest : '',
				trackList : defaultDb,
				DBhost : 'http://' + window.location.hostname + ":8081",
				limitSuggest: 10,
				offsetTrack : 0,
				// DBhost : 'http://' + window.location.hostname + ":5000",
				trackInfor : defaultDb[0],
				touch: {
		  			start: false,
		  			X: null,
		  			Y: null,
		  			lastX: null,
		  			lastY: null
		  		},
			}
		},

		methods: {
			showTrackListFunc(){
				if (this.device === "mobile") {
		  			this.showTrackList = true;
		  		}
		  	},

		  	hideTrackListFunc(){
				if (this.device === "mobile") {
		  			this.showTrackList = false;
		  		}
		  	},

			getListTrack(trackname, limit=10){
				trackname = trackname.toLowerCase();
				this.offsetTrack = limit;

				fetch('https://api.soundcloud.com/tracks/?q='+trackname+'/related&limit=' + limit + '&format=json&client_id=ec8f5272bde9a225c71692a876603706')
				.then(res=>res.json())
				.then(rsTrack=>{
					this.trackList = rsTrack;
					
					// off loading & suggest 
					this.isLoading = false;
					this.showSuggest = false;

					// show track list
					this.showTrackList = true;
				});
			},

			clickSearchButton(e){
				this.lastkeySearch = this.keySearch;
				this.getListTrack(this.keySearch);
			},

			clickTrackSuggest(e) {
				this.trackSuggest = e.target.textContent;
				this.lastkeySearch = this.trackSuggest;
				this.getListTrack(this.trackSuggest);
			},

			clickTrack(e){
				let trackItem = e.target.closest('div.TrackItem');
				let index = parseInt(trackItem.getAttribute('data-trackIndex'));
				this.trackInfor = this.trackList[index];
				this.$props.trackInforProps(index, this.trackList);
			},

			updateTrackActive()
			{
				[].map.call(
					document.querySelectorAll('.TrackItem '),
					(ele, index)=>{
						if (index === parseInt(this.trackIndex)) {
							ele.classList.add('active');
						} else {
							ele.classList.remove('active');
						}
					}
				);
			},

			scrollListTrack(){
				let listTrackEle = this.$refs.listTrack;
				let loadEle = this.$refs.load;
				if (loadEle) {
					let top = loadEle.offsetTop;
					let he = loadEle.clientHeight;

					if (top + he + 15 - listTrackEle.scrollTop - listTrackEle.clientHeight === 0){// scroll xuong duoi cung
						this.offsetTrack+=10;
						this.getListTrack(this.lastkeySearch, this.offsetTrack);
					}; // 15px padding
				}
			}
		},

		watch : {
			keySearch(){
				if (this.keySearch.length > 0){ //dang search
					this.loadClass = true;
					let keySearch = this.keySearch.toLowerCase();
					let keyArrF3 = [];

					let t = new Promise((resolve, reject)=>{
						for(var i=0, list = Object.keys(suggestJson), l = list.length;i<l;i++) {
							if (list[i][0] === keySearch[0]) {
								let countResult = 0;
								let keyArrF2 = Object.values(suggestJson)[i];
								let temp = new RegExp('^'+keySearch+'', 'g');

								for(var j = 0, list2 = keyArrF2;j<list2.length;j++) {
									if ( list2[j].match(temp) != null) {
										keyArrF3.push(list2[j]);
										countResult++;
										
										if (countResult >= this.limitSuggest) {
											break;
										}
									}
								}
								break;
							}
							resolve();
						}

						resolve();
					});

					t.then(resolve=>{;
						this.suggestList = keyArrF3;

						// da tim xong
						this.showSuggest = true;
						this.isLoading = false;
					});


					if(this.suggestList.length == 0){ // chua tim duoc db
						this.isLoading = true;
						this.showSuggest = false;
					} else { // da tim thay db
						this.isLoading = false;
					}
				} else { // ko search
					this.isLoading = false;
					this.showSuggest = false;
					this.loadClass = false;
				}
			},

			trackListStatus(){
				this.showTrackList = this.$props.trackListStatus;
			},

			trackIndex(){
				this.updateTrackActive();
			},
		},

		mounted()
		{	
			this.updateTrackActive();
		},

		created()
		{
			document.addEventListener('touchstart', function(e){
		  		let touches = e.changedTouches;
		  		this.touch.X = touches[0].pageX;
		  		this.touch.Y = touches[0].pageY;
		  	}.bind(this));

		  	document.addEventListener('touchmove', function(e){
		  		let touches = e.changedTouches;
		  		this.touch.lastX = touches[0].pageX;
		  		this.touch.lastY = touches[0].pageY;
		  	}.bind(this));

		  	document.addEventListener('touchend', function(e){
		  		if (this.touch.lastX - this.touch.X >=80) {
		  			this.showTrackListFunc();
		  		}

		  		if (this.touch.X - this.touch.lastX >=80) {
		  			this.hideTrackListFunc();
		  		}

		  		this.touch = {
		  			X: null,
		  			Y: null,
		  			lastX : null,
		  			lastY : null
		  		}
		  	}.bind(this));
		}
	}
</script>

<style lang="scss" scope>
	.listTrack--wrapper {
		z-index: 999999;
	}

	.search-form-wrapper {
		position: fixed;
		z-index: 1001;
		width: calc(100% - 30px);
	}
</style>

<style lang="scss">
	.overlay-01 {
		position: fixed;
		top: 0;
		left: 0;
		bottom: 0;
		right: 0;
		z-index: 1000;
	}
</style>
