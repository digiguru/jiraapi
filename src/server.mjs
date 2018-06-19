import http from 'http';
import {DataLayer} from './JiraToDot/DataLayer';
import {isOriginAllowed} from './Http/CORs.mjs';


const port = process.env.PORT || 4000;

const requestHandler = async (request, response) => {
  let origin = request.headers.origin || 'http://default';
  
  //if (isOriginAllowed(origin)) {
  response.setHeader('Access-Control-Allow-Origin', origin);
  //}
	response.setHeader('Access-Control-Request-Method', '*');
	response.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
	response.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
  
  
  if ( request.method === 'OPTIONS' ) {
		response.writeHead(200);
		response.end();
		return;
	} else {
    response.writeHead(200);
    response.writeBody(origin);
    response.end();
    return;
  }

  console.log(request.url);

  const dirs = request.url.split("/");
  if(dirs.length !== 3 && dirs.length !== 4) {
    response.end(`Must have 2 directories (not ${dirs.length} in ${request.url}) - eg /project/WED`);
  }

  const path = dirs[1];
  const param = dirs[2];
  
  const login = {
    username: "adam@hitched.co.uk",
    password: "HcRyQVSbNOQE74HADSe0A8A6"
  }
  const dataLayer = new DataLayer(login);

  console.log(`${login.username} in ${path} with ${param}`);
  let data;
  
  if(path === "team") {
    
     data = await dataLayer.currentSprintForTeam(param);
  } else if (path === "project") {
     data = await dataLayer.currentSprintForProject(param);
  } else if (path === "version") {
     data = await dataLayer.version(param);
  } else if (path === "sprint") {
     data = await dataLayer.sprint(param);
  } else {
     response.end(`Ususual request. Must be team, project, version or sprint. Instead found ${path} in ${request.url}`);
  }
  response.end(JSON.stringify(data));
};

const server = http.createServer(requestHandler);

server.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
});