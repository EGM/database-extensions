app.OpenDatabase = function(name) {
  _LoadScriptSync("/Sys/cp.js");
  _LoadScriptSync("/Sys/sql.js");
  _CreateCP("sqliteplugin");

  // Adds the Iterable protocol
  // (for database results)
  function makeIterable(obj) {
    obj.nextIndex = 0;
    obj[Symbol.iterator] = function () {
      return {
        array: this.rows,
        nextIndex: this.nextIndex,
        next: function () {
          return this.nextIndex < this.array.length ? {
            value: this.array.item(this.nextIndex++),
            done: false
          } : {
            done: true
          };
        }
      };
    }
  }


  var database = sqlitePlugin.openDatabase(name);
  database.name = name;

  database.GetType = function () {
    return "Database";
  }
  database.GetName = function () {
    return database.name;
  }
  database.ExecuteSql = function (sql, params, success, error) {
    // if success and error are undefined
    // then return a Promise
    if (typeof success === "undefined" && typeof error === "undefined") {
      return new Promise(function (resolve, reject) {
        database.transaction(function (t) {
          t.executeSql(sql, params,
            function (t, r) {
              makeIterable(r);
              resolve(r);
            },
            function (tx, err) {
              console.log(err);
              reject(err);
            });
        });
      });

    } else {

      // else (success or error are passed
      // as arguments) then use callbacks

      if (!success) success = null;
      if (!error) error = _Err;

      database.transaction(function (tx) {
        tx.executeSql(sql, params,
          function (tx, res) {
            makeIterable(res);
            if (success) success.apply(database, [res])
          },
          function (t, e) {
            error.apply(database, [e.message]);
          }
        );
      }, error);
    }
  }
  database.Close = function () {
    database.close(_Log, _Err);
  }
  database.Delete = function () {
    sqlitePlugin.deleteDatabase(database.name, _Log, _Err);
  }
  return database;
}
