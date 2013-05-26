/**
 * Database.js
 * ------------------
 * Provide API like functionality to promises and mongo interactions.
 *
 * Author: Steve Worley <steve_worley@flightcentre.com>
 */

/**
 * Our Node.js requirements.
 */
var Mongo = require('mongodb'),
    Q     = require('q');

// Allow DB to be extended by other assets.
exports.DB = {

  database: null,
  collection: null,

  /**
  * DB.connect().
  * Set up a connection to a mongo database that is passed to the connect function.
  *
  * @return MongoDB connection.
  */
  connect:function(database_name, database_options) {
    // Mongo set up
    var Server  = Mongo.server,
        Db      = Mongo.Db;

    this.server   = new Server('localhost', 27017, {auto_reconnect: true});
    this.database = new Db(database_name, this.server);

    this.database.open();

    console.log('Establishing database connection... ' + database_name);

    return this;
  },

  /**
   * DB.selectCollection().
   * Selects a MongoDB collection and returns it when it is ready to be used.
   */
  selectCollection:function(collection_name) {
    var defer = Q.defer();

    this.database.collection(collection_name, function(error, collection){
      defer.resolve(collection);
    });

    // Add the collection to our database object
    this.Collection = defer.promise();
    return this;
  },

  /**
   * DB.query()
   * Perform a query on a collection
   */
  query:function(query_obj) {
    var defer = Q.defer();
    this.Collection
    .then(function(collection) {
      collection.findOne(query_obj, function(error, item) {
        defer.resolve(item);
      });
    });
    return defer.promise();
  }
};
