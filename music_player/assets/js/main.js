const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'HEXHRO_PLAYER';

const player = $('.player');
const heading = $('.player .song-name');
const cd = $('.cd');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const repeatBtn = $('.repeat');
const prevBtn = $('.prev');
const playBtn = $('.play');
const nextBtn = $('.next');
const shuffleBtn = $('.shuffle');
const timeElapsed = $('.time-elapsed');
const progress = $('#progress');
const duration = $('.duration');
const playlists = $('.playlists');

const app = {
  currentIndex: 0,
  isPlaying: false,
  isShuffle: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  setConfig: function (key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
  },
  songs: [
    {
      name: 'Ai muốn nghe không?',
      singer: 'Đen Vâu',
      path: './assets/music/Ai Muon Nghe Khong - Den.mp3',
      image: './assets/img/ai-muon-nghe-khong.jpg',
    },
    {
      name: 'Gieo Quẻ',
      singer: 'Hoang Thùy Linh',
      path: './assets/music/Gieo Que - Hoang Thuy Linh_ Den.mp3',
      image: './assets/img/gieo-que.jpg',
    },
    {
      name: 'Easy On Me',
      singer: 'Adele',
      path: './assets/music/Easy On Me - Adele.mp3',
      image: './assets/img/easy-on-me.jpg',
    },
    {
      name: 'Still Life',
      singer: 'Big Bang',
      path: './assets/music/Still Life - Big Bang.mp3',
      image: './assets/img/still-life.jpg',
    },
    {
      name: 'You Set My World On Fire',
      singer: 'Loving Caliber',
      path: './assets/music/You Set My World On Fire - Loving Caliber.mp3',
      image: './assets/img/you-set-my-world-on-fire.jpg',
    },
    {
      name: 'Wellerman',
      singer: 'Nathan Evans',
      path: './assets/music/Wellerman (Sea Shanty) - Nathan Evans.mp3',
      image: './assets/img/wellerman.jpg',
    },
  ],
  newPlaylists: [],
  render: function () {
    const html = this.songs.map((song, index) => {
      return `
            <div class="song ${
              index === this.currentIndex ? 'active' : ''
            }" data-index=${index}>
                <span class="thumb" style="background-image: url(${
                  song.image
                });">
                </span>
                <span class="info">
                    <p class="song-name">${song.name}</p>
                    <p class="artist">${song.singer}</p>
                </span>
                <span class="option"><i class="fa-solid fa-ellipsis"></i></span>
            </div> 
        `;
    });

    $('.playlists').innerHTML = html.join('');
    if (this.songs.length <= this.currentIndex) {
      this.newPlaylists.push(0);
    } else {
      this.newPlaylists.push(this.currentIndex);
    }
  },
  defineProperties: function () {
    Object.defineProperty(this, 'currentSong', {
      get: function () {
        return this.songs[this.currentIndex];
      },
    });
  },
  handleEvent: function () {
    const _this = this;
    const cdWidth = cd.offsetWidth;

    const cdThumbAnimate = cdThumb.animate(
      [
        {
          transform: 'rotate(360deg',
        },
      ],
      {
        duration: 10000,
        iterations: Infinity,
      }
    );

    cdThumbAnimate.pause();

    audio.onloadedmetadata = function (e) {
      const audioDuration = _this.formatTime(e.target.duration);
      duration.innerText = audioDuration;
    };

    // shrink CD on scroll playlists
    $('.app-container').onscroll = function () {
      const scrollTop = this.scrollTop;
      const newCdWidth = cdWidth - scrollTop;

      cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
      cd.style.opacity = newCdWidth / cdWidth;
    };

    // play music
    playBtn.onclick = function () {
      if (_this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    };
    // when play song
    audio.onplay = function () {
      _this.isPlaying = true;
      player.classList.add('playing');
      cdThumbAnimate.play();
    };

    // when pausing song
    audio.onpause = function () {
      _this.isPlaying = false;
      player.classList.remove('playing');
      cdThumbAnimate.pause();
    };

    audio.ontimeupdate = function () {
      if (audio.duration) {
        timeElapsed.innerText = _this.formatTime(audio.currentTime);
        const progressPercent = (audio.currentTime * 100) / audio.duration;
        progress.value = progressPercent;
      }
    };

    progress.oninput = function (e) {
      const seekTime = (e.target.value * audio.duration) / 100;
      audio.currentTime = seekTime;
      progress.value = e.target.value;
    };

    prevBtn.onclick = function () {
      if (_this.isShuffle) {
        _this.playShuffle();
      } else {
        _this.prevSong();
      }

      if (!(_this.currentIndex < 0)) {
        _this.toggleSongActive();
        _this.scrollToActiveSong();
        audio.play();
      }
    };

    nextBtn.onclick = function (e) {
      if (_this.isShuffle) {
        _this.playShuffle();
      } else {
        _this.nextSong();
      }

      _this.toggleSongActive();
      _this.scrollToActiveSong();
      audio.play();
    };

    shuffleBtn.onclick = function () {
      _this.isShuffle = !_this.isShuffle;
      _this.setConfig('isShuffle', _this.isShuffle);
      this.classList.toggle('active', _this.isShuffle);
    };

    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play();
      } else {
        if (_this.isShuffle) {
          nextBtn.click();
        } else if (_this.currentIndex !== _this.songs.length - 1) {
          nextBtn.click();
        }
      }
    };

    repeatBtn.onclick = function () {
      _this.isRepeat = !_this.isRepeat;
      _this.setConfig('isRepeat', _this.isRepeat);
      this.classList.toggle('active', _this.isRepeat);
    };

    playlists.onclick = function (e) {
      const songElement = e.target.closest('.song:not(.active)');
      const option = e.target.closest('.option');

      if (songElement || option) {
        if (!option) {
          _this.currentIndex = Number(songElement.dataset.index);
          _this.toggleSongActive();
          _this.loadCurrentSong();
          audio.play();
        } else {
          alert('option :)');
        }
      }
    };
  },
  loadConfig: function () {
    this.currentIndex =
      (this.songs.length <= this.config.currentIndex
        ? 0
        : this.config.currentIndex) || this.currentIndex;
    this.isRepeat = this.config.isRepeat;
    this.isShuffle = this.config.isShuffle;
    if (this.isRepeat) {
      repeatBtn.classList.toggle('active', this.isRepeat);
    }

    if (this.isShuffle) {
      shuffleBtn.classList.toggle('active', this.isShuffle);
    }

    this.scrollToActiveSong();
  },
  loadCurrentSong: function () {
    heading.innerText = this.currentSong.name;
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}`;
    audio.src = this.currentSong.path;
  },
  toggleSongActive: function () {
    const songActive = $('.song.active');
    const activeSong = $(`.song[data-index="${this.currentIndex}"]`);

    songActive.classList.remove('active');
    activeSong.classList.add('active');

    if (this.songs.length <= this.currentIndex) {
      this.setConfig('currentIndex', 0);
    } else {
      this.setConfig('currentIndex', this.currentIndex);
    }

    this.newPlaylists.push(this.currentIndex);
  },
  scrollToActiveSong: function () {
    setTimeout(() => {
      $('.song.active').scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }, 300);
  },
  formatTime: function (seconds) {
    return new Date(seconds.toFixed(0) * 1000).toISOString().substring(15, 19);
  },
  prevSong: function () {
    if (!(this.currentIndex <= 0)) {
      this.currentIndex--;
      this.loadCurrentSong();
    }
  },
  nextSong: function () {
    if (!(this.currentIndex >= this.songs.length - 1)) {
      this.currentIndex++;
      this.loadCurrentSong();
    }
  },
  playShuffle: function () {
    if (this.songs.length === this.newPlaylists.length) {
      this.newPlaylists = [];
    }

    let newIndex;

    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (this.newPlaylists.includes(newIndex));

    this.currentIndex = newIndex;
    this.loadCurrentSong();
  },
  start: function () {
    // Assign config to app
    this.loadConfig();

    // define properties for object
    this.defineProperties();

    // load first song in songs
    this.loadCurrentSong();

    // render playlists
    this.render();

    // handler events (DOM events)
    this.handleEvent();
  },
};

app.start();
