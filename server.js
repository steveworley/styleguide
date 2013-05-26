var express = require('express'),
    styleguides = require('./routes/styleguides'),
    mongo = require('mongodb'),
    Q = require('q');

// MongoDB settings.
var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

var app = express();

app.use(express.bodyParser());
app.use(express.compress());
app.use(express.static(__dirname + '/web'), {maxAge: 1000});

// DB things
var server = new Server('localhost', 27017, {auto_reconnect: true});
var db = new Db('styleguide_db', server);

/**
 * db.open().
 * Create a DB openning so we can access data within.
 */
db.open(function(err, db) {
  if (!err) {
    console.log('Connected to Styleguide DB');
    db.collection('projects', {strict: true}, function(err, collection) {
      if (err) {
        console.log('Projects collection does not exist; creating collection');
        populateDB();
      }
    });
  } else {
    console.log(err);
  }
})

var populateDB = function() {
  var projects = [
    {
      "id": "soar-fcau",
      "name": "SOAR Flight Centre",
      "components": [
          {
            "id": "search-button",
            "name": "Search Button (Default)",
            "markup": "<input type=\"button\" value=\"Search\" class=\"button\" />",
            "style": ".button {\nbackground: url(http://localhost:8000/soar-buttons.png) 0 0 no-repeat;\nborder: 0;\ncolor: #fff;\ncursor: pointer;\nfont-weight: bold;\nfont-size: 14px;\nline-height: 21px;\npadding: 17px 20px;\ntext-align: left;\ntext-shadow: 1px 1px 2px #222;\nheight: 55px;\nwidth: 168px;\n}",
            "project": "soar-fcau"
          },
          {
            "id": "search-button-hover",
            "name": "Search Button (Hover)",
            "markup": "<input type=\"button\" value=\"Search\" class=\"button hover\" />",
            "style": ".button {\nbackground: url(http://localhost:8000/soar-buttons.png) 0 0 no-repeat;\nborder: 0;\ncolor: #fff;\ncursor: pointer;\nfont-weight: bold;\nfont-size: 14px;\nline-height: 21px;\npadding: 17px 20px;\ntext-align: left;\ntext-shadow: 1px 1px 2px #222;\nheight: 55px;\nwidth: 168px;\n}\n.button.hover {\nbackground-position: -218px 0;\n}",
            "project": "soar-fcau"
          },
          {
            "id": "previous-day-button",
            "name": "Previous Day Button (Default)",
            "markup": "<div class=\"previousDay\">Previous<br />Day</div>",
            "style": ".previousDay {color: #116ab2;font-family: Arial;font-size: 14px;font-weight: bold;text-transform: uppercase;float: left;width: 104px;height: 27px;padding: 13px 20px 11px 10px;text-align: right;margin-top: 15px;border-top-left-radius: 4px 4px;background: url(\"btn-prev-next.png\") no-repeat;}",
            "project": "soar-fcau"
          },
          {
            "id": "next-day-button",
            "name": "Next Day Button (Default)",
            "markup": "<div class=\"nextDay\">Next<br />Day</div>",
            "style": ".nextDay {color: #116AB2;font-family: Arial;font-size: 14px;font-weight: bold;text-transform: uppercase;float: left;width: 104px;height: 27px;padding: 13px 10px 11px 20px;text-align: left;margin-top: 15px;border-top-right-radius: 4px 4px;background: url(\"btn-prev-next.png\") no-repeat -135px 0;}",
            "project": "soar-fcau"
          },
          {
            "id": "date-controls",
            "name": "Date Controls (Default)",
            "markup": "<div class=\"date-controls\"><div class=\"previousDay\"><div class=\"previousDayLabel\">Previous<br>Day</div></div><div class=\"currentDate\"><div class=\"day\">Friday</div><div class=\"date\">24</div><div class=\"month\">May</div><div class=\"year\">2013</div></div><div class=\"nextDay\"><div class=\"nextDayLabel\">Next<br>Day</div></div></div>",
            "style": ".date-controls {float: left;width: 408px;} .currentDate {background: url(\"bg-greyspeckles.png\");width: 140px;height: 56px;float: left;padding-top: 10px;} .currentDate .day {color: #4B4A4A;font-size: 11px;font-family: Arial;font-weight: normal;text-transform: uppercase;text-align: center;} .currentDate .date {color: #4B4A4A;font-size: 30px;font-family: Arial;font-weight: bold;line-height: 28px;text-transform: uppercase;text-align: center;} .currentDate .month {color: #4B4A4A;font-size: 11px;font-family: Arial;font-weight: normal;text-transform: uppercase;text-align: right;width: 68px;float: left;padding-right: 2px;} .currentDate .year {color: #4B4A4A;font-size: 11px;font-family: Arial;font-weight: normal;text-transform: uppercase;text-align: left;width: 68px;float: left;padding-left: 2px;} .previousDay {color: #116ab2;font-family: Arial;font-size: 14px;font-weight: bold;text-transform: uppercase;float: left;width: 104px;height: 27px;padding: 13px 20px 11px 10px;text-align: right;margin-top: 15px;border-top-left-radius: 4px 4px;background: url(\"btn-prev-next.png\") no-repeat 0 1px;} .nextDay {color: #116AB2;font-family: Arial;font-size: 14px;font-weight: bold;text-transform: uppercase;float: left;width: 104px;height: 27px;padding: 13px 10px 11px 20px;text-align: left;margin-top: 15px;border-top-right-radius: 4px 4px;background: url(\"btn-prev-next.png\") no-repeat -135px 1px;} .previousDay:hover {color: #FFF;background: url(\"btn-prev-next.png\") no-repeat 0 -50px;cursor: pointer;}",
            "project": "soar-fcau"
          }
      ]
    },
    {
        "id": "ess",
        "name": "ESS",
        "components": []
    },
    {
        "id": "studentflights-com-au",
        "name": "StudentFlights.com.au",
        "components": []
    }
  ];
  // Add some default data
  db.collection('projects', function(err, collection) {
    collection.insert(projects, {safe: true}, function(err, result) {});
  });
};

