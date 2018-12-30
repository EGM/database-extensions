# database-extensions

Additional functionality for databases on DroidScript platform.

versions

## 1.0.0

* Modified the `ExecuteSql' function to return a Promise if no arguments are passed as callbacks for success and failure.

### From
```javascript
    var s = "";  
    var len = results.rows.length;  
    for(var i = 0; i < len; i++ )   
    {  
        var item = results.rows.item(i)  
        s += item.id + ", " + item.data + ", " + item.data_num + "\n";   
    }  
    txt.SetText( s );  
```
### To
```javascript
      var s = "";
      for (var item of res) {
        s += item.id + ", " + item.data + ", " + item.data_num + "\n";
      }
      results.SetText(s);
```

* Added an Iterator to the results returned by the `ExecuteSql` function.
