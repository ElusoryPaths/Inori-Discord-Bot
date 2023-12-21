let db = require("./database")


db.connect()
    .then(() => {
        db.addLOAItem("fish", 0, "common", "fishing").then((res) => {
            console.log(res)
        }).catch((err) => {
            console.log(err)
        })

        db.addLOAItem("natural pearl", 0, "uncommon", "fishing").then((res) => {
            console.log(res)
        }).catch((err) => {
            console.log(err)
        })

        db.addLOAItem("oreha solar carp", 0, "rare", "fishing").then((res) => {
            console.log(res)
        }).catch((err) => {
            console.log(err)
        })

        db.addLOAItem("oreha fusion material", 0, "rare", "honing").then((res) => {
            console.log(res)
        }).catch((err) => {
            console.log(err)
        })

        db.getItemsOfType("Fishing").then((res) => {
            console.log(res)
        }).catch((err) => {
            console.log(err)
        })
    }).catch()


