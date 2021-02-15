var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');

var template = {

  rhtml: function (title, list, body, control) {
    return `
      <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
      <html id="im">
      <head>
      <title>WIKI - ${title}</title>
      <meta http-equiv="content-type" content="text/html; charset=iso-8859-1">
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
      <!-- Global site tag (gtag.js) - Google Analytics -->
      <script async src="https://www.googletagmanager.com/gtag/js?id=G-E5PVVKQJT2"></script>
      <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
      
        gtag('config', 'G-E5PVVKQJT2');
      </script>

    <style>
    #im {
      margin: 0;
      height: 100%;
  }
    html,body{margin:0px;padding:0px;}
body{font: 76% arial,sans-serif;text-align:center}
p{margin:0 10px 10px}
a{padding:5px; text-decoration:none; color:#000000;}
div#header{background-color:#F3F2ED;}
div#header h1{height:80px;line-height:80px;margin:0;padding-left:10px;text-align:center;}
div#container{text-align:left}
div#content p{line-height:1.4}
div#navigation{background:#F6F0E0;}
div#navigation ul{margin:15px 0; padding:0; list-style-type:none;}
div#navigation li{margin-bottom:5px;}
div#extra{background:#CCC8B3;}
div#footer{background:#BFBD93; text-align:right;}
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
.sub {border-radius: 4px;}
.visible-scrollbar, .invisible-scrollbar, .mostly-customized-scrollbar {
  display: block;
  width: 10em;
  overflow: auto;
  height: 2em;
}

.invisible-scrollbar::-webkit-scrollbar {
  display: none;
}

/* Demonstrate a "mostly customized" scrollbar
 * (won't be visible otherwise if width/height is specified) */
.mostly-customized-scrollbar::-webkit-scrollbar {
  width: 5px;
  height: 8px;
  background-color: rgb(125, 108, 85); /* or add it to the track */
}
.mostly-customized-scrollbar {
  height: 300px;
}

/* Add a thumb */
.mostly-customized-scrollbar::-webkit-scrollbar-thumb {
    background: #000;
}

#jo{
  color:red;
  font-weight:bold;
  text-decoration:underline;
}


    </style>
      </head>
      <body id="im">
      <div id="container">
      <div id="header"><h1><a href="/">HelloWiki</a></h1></div>
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
          <p><a href="https://www.youtube.com/c/%EC%A1%B0%EC%BD%94%EB%94%A9JoCoding/featured" id="jo">제작 도움: 조코딩 유튜브 채널</a></p>
        </div>
      </div>
      </body>
      </html>
          `;
  }
  ,
  list: function (filelist) {
    var list = '<div class="mostly-customized-scrollbar"><ul>';
    var i = 0;
    while (i < filelist.length) {
      list = list + `<li><a href="/?id=${filelist[i]}">
    ${filelist[i]}</a></li>`;
      i += 1;
    }
    list = list + '</ul></div>'
    return list;
  }
}
function filter(){

  var value, name, item, i;

  value = document.getElementById("value").value.toUpperCase();
  item = document.getElementsByClassName("item");

  for(i=0;i<item.length;i++){
    name = item[i].getElementsByClassName("name");
    if(name[0].innerHTML.toUpperCase().indexOf(value) > -1){
      item[i].style.display = "flex";
    }else{
      item[i].style.display = "none";
    }
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
        response.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
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
        
        <form action="delete_process" method="post" accept-charset="utf-8" onsubmit="return confirm('really delete?');">
        <input type="hidden" name="id" value="${title}">
        <input type="submit" class="btn" value="delete">
      </form>
      <form action="search_process" method="post" accept-charset="utf-8" >
        <input type="text" name="id" value="search" style="width: 50px;">
        <input type="submit" class="sub" value="search">
        </form>`
        );
          response.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});
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
      var rhtml = template.rhtml(title, list, `<form action="/create_process" method="post" accept-charset="utf-8">
      <p><input type="text" name="title" placeholder="title" autofocus></p>
      <p><textarea name="description" placeholder="description"></textarea></p>
      <p><input type="submit"></p></form>`, '');
      response.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});
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
        var rhtml = template.rhtml(title, list, `<form action="/update_process" method="post" accept-charset="utf-8">
     <input type="hidden" name="id" value="${title}">
     <p><input type="text" name="title" placeholder="title" value="${title}"></p>
     <p><textarea name="description" placeholder="description">${description}</textarea></p>
     <p><input type="submit"></p></form>`,
          `
     <a href="/create">create</a><a herf="/update?id=${title}">update</a>`);
        response.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});
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
          response.writeHead(302, { Location: encodeURI(`/?id=${title}` )});
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
  else if(pathname==='/search_process'){
    var body = '';
    request.on('data', function (data) {
      body += data;
    });
    request.on('end', function () {
      var post = qs.parse(body);
      var id = post.id;
        response.writeHead(302, { Location: encodeURI(`/?id=${id}` )});
        response.end();
      
    });
  }
  else {
    response.writeHead(404);
    response.end('Not found');
  }


});

app.listen(80);
