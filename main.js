import {VideoCustom} from './video_custom.js'
import {ShareDialog} from './share-dialog.js'
import {TourDates} from './tour-dates.js'
import {tourData} from './model.js'
import './overlays.js'
import './ua-blocker.js'

customElements.define('video-custom', VideoCustom)
customElements.define('share-dialog', ShareDialog)
customElements.define('tour-dates', TourDates)

// feed tour-date with data
document.querySelector('tour-dates').dates = tourData

const elements = {
	mainVideo: document.querySelector('.Main > video'),
	videos: document.querySelectorAll('video'),
	loading: document.querySelector('.LoadingText'),
	controls: document.querySelector('.Controls'),
	controlsPlay: document.querySelector('.Controls-play'),
	controlsRefresh: document.querySelector('.Controls-refresh'),
	grid: document.querySelector('.GridOrchestra'),
	fullScreenBtn: document.querySelector('.FullScreenBtn')
}

class View {
	constructor() {
		this.amountReady = 0
		elements.controlsRefresh.addEventListener('click', this.refresh.bind(this), false)
		elements.fullScreenBtn.addEventListener('click', this.showFullScreen.bind(this), false)
		elements.mainVideo.addEventListener('ended', this.showRefresh.bind(this), false)
		elements.videos.forEach(video => {
			video.addEventListener('click', this.handleVideoClick.bind(this), false)
			video.addEventListener('canplay', this.handleCanPlay.bind(this), false)
		})
	}

	showFullScreen() {
		document.documentElement.requestFullscreen()
	}

	handleCanPlay() {
		this.amountReady += 1
		elements.loading.textContent = `Loading ${this.amountReady} of ${elements.videos.length} videos`
		if (this.amountReady === elements.videos.length) {
			elements.loading.classList.add('is-inactive')
			elements.controls.classList.remove('is-inactive')
			elements.controlsPlay.classList.remove('is-inactive')
			elements.controlsPlay.addEventListener('click', this.handleFirstPlay.bind(this), false)
		}
	}

	showRefresh() {
		elements.controls.classList.remove('is-inactive')
		elements.controlsRefresh.classList.remove('is-inactive')
		elements.grid.classList.add('is-inactive')
	}

	refresh() {
		window.location = '/'
	}

	/* play/ pause/ sync logic */
	handleFirstPlay() {
		elements.grid.classList.remove('is-inactive')
		elements.controls.classList.add('is-inactive')
		elements.controlsPlay.classList.add('is-inactive')
		// Trigger a "click" on the main video.
		this.handlePlayVideo(elements.mainVideo)
		setTimeout(this.syncVideos.bind(this), 500)
	}

	handleVideoClick() {
		if (event.target.paused) {
			this.handlePlayVideo(event.target)
		} else if (!event.target.paused && event.target.muted) {
			this.handleSwitchVideo()
		} else {
			this.handlePauseVideo()
		}
	}

	handlePlayVideo(target) {
		// target is paused and requested by user
		this.removeActive()
		this.addActive(target)
		this.muteVideos()
		target.muted = false
		this.playVideos()
	}

	handlePauseVideo() {
		this.muteVideos()
		this.pauseVideos()
		this.syncVideos()
	}

	// While playing, if you tap an instrument that is muted
	handleSwitchVideo() {
		this.removeActive()
		this.addActive(event.target)
		this.muteVideos()
		event.target.muted = false
	}

	syncVideos() {
		const masterTime = elements.mainVideo.currentTime
		/*console.log(`all: syncing ${masterTime}`)*/
		elements.videos.forEach(video => {
			video.currentTime = masterTime
		})
	}

	playVideos() {
		/*console.log(`all: play`)*/
		elements.videos.forEach(video => {
			video.play()
		})
	}

	pauseVideos() {
		/*console.log('all: pausing')*/
		elements.videos.forEach(video => {
			// console.log({readyState: video.readyState})
			if (video.readyState === 1) {
				return
			}
			video.pause()
		})
	}

	muteVideos() {
		/*console.log('all: muting')*/
		elements.videos.forEach(video => {
			video.muted = true
		})
	}

	addActive(video) {
		video.parentNode.classList.add('is-active')
	}

	removeActive() {
		elements.videos.forEach(video => {
			const el = video.parentNode
			if (el.classList.contains('is-active')) {
				el.classList.remove('is-active')
			}
		})
	}
}

window.onload = new View()
