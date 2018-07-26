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
				<v-touch @swiperight="showTrackListFunc" @swipeleft="hideTrackListFunc" class="overlay-01"></v-touch>
				<div :class="{ 'search-result-wrapper': true , 'isLoading': isLoading, 'show': showSuggest }">
					<ul class="search-result">
						<li class="item" v-for="item in suggestList">
							<span href="#" class="suggestText" @click.prevent.self="clickTrackSuggest">
								{{ item.query }}
							</span>
						</li>
						<!-- { listSuggest } -->
					</ul>
				</div>
				
				<!-- listTrack -->
				<div :class="{'listTrack--wrapper': true, 'show': showTrackList}">
					<ul>
						<li class="item" v-for="(item, index) in trackList">
							<v-touch
								@tap="clickTrack"
								@swiperight="showTrackListFunc"
								@swipeleft="hideTrackListFunc"
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
					</ul>

					<!-- { eleLoad } -->
				</div>
			</div>
		</div>
	</div>	
</template>

<script>
	import defaultDb  from '../serve/defaultDb.json';
	export default {
		name : "header",
		
		props: {
			device : String,
			trackInforProps : Function,
			trackListStatus : Boolean
		},

		data(){
			return {
				keySearch : "",
				isLoading: false,
				suggestList : [],
				showSuggest : false,
				showTrackList : false,
				trackList : defaultDb,
				DBhost : 'http://' + window.location.hostname + ":8081",
				trackInfor : defaultDb[0],
			}
		},

		methods: {
			showTrackListFunc(){
				if (this.device === "mobile") {
		  			this.trackListStatus = true;
		  		}
		  	},

		  	hideTrackListFunc(){
				if (this.device === "mobile") {
		  			this.trackListStatus = false;
		  		}
		  	},

			getListTrack(trackname){
				// let trackname = e.target.textContent; // get trackname
				console.log(trackname);

				fetch('https://api.soundcloud.com/tracks/?q='+trackname+'/related&limit=20&format=json&client_id=ec8f5272bde9a225c71692a876603706')
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
				let trackname = this.$refs.input_search.value;
				this.getListTrack(trackname);
			},

			clickTrackSuggest(e) {
				this.getListTrack(e.target.textContent);
				e.target
			},

			clickTrack(e){
				let trackItem = e.target.closest('div.TrackItem');
				console.log(trackItem);
				let index = parseInt(trackItem.getAttribute('data-trackIndex'));
				this.trackInfor = this.trackList[index];
				console.log(index);
				this.$props.trackInforProps(index, this.trackList);
			}
		},

		watch : {
			keySearch(){
				if (this.keySearch.length > 0){ //dang search
					fetch(this.DBhost + '/search/' + this.keySearch)
					.then(res=>res.json())
					.then( parsedData => {
						this.suggestList = parsedData;

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
				}
			},

			trackListStatus(){
				console.log(this.$props.trackListStatus);
				this.showTrackList = this.$props.trackListStatus;
			}
		},

		created(){
			// this.$props.trackInforProps(this.trackInfor)
		}
	}
</script>

<style lang="scss" scoped>
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