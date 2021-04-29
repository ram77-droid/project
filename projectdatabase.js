var mongoose = require('mongoose');
var url = "mongodb://localhost:27017/projectdata";
mongoose.set('useCreateIndex', true);
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true },function(err, db) {
  if (err) throw err;
  console.log("Database created!");
  //db.close();
});