/**
 * /projects
 * Set up the projects URL structure.
 ******************************************/
app.get('/projects', function(request, response) {
  collectionSelect('projects')
  .then(function(collection) {
    return collectionFindAll(collection);
  })
  .fail(function (error) {
    response.send({status:'error', message:error});
  })
  .done(function(items) {
    response.send(items);
  });
});

app.post('/projects', function(request, response){
  var project = request.body;
  collectionSelect('projects')
  .then(function(collection){
    return collectionAdd(collection, project);
  })
  .fail(function(error) {
    response.send({status:'error', message:JSON.stringify(error)});
  })
  .done(function(result) {
    response.send({status:'success', message:'Successfully added a new project', project:project});
  });
});

app.delete('/projects', function(request, response) {
  var id = request.body.id;
  collectionSelect('projects')
  .then(function(collection) {
    return collectionDelete(collection, {id:id});
  })
  .fail(function(error) {
    response.send({status:'error', message: error});
  })
  .done(function(result) {
    response.send({status:'success', message: id + ' has been removed.'});
  })
});

/**
 * /projects/:name
 * Set up the URL routes for projects/:name
 ******************************************/
app.get('/projects/:id', function(request, response) {
  var id = request.params.id;
  collectionSelect('projects')
  .then(function(collection) {
    return collectionFind(collection, {id:id});
  })
  .fail(function(error) {
    console.log(error);
    response.send({status:'error',message:'Could not complete your request'});
  })
  .done(function(item) {
    response.send(item);
  });
});

app.put('/projects/:id', function(request, response) {
  var id = request.params.id;
  var data = request.body;
  var _collection = null;

  collectionSelect('projects')
  .then(function(collection) {
    _collection = collection;
    return collectionFind(collection, {id:id});
  })
  .then(function(item) {
    for (var key in data) {
      if (item[key]) {
        item[key] = data[key];
      }
    }
    return collectionEdit(_collection, item, {id:id})
  })
  .fail(function(error){
    console.log(error);
    response.send({status:'error', message:'Cannot perform put opperation'});
  })
  .done(function(result) {
    response.send({status:'successful', message:id + ' has been altered by ' + JSON.stringify(data)});
  });
});

/**
 * /projects/:id/components
 * Access components for each project.
 ******************************************/
app.get('/projects/:id/components', function(request, response) {
  var id = request.params.id;

  collectionSelect('projects')
  .then(function(collection){
    return collectionFind(collection, {'id':id});
  })
  .done(function(item) {
    response.send(item.components);
  });

});

app.post('/projects/:id/components', function(request, response) {
  var id = request.params.id;
  var component = request.body;
  var _collection = null;

  collectionSelect('projects')
  .then(function(collection) {
    _collection = collection;
    return collectionFind(collection, {id:id});
  })
  .then(function(item) {
    item.components.push(component);
    return collectionEdit(_collection, item, {id:id});
  })
  .fail(function(error) {
    console.log(error);
    response.send({status:'error', message:'Unexpected data type.'});
  })
  .done(function(result) {
    response.send(component);
  })
});

