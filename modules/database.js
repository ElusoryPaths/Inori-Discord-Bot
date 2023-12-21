const mongoose = require("mongoose")
let mongoDBConnectionString = process.env.MONGO_CONNECTION_STRING
let Schema = mongoose.Schema;

let serverSchema = new Schema({
    id: {
        type: String,
        unique: true
    },
    name: {
        type: String,
    },
    prefix: String,
})

let LOAitemSchema = new Schema({
    name: {
        type: String,
        unique: true
    },
    price: Number,
    rarity: String,
    type: String
})

let Server;
let LOAMarket;

module.exports.connect = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection(mongoDBConnectionString, { useNewUrlParser: true, useUnifiedTopology: true });

        db.on('error', (err) => {
            reject(err); // reject the promise with the provided error
        });

        db.once('open', () => {
            Server = db.model("server", serverSchema);
            LOAMarket = db.model("LOA_Market", LOAitemSchema)
            resolve("database connected");
        });
    });
};

// Server
{
    module.exports.addServer = (id, name) => {
        return new Promise((resolve, reject) => {
            let newServ = new Server({
                id: `${id}`,
                name: name,
                prefix: '='
            })
            newServ.save(err => {
                if (err) {
                    if (err.code == 11000) {
                        reject("server already added")
                    } else {
                        reject("error adding new server")
                    }
                } else {
                    resolve("server added")
                }
            })
        })
    }

    module.exports.setPrefix = (serverId, newFix) => {
        return new Promise((resolve, reject) => {
            Server.updateOne({ id: `${serverId}` }, { prefix: newFix })
                .exec()
                .then(res => {
                    resolve("Prefix updated to " + newFix)
                }).catch((err) => {
                    reject("Unable to find server " + serverId);
                });
        })
    }

    module.exports.getPrefix = (serverId) => {
        return new Promise((resolve, reject) => {
            Server.findOne({ id: `${serverId}` })
                .exec()
                .then(res => {
                    resolve(res.prefix)
                }).catch((err) => {
                    reject("Unable to find server " + serverId);
                });
        })
    }

    module.exports.getServer = (serverId) => {
        return new Promise((resolve, reject) => {
            Server.findOne({ id: serverId })
                .exec()
                .then(res => {
                    resolve(res)
                }).catch((err) => {
                    reject("Unable to find server " + serverId);
                });
        })
    }

    module.exports.getServers = () => {
        return new Promise((resolve, reject) => {
            Server.find({})
                .exec()
                .then(res => {
                    let servMap = {}
                    res.forEach(serv => {
                        servMap[`${serv.id}`] = serv
                    })
                    resolve(servMap)
                }).catch((err) => {
                    reject("Unable to find servers");
                });
        })
    }
}
// LOA
{

    module.exports.addLOAItem = (name, price, rarity, type) => {
        return new Promise((resolve, reject) => {
            let newItem = new LOAMarket({
                name: name,
                price: price,
                rarity: rarity,
                type: type
            })
            newItem.save(err => {
                if (err) {
                    if (err.code == 11000) {
                        reject("item already added")
                    } else {
                        reject("error adding new item")
                    }
                } else {
                    resolve("item added")
                }
            })
        })
    }

    module.exports.updateLOAItem = (name, price) => {
        return new Promise((resolve, reject) => {
            LOAMarket.updateOne({ name: `${name}` }, { price: price })
                .exec()
                .then(res => {
                    resolve(name + " price updated to " + price)
                }).catch((err) => {
                    reject("Unable to find item: " + name);
                });
        })
    }

    module.exports.getItem = (name) => {
        return new Promise((resolve, reject) => {
            LOAMarket.findOne({ name: name })
                .exec()
                .then(res => {
                    resolve(res)
                }).catch((err) => {
                    reject("Unable to find item: " + name);
                });
        })
    }

    module.exports.getItemsOfType = (type) => {
        return new Promise((resolve, reject) => {
            LOAMarket.find({ type: type })
                .exec()
                .then(res => {
                    resolve(res)
                }).catch((err) => {
                    reject("Unable to find items");
                });
        })
    }

}