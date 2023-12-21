const Util = require("../util");

class Song {
    constructor(path, name = "", duration = 0) {
        this.name = name;
        this.duration = duration;
        this.path = path;
    }
    setName(name) {
        this.name = name;
    }
    setDuration(duration) {
        this.duration = duration;
    }
    setPath(path) {
        this.path = path;
    }
    get info() {
        const u = new Util()
        length = this.duration? this.duration : "undefined"
        return u.createEmbed("Song:", `${this.name}`, `${this.duration}`)
    }
}
module.exports = Song
