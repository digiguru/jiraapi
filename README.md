# Jira API

This is intended as a proxy for Jira API. It adds CORs headers, but also tries to simplfy the inputs and outputs.

To run, install node & npm and download the project and run 

`npm install`

To test

`npm test`

to run 

`npm start`

Note - to add URLs that are allowed to access this api please check ./src/Http/CORs.mjs

Add any extra tests to 
./src/Http/CORs.test.js

This is running already in the cloud:

https://im-jira-api.herokuapp.com/

## Tasklist
- [x] Move to separate project
- [x] Add CORs behaviour
- [ ] Remove hardcoded login
- [ ] Allow for dynamic JQL queries
- [ ] Save queries offline