/**
 * /projects/:id/components/:component_id
 * Access components for each project.
 ******************************************/
app.get('/projects/:id/components/:component_id', function(request, response){
  var id            = request.params.id,
      component_id  = request.params.component_id;
  collectionSelect('projects')
  .then(function(collection) {
    return collectionFind(collection, {id:id});
  })
  .then(function(item) {
    var count = item.components.length;
    for (var i = 0; i < count; i++) {
      if (item.components[i].id == component_id) {
        response.send(item.components[i]);
        return;
      }
    }
    response.send({status:'error', message:'Coult not find component'});
  });
});

app.put('/projects/:id/components/:component_id', function(request, response){
  var id            = request.params.id,
      component_id  = request.params.component_id,
      _collection   = null,
      data          = request.body;

  collectionSelect('projects')
  .then(function(collection) {
    _collection = collection;
    return collectionFind(collection, {id:id});
  })
  .then(function(item) {
    var count = item.components.length;
    for (var i = 0; i < count; i++) {
      if (item.components[i].id == component_id) {
        for(var key in data) {
          if (item.components[i][key]) {
            item.components[i][key] = data[key];
          }
        }
      }
    }
    collectionEdit(_collection, item, {id:id});
  })
  .fail(function(error) {
    console.log(error);
    response.send({status: 'error', message: 'Could not edit component'});
  })
  .done(function(result) {
    response.send(result);
  });
});


app.delete('/projects/:id/components/:component_id', function(request, response) {
  var id            = request.params.id,
      component_id  = request.params.component_id,
      _collection   = null,
      _component    = null;

  collectionSelect('projects')
  .then(function(collection) {
    _collection = collection;
    return collectionFind(collection, {id:id});
  })
  .then(function(item) {
    var indexes = item.components.length;
    while (indexes--) {
      if (item.components[indexes].id == component_id) {
        item.components.pop(indexes);
      }
    }
    return collectionEdit(_collection, item, {id:id});
  })
  .fail(function(error) {
    console.log(error);
    // response.send({status:'error', message:'Unable to delete component'});
  })
  .done(function(result) {
    response.send({status:'success', message: 'Successful'});
    // response.send({status:'success', message:'Successfully delete component: ' + component_id, component:_component});
  })
});

/**
 * /projects/:id/comments
 ******************************************/
app.get('/projects/:id/comments', function(request, response) {});
app.put('/projects/:id/comments', function(request, response) {});

/**
 * /projects/:id/components/:component_id/comments
 ******************************************/
app.get('/projects/:id/components/:component_id/comments', function(request, response) {});
app.put('/projects/:id/components/:component_id/comments', function(request, response) {});

app.listen(3000);
console.log('Listening on port 3000...');





/**
 * I love you, I PROMISE! <3
 */
var collectionSelect = function(name) {
  var defer = Q.defer();
  db.collection(name, function(err, collection) {
    if (err) {
      return defer.reject(err);
    }
    defer.resolve(collection);
  });
  return defer.promise;
}

var collectionFindAll = function(collection) {
  var defer = Q.defer();
  collection.find().toArray(function(err, items) {
    if (err) {
      return defer.reject(err);
    }
    defer.resolve(items);
  });
  return defer.promise;
}

var collectionFind = function(collection, queryObj) {
  var defer = Q.defer();
  collection.findOne(queryObj, function(err, item) {
    if (err) {
      return defer.reject(err);
    }
    if (item === null) {
      return defer.reject('Could not find ' + JSON.stringify(queryObj));
    }
    defer.resolve(item);
  });
  return defer.promise;
}

var collectionDelete = function(collection, queryObj) {
  var defer = Q.defer();
  if (typeof queryObj != 'object') {
    return defer.reject('Query, not supplied please define selection criteria to remove data.');
  }
  collection.remove(queryObj, function(err, response) {
    if (err) {
      return defer.reject(err);
    }
    defer.resolve(response);
  });
  return defer.promise;
}

var collectionEdit = function(collection, data, queryObj) {
  var defer = Q.defer();
  collection.update(queryObj, data, function(err, result) {
    if (err) {
      return defer.reject(err);
    }
    defer.resolve(result);
  });
  return defer.promise;
}

var collectionAdd = function(collection, data) {
  var defer = Q.defer();
  collection.insert(data, function(err, result) {
    if (err) {
      return defer.reject(err);
    }
    defer.resolve(result);
  });
  return defer.promise;
}
