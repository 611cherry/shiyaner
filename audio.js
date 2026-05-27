var audio = document.getElementById('audioTag');
var pause = document.getElementById('playPause');
var recordImg = document.getElementById('record-img');
var prevMusic = document.getElementById('skipForward');   // 下一首
var nextMusic = document.getElementById('skipBackward');  // 上一首
var musicTitle = document.getElementById('music-title');
var author = document.getElementById('author-name');

// 进度/时间
var progress = document.querySelector('.pgs-play');
var progressTotal = document.querySelector('.pgs-total');
var playedTime = document.querySelector('.played-time');
var audioTime = document.querySelector('.audio-time');

// 模式/倍速/音量/列表
var modeBtn = document.getElementById('playMode');
var speedText = document.getElementById('speed');
var volumeSlider = document.getElementById('volumn-togger');
var listBtn = document.getElementById('list');
var musicList = document.getElementById('music-list');
var closeList = document.getElementById('close-list');

// 歌单：严格对应你现有图片路径
var playlist = [
  {
    name: '新世界',
    author: '华晨宇',
    src: './mp3/music0.mp3',
    cover: './img/record0.jpg',
    bg: './img/bg0.png'
  },
  {
    name: '向阳而生',
    author: '华晨宇',
    src: './mp3/music1.mp3',
    cover: './img/record1.jpg',
    bg: './img/bg1.png'
  },
  {
    name: '风之海',
    author: '华晨宇',
    src: './mp3/music2.mp3',
    cover: './img/record2.jpg', // 先用你已有的record1.jpg，确保显示
    bg: './img/bg2.png'
  },
  {
    name: '好想爱这个世界啊',
    author: '24215220203',
    src: './mp3/music3.mp3',
    cover: './img/record3.jpg', // 统一用record1.jpg，先解决不显示问题
    bg: './img/bg3.png'
  }
];

var currentIndex = 0;
var mode = 0; // 0顺序循环 1单曲循环 2随机
var speed = 1.0;

// 时间格式化
function transTime(sec) {
  if (isNaN(sec) || !isFinite(sec)) return '00:00';
  let m = Math.floor(sec / 60);
  let s = Math.floor(sec % 60);
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

// 加载歌曲（修复：封面强制刷新、背景保留虚化）
function loadMusic(idx) {
  currentIndex = idx;
  let song = playlist[idx];
  audio.src = song.src;
  musicTitle.innerText = song.name;
  author.innerText = song.author;

  // 修复1：唱片封面强制重新赋值，解决I Want You不显示
  recordImg.style.backgroundImage = `url(${song.cover})`;
  recordImg.style.backgroundSize = '100% 100%'; // 强制铺满

  // 修复2：背景保留你原来的虚化（不覆盖backdrop-filter）
  document.body.style.backgroundImage = `url(${song.bg})`;
  document.body.style.backgroundSize = 'cover';

  audio.load();
  progress.style.width = '0%';
  playedTime.innerText = '00:00';
  audioTime.innerText = '00:00';
  pause.className = 'icon-play';
  recordImg.style.animationPlayState = 'paused';
  recordImg.classList.remove('rotate-play');
  void recordImg.offsetWidth; // 强制重绘
  recordImg.classList.add('rotate-play');
  recordImg.style.animationPlayState = 'paused';
}

// 播放
function playMusic() {
  audio.play().then(() => {
    pause.className = 'icon-pause';
    recordImg.style.animationPlayState = 'running';
  }).catch(e => console.log('播放失败', e));
}

// 暂停
function pauseMusic() {
  audio.pause();
  pause.className = 'icon-play';
  recordImg.style.animationPlayState = 'paused';
}

// 播放/暂停切换
pause.addEventListener('click', function () {
  if (audio.paused) playMusic();
  else pauseMusic();
});

// 上一首
nextMusic.addEventListener('click', function () {
  if (mode === 2) {
    let r = Math.floor(Math.random() * playlist.length);
    while (r === currentIndex) r = Math.floor(Math.random() * playlist.length);
    currentIndex = r;
  } else {
    currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
  }
  loadMusic(currentIndex);
  audio.addEventListener('canplay', function onC() {
    playMusic();
    audio.removeEventListener('canplay', onC);
  });
});

// 下一首
prevMusic.addEventListener('click', function () {
  if (mode === 2) {
    let r = Math.floor(Math.random() * playlist.length);
    while (r === currentIndex) r = Math.floor(Math.random() * playlist.length);
    currentIndex = r;
  } else {
    currentIndex = (currentIndex + 1) % playlist.length;
  }
  loadMusic(currentIndex);
  audio.addEventListener('canplay', function onC() {
    playMusic();
    audio.removeEventListener('canplay', onC);
  });
});

// 更新进度条与时间
function updateProgress() {
  if (audio.duration && isFinite(audio.duration)) {
    let pct = (audio.currentTime / audio.duration) * 100;
    progress.style.width = pct + '%';
    playedTime.innerText = transTime(audio.currentTime);
    audioTime.innerText = transTime(audio.duration);
  }
}

// 进度条点击跳转
progressTotal.addEventListener('click', function (e) {
  let rect = progressTotal.getBoundingClientRect();
  let pct = (e.clientX - rect.left) / rect.width;
  if (audio.duration) audio.currentTime = pct * audio.duration;
});

// 播放模式切换
modeBtn.addEventListener('click', function () {
  mode = (mode + 1) % 3;
  if (mode === 0) modeBtn.style.backgroundImage = "url('./img/mode1.png')";
  if (mode === 1) modeBtn.style.backgroundImage = "url('./img/mode2.png')";
  if (mode === 2) modeBtn.style.backgroundImage = "url('./img/mode3.png')";
});

// 倍速切换
speedText.addEventListener('click', function () {
  let speeds = [1.0, 1.25, 1.5, 2.0];
  let idx = speeds.indexOf(speed);
  speed = speeds[(idx + 1) % speeds.length];
  audio.playbackRate = speed;
  speedText.innerText = speed.toFixed(1) + 'X';
});

// 音量控制
volumeSlider.addEventListener('input', function () {
  audio.volume = volumeSlider.value / 100;
});

// 列表显示/隐藏
function toggleList() {
  if (musicList.style.display === 'block') {
    musicList.style.display = 'none';
    closeList.style.display = 'none';
  } else {
    musicList.style.display = 'block';
    closeList.style.display = 'block';
  }
}
listBtn.addEventListener('click', toggleList);
closeList.addEventListener('click', toggleList);

// 歌曲结束
audio.addEventListener('ended', function () {
  if (mode === 1) {
    audio.currentTime = 0;
    playMusic();
  } else {
    prevMusic.click();
  }
});

// 元数据加载完成
audio.addEventListener('loadedmetadata', function () {
  audioTime.innerText = transTime(audio.duration);
  updateProgress();
});

// 时间更新
audio.addEventListener('timeupdate', updateProgress);

// 初始化
loadMusic(0);
// 页面首次交互后自动播放（解决浏览器限制）
function firstPlay() {
  if (audio.paused) playMusic();
  document.body.removeEventListener('click', firstPlay);
}
document.body.addEventListener('click', firstPlay);

// 列表项点击（假设HTML里id为music0~music3）
for (let i = 0; i < playlist.length; i++) {
  let item = document.getElementById('music' + i);
  if (item) {
    item.onclick = function () {
      loadMusic(i);
      audio.addEventListener('canplay', function onC() {
        playMusic();
        audio.removeEventListener('canplay', onC);
      });
      toggleList();
    };
  }
}

