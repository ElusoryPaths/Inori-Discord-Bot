

module.exports.regexList = {
    YouTubeVideo: /^((?:https?:)\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))((?!channel)(?!user)\/(?:[\w\-]+\?v=|embed\/|v\/)?)((?!channel)(?!user)[\w\-]+)(((.*(\?|\&)t=(\d+))(\D?|\S+?))|\D?|\S+?)$/,
    YouTubeVideoID: /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/,
    YouTubePlaylist: /^((?:https?:)\/\/)?((?:www|m)\.)?((?:youtube\.com)).*(youtu.be\/|list=)([^#&?]*).*/,
    YouTubePlaylistID: /[&?]list=([^&]+)/,
    Spotify: /^(https:\/\/open.spotify.com\/)([a-zA-Z0-9]+)(.*)$/,
    SpotifyTrack: /^(https:\/\/open.spotify.com\/track\/)([a-zA-Z0-9]+)(.*)$/,
    SpotifyPlaylist: /^(https:\/\/open.spotify.com\/playlist\/)([a-zA-Z0-9]+)(.*)$/
}