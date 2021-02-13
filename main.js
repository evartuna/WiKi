var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');

var template = {

  rhtml: function (title, list, body, control) {
    return `
      <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
      <html>
      <head>
      <title>WIKI - ${title}</title>
      <meta http-equiv="content-type" content="text/html; charset=iso-8859-1">
    
    <style>
    html,body{margin:0;padding:0}
body{font: 76% arial,sans-serif;text-align:center}
p{margin:0 10px 10px}
a{padding:5px; text-decoration:none; color:#000000;}
div#header{background-color:#F3F2ED;}
div#header h1{height:80px;line-height:80px;margin:0;padding-left:10px;}
div#container{text-align:left}
div#content p{line-height:1.4}
div#navigation{background:#F6F0E0;}
div#navigation ul{margin:15px 0; padding:0; list-style-type:none;}
div#navigation li{margin-bottom:5px;}
div#extra{background:#CCC8B3;}
div#footer{background:#BFBD93;}
div#footer p{margin:0;padding:5px 10px}
div#container{width:700px;margin:0 auto}
div#wrapper{float:left;width:100%}
div#content{margin: 0 175px}
div#navigation{float:left;width:150px;margin-left:-150px}
div#extra{float:left;width:150px;margin-left:-700px;height:300px;}
div#footer{clear:left;width:100%}
.btn {
  background: none;
  color: inherit;
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
  outline: inherit;
  padding-left: 5px;
}
    </style>
      </head>
      <body>
      <div id="container">
      <div id="header"><h1><a href="localhost:3000">WIKI</a></h1></div>
        <div id="wrapper">
          <div id="content">
              ${body}
          </div>
        </div>
        <div id="navigation">
          ${control}
        </div>
        <div id="extra">
          ${list}  
      </div>
        <div id="footer">
          <p>Footer</p>
        </div>
      </div>
      </body>
      </html>
          `;
  }
  ,
  list: function (filelist) {
    var list = '<ul>';
    var i = 0;
    while (i < filelist.length) {
      list = list + `<li><a href="/?id=${filelist[i]}">
    ${filelist[i]}</a></li>`;
      i += 1;
    }
    list = list + '</ul>'
    return list;
  }
}

function popup() {
  var a=0;
  if(a!=0)
    return confirm('Do you really want to submit the form?')
  else{
    alert('xx')
    return false;
  }
  }

var app = http.createServer(function (request, response) {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;


  if (pathname === '/') {
    if (queryData.id === undefined) {
      fs.readdir('./data', function (error, filelist) {

        var title = 'Welcome';
        var description = 'This is WIKI home';
        var list = template.list(filelist);
        var rhtml = template.rhtml(title, list, `<h2>${title}</h2>${description}`, '');
        response.writeHead(200);
        response.end(rhtml);
      })

    } else {
      fs.readdir('./data', function (error, filelist) {

        fs.readFile(`data/${queryData.id}`, 'utf8', function (err, description) {
          var title = queryData.id;
          var list = template.list(filelist);
          var rhtml = template.rhtml(title, list, `<h2>${title}</h2>${description}`,
            `
        <a href="/create">create</a><br/>
        <a href="/update?id=${title}">update</a> 
        <form action="delete_process" method="post" onsubmit="return confirm('정말 지울까요?');">
        <input type="hidden" name="id" value="${title}">
        <input type="submit" class="btn" value="delete">
      </form>`
        );
          response.writeHead(200);
          response.end(rhtml);
        });
      });
    }
  }
  else if (pathname === '/create') {
    fs.readdir('./data', function (error, filelist) {
      var title = 'WEB-create';
      // var description='Hello,Node.js';
      var list = template.list(filelist);
      var rhtml = template.rhtml(title, list, `<form action="/create_process" method="post">
      <p><input type="text" name="title" placeholder="title"></p>
      <p><textarea name="description" placeholder="description"></textarea></p>
      <p><input type="submit"></p></form>`, '');
      response.writeHead(200);
      response.end(rhtml);
    })
  }
  else if (pathname === '/create_process') {
    var body = '';
    request.on('data', function (data) {
      body += data;
    });
    request.on('end', function () {
      var post = qs.parse(body);
      var title = post.title;
      var description = post.description;
      fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
        response.writeHead(302, { Location: `/?id=${title}` });
        response.end();
      })
    });
  }
  else if (pathname === '/update') {
    fs.readdir('./data', function (error, filelist) {

      fs.readFile(`data/${queryData.id}`, 'utf8', function (err, description) {
        var title = queryData.id;
        var list = template.list(filelist);
        var rhtml = template.rhtml(title, list, `<form action="/update_process" method="post">
     <input type="hidden" name="id" value="${title}">
     <p><input type="text" name="title" placeholder="title" value="${title}"></p>
     <p><textarea name="description" placeholder="description">${description}</textarea></p>
     <p><input type="submit"></p></form>`,
          `
     <a href="/create">create</a><a herf="/update?id=${title}">update</a>`);
        response.writeHead(200);
        response.end(rhtml);
      });
    });
  }
  else if (pathname === '/update_process') {
    var body = '';
    request.on('data', function (data) {
      body += data;
    });
    request.on('end', function () {
      var post = qs.parse(body);
      var title = post.title;
      var id = post.id;
      var description = post.description;
      fs.rename(`data/${id}`, `data/${title}`, function (error) {
        fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
          response.writeHead(302, { Location: `/?id=${title}` });
          response.end();
        })
      });

    });
  }
  else if (pathname === '/delete_process') {
    var body = '';
    request.on('data', function (data) {
      body += data;
    });
    request.on('end', function () {
      var post = qs.parse(body);
      var id = post.id;
      fs.unlink(`data/${id}`, function (error) {
        response.writeHead(302, { Location: `/` });
        response.end();
      })

    });
  }
  else {
    response.writeHead(404);
    response.end('Not found');
  }


});

app.listen(3000);
