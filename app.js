//事前準備//
const express = require('express');
const mysql = require('mysql')
const session = require('express-session');
const bcrypt = require('bcrypt');
const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));

const connection = mysql.createconnection ({
    host: 'localhost',
    user: 'root',
    password: 'sota',
    database: 'attendance'
});

app.use(
    session({
      secret: 'my_secret_key',
      resave: false,
      saveUninitialized: false,
    })
  );

  //ここから本編//
app.use((req, res, next) => {
  if (req.session.userid === undefined) {
    res.locals.username = 'ゲスト';
    res.locals.isLoggedIn = false;
  } else {
    res.locals.username = req.session.username;
    res.locals.isLoggedIn = true;
    }
  next();
});
  
app.get('/', (req, res) => {
  res.render('top.ejs');
});
  
app.post('/top', (req, res) => {
  const name = req.body.name;
  const password = req.body.password;
  connection.query(
    'SELECT * FROM attendance.table1 WHERE name = ?',
    [name],
    (error, results) => {
      if (results.length > 0) {
        if (password === results[0].password){
          req.session.id = results[0].id;
          req.session.name = results[0].name;
          //ここのどこかが間違えている？//
          res.redirect('/index');
        } else {
          res.redirect('/top');
        }    
      } else {
        res.redirect('/top');
    }
  });
});

app.get('/index', (req, res) => {
  connection.query(
    'SELECT * FROM items',
    (error, results) => {
      res.render('index.ejs', {items: results});
    }
  );
});

app.post('/create', (req, res) => {
  connection.query(
    'INSERT INTO items (date, in, out, relax) VALUES (?)',
    [req.body.date, req.body.in, req.body.out, req.body.relax],
    (error, results) => {
      res.redirect('/index');
      //ここもどこかが間違えている？//
    }
  );
});

app.post('/apply', (req, res) => {
  //店長（社長）のメールに送信されるプログラムがここにくるはず//
  res.redirect('/index')
});

  app.listen(3000);
