const {
    VoiceConnectionStatus,
    AudioPlayerStatus,
    joinVoiceChannel,
    getVoiceConnection,
    getNextResource,
    createAudioResource,
    createAudioPlayer,
} = require("@discordjs/voice");

const fs = require('fs')

const fetch = require('isomorphic-unfetch')
const { getData, getPreview, getTracks, getDetails } = require('spotify-url-info')(fetch)

const ffmpeg = require("ffmpeg-static");
const ytdl = require("ytdl-core");
const yts = require("yt-search");

const Util = require("./util");
const { regexList } = require("./music/regex");
const Song = require("./music/song");
const logger = require("../logger");

/**
 * A discord music bot with basic functionalities
 */
class musicBot {
    constructor(message, volume = 0.5) {
        this.message = message;
        this.queue = [];
        this.volume = volume;
        this.loop = false;
        this.player = undefined;
        this.timeout = undefined;
    }

    async addURL(path) {
        const songInfo = await ytdl.getInfo(path);
        const video = {
            url: path,
            title: songInfo.videoDetails.title,
            duration: {
                seconds: songInfo.timestamp,
            },
            timestamp: songInfo.timestamp,
        };
        return this.addSong(video);
    }
    async addPlayList(path, message) {
        const listId = path.match(regexList.YouTubePlaylistID)[1];
        const list = await yts({ listId: `${listId}` });
        logger.info({ listId }, "Playlist added");
        list.videos.forEach((video) => {
            video.url = `https://www.youtube.com/watch?v=${video.videoId}`;
            const emb = this.addSong(video);
        });
        let embed = new Util().createEmbed({
            title: "Added to queue",
            description: `Added ${list.videos.length} songs to queue`,
            footer: `Youtube`,
        });
        message.channel.send({ embeds: [embed] });
    }
    async searchSong(path) {
        try {
            const { videos } = await yts(path);
            if (!videos.length)
                return new Util().createEmbed({
                    title: "Searching ...",
                    description: "No songs were found!"
                })
            const video = videos[0];
            return this.addSong(video);
        } catch (error) {
            logger.error({ error }, `could not search song`)
        }
    }
    addSong(video) {
        const song = new Song(video.url, video.title, video.duration.seconds);
        this.queue.push(song);
        let emb = new Util().createEmbed({
            title: "Added to queue",
            description: `Name: ${video.title}\nDuration: ${video.duration.timestamp}`,
            footer: `Youtube`,
        });
        logger.info(
            { song },
            `Added to Queue - Name: ${video.title}\n` +
            `In queue: ${this.queue.length} songs`
        );
        return emb;
    }

    addLocalFolder(name) {
        let path = process.env.localSongs
        const musicDir = fs.readdirSync(path, { withFileTypes: true })
            .filter(dirent => !dirent.isFile())
            .map(dirent => dirent.name);
            console.log(musicDir)
        for (const folder of musicDir) {
            if (folder == name || name == 'all' || name == 'old') {
                const music = fs.readdirSync(`${path}/${folder}`).filter(file => file.endsWith('.mp3'))
                for (const song of music) {
                    let toAdd = new Song(`${path}/${folder}/${song}`, `${song}`)
                    this.queue.push(toAdd)
                }
                if (name != 'all' && name != 'old') return true
            }
        }
        return name == 'all' || name == 'old' //? true : this.addLocalSongs(name);
    }
    addLocalSongs(name) {
        let path = './music'
        let numSongs = 0;
        const musicDir = fs.readdirSync(path, {
            withFileTypes: true
        })
            .filter(dirent => !dirent.isFile())
            .map(dirent => dirent.name);
        for (const folder of musicDir) {
            const music = fs.readdirSync(`${path}/${folder}`).filter(file => file.endsWith('.mp3'))
            for (const song of music) {
                if (song.toLowerCase().includes(name) && numSongs < 6) {
                    let emb = new Util().createEmbed(
                        'Added to queue',
                        `Name: ${song}\nDuration: ${0}`,
                        `Local`)
                    this.message.channel.send({ embeds: [emb] })
                    let toAdd = new Song(`${path}/${folder}/${song}`, `${song}`)
                    this.queue.push(toAdd)
                    numSongs++
                }

            }
        }
        return numSongs > 0 ? true : false
    }

    async addToQueue(path, message) {
        try {
            logger.info({ path }, `attempting to search ${path}`)
            if (this.addLocalFolder(path)) {
                message.channel.send('adding local folder')
            } 
            else if (path.match(regexList.Spotify)) {
                const song = await getPreview(path)
                const search = song.artist + " " + song.title
                const emb = await this.searchSong(search)
                message.channel.send({ embeds: [emb] });
            } else if (ytdl.validateURL(path)) {
                const emb = await this.addURL(path);
                message.channel.send({ embeds: [emb] });
            } else if (path.match(regexList.YouTubePlaylist)) {
                await this.addPlayList(path, message);
            } else {
                const emb = await this.searchSong(path);
                message.channel.send({ embeds: [emb] });
            }
        } catch (err) {
            return console.log(err);
        }
    }

