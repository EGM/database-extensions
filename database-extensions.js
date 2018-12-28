// DOPE
// Database Object Promise Extension

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
// end DOPE

function reportError(msg) {
  app.Alert("Error: " + msg);
  console.log("Error: " + msg);
}

function createGui() {
  const Wb = 0.6; // button width
  const Hb = 0.1; // button height
  const layout = app.CreateLayout("Linear", "VCenter,FillXY");
  const add = app.CreateButton("Add to Database", Wb, Hb);
  const remove = app.CreateButton("Remove from Database", Wb, Hb);
  const deleteDb = app.CreateButton("Delete Database", Wb, Hb);
  results = app.CreateText("", 0.9, 0.4, "Multiline");

  add.SetOnTouch(function () {
    mydb.ExecuteSql("INSERT INTO test_table (data, data_num) VALUES (?,?)", ["test", 100])
      .catch(function (msg) {
        reportError(msg)
      })
    updateResults();
  });

  remove.SetOnTouch(function () {
    mydb.ExecuteSql("DELETE FROM test_table WHERE id > 3")
    updateResults();
  });

  deleteDb.SetOnTouch(function () {
    mydb.Delete();
    updateResults();
  });

  results.SetMargins(0, 0.1, 0, 0);
  results.SetBackColor("#ff222222");
  results.SetTextSize(18);

  layout.AddChild(add);
  layout.AddChild(remove);
  layout.AddChild(deleteDb);
  layout.AddChild(results);
  app.AddLayout(layout);
}

//Called when application is started.
function OnStart() {
  createGui();

  //Create or open a database called "MyData".
  mydb = app.OpenDatabase("MyData");
  //    db2 = new DB(db);

  //Create a table (if it does not exist already).
  mydb.ExecuteSql("CREATE TABLE IF NOT EXISTS test_table " +
    "(id integer primary key, data text, data_num integer)");

  //Get all the table rows.
  updateResults();
}

function updateResults() {
  results.SetText("");

  mydb.ExecuteSql('select * from test_table;')
    .then(function (res) {
      var s = "";
      for (var item of res) {
        s += item.id + ", " + item.data + ", " + item.data_num + "\n";
      }
      results.SetText(s);
    })
    .catch(function (msg) {
      reportError(msg)
    })
}
