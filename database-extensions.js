// DOPE
// Database Object Promise Extension

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