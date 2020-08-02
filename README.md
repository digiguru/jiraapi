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

If you want to debug this locally you will need a username and api token from Jira.

To test it locally form a GET request in postman, or use this Curl statement:

```
curl -X GET \
  http://localhost:4001/project/WED \
  -H 'password: xxxxxxxxx' \
  -H 'username: adam@hitched.co.uk'
```

(replacing the password and username as necessary)

## Tasklist
- [x] Move to separate project
- [x] Add CORs behaviour
- [x] Remove hardcoded login
- [x] Migrate code to github
- [ ] Allow setup of a random git URL
- [ ] Return the JQL Query with data
- [ ] Allow for dynamic JQL queries
- [ ] Save queries offline

To push - git push heroku master