    resetQueue() {
        this.player.stop();
        this.queue = [];
    }
    onPlaying() {
        if (this.timeout) clearTimeout(this.timeout);
    }
    onBuffering() {
        //this.player.stop(true)
    }
    onIdle() {
        if (this.loop) this.queue.push(this.queue[0]);
        if (this.queue.length) {
            this.queue.shift();
            this.play();
        }
        clearTimeout(this.timeout)
        this.timeout = setTimeout(() => {
            this.stopPlayer();
            this.message.channel.send("Left channel due to inactivity");
        }, 300000);
    }
    onError(err) {
        logger.error({ err }, `Error: resource ded -> ${err}`)
        let next = this.queue.shift();
        if (this.loop) this.queue.push(next);
        this.play();
    }
    onChange(oldState, newState) {
        logger.info({}, `Audio player transitioned from ${oldState.status} to ${newState.status}`)
        //console.log(`Audio player transitioned from ${oldState.status} to ${newState.status}`);
    }
    setPlayer() {
        try {
            if (!this.player) {
                this.player = createAudioPlayer();
                this.player.on(AudioPlayerStatus.Playing, () => this.onPlaying());
                this.player.on(AudioPlayerStatus.Buffering, () => this.onBuffering());
                this.player.on(AudioPlayerStatus.Idle, () => this.onIdle());
                this.player.on("error", (error) => {
                    this.onError(error);
                });
                this.player.on("stateChange", (oldState, newState) => {
                    this.onChange(oldState, newState);
                });
            }
            const connection = getVoiceConnection(this.message.guild.id);
            if (connection) connection.subscribe(this.player);
        } catch (err) {
            console.log(`Error: could not create Music Player`);
            console.error(err);
        }
    }
    setVolume(volume) {
        this.volume = volume;
        if (this.resource) this.resource.volume.setVolume(volume);
    }
    getStatus() {
        return this.player.state.status;
    }
    play(skip = false) {
        try {
            if (!this.queue.length) return;
            if (this.getStatus() != AudioPlayerStatus.Playing || skip) {
                if (ytdl.validateURL(this.queue[0].path)) {
                    this.resource = createAudioResource(
                        ytdl(this.queue[0].path, {
                            filter: "audioonly",
                            highWaterMark: 1 << 25,
                        }),
                        { inlineVolume: true }
                    );
                    this.player.play(this.resource);
                    this.setVolume(this.volume);
                } else if (this.queue[0].path) {
                    this.resource = createAudioResource((this.queue[0].path), { inlineVolume: true })
                    this.player.play(this.resource);
                    this.setVolume(this.volume);
                } else this.message.channel.send("Could not play song.");
            }
        } catch (err) {
            logger.error({err}, 'error occured during playback' )
        }
        
    }
    stopPlayer() {
        try {
            this.player.stop();
            const connection = getVoiceConnection(this.message.guild.id);
            if (connection) connection.disconnect();
            if (this.timeout) clearTimeout(this.timeout);
        } catch (err) {
            console.error(err);
        }
    }
    pause(playing) {
        if (this.player) {
            playing ? this.player.pause() : this.player.unpause();
        }
    }
    loop() {
        loop = !loop;
    }
    async skipSong() {
        try {
            await this.player.stop({ force: true });
            if (this.queue.length) {
                this.queue.shift();
                this.play(true);
            }
        } catch (err) {
            console.log(err);
        }
    }
    removeSongInQueue(pos) {
        if (pos == 1) {
            this.skipSong();
        } else if (this.queue.length >= pos - 1 && pos - 1 >= 0) {
            this.message.channel.send(
                `removed song #${pos}. ${this.queue[pos - 1].name}`
            );
            return this.queue.splice(pos - 1, 1);
        }
    }
    move(song1, song2) {
        if (0 >= song1 || 0 >= song2) return this.message.channel.send()
        else if (this.queue.length < song1 && this.queue.length < song2) return
        [this.queue[song1-1], this.queue[song2-1]] = [this.queue[song2-1], this.queue[song1-1]] 
    }
    seek(time) {
        let regex = /([0-9]+?):?([0-9]?[0-9]?):?([0-9]?[0-9])/;
        if (!time.match(regex)) return;
        let timer = time.split(":");
        let secs = 0,
            mins = 0,
            hrs = 0;
        if (timer.length == 3) {
            secs = parseInt(timer[2]);
            mins = parseInt(timer[1] * 60);
            hrs = parseInt(timer[0] * 3600);
        } else if (timer.length == 2) {
            secs = parseInt(timer[1]);
            mins = parseInt(timer[0] * 60);
        } else {
            secs = parseInt(timer[0]);
        }

        this.resource.playbackDuration =
            this.resource.playbackDuration + (secs + mins + hrs) * 1000;
    }
    getQueuePage(page) {
        let songs = [];
        for (let i = page; i < 10; i++) {
            if ((page - 1) * 10 + i < this.queue.length)
                songs.push(this.queue[(page - 1) * 10 + i]);
        }
        return songs;
    }

    get playing() {
        return this.queue[0] | undefined
    }
}

module.exports = musicBot;
