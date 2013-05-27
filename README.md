# Styleguide

The styleguide app that was presented during Friday Mavericking on 24th May. Included in this repo is the front-end and back-end system that we demo'd on Friday.

## Setting the Styleguide up locally

1. Install Node.js (http://nodejs.org)
2. Install MongoDB (http://docs.mongodb.org/manual/installation/)
3. `cd path-to-this-repo` and then `node server` to start the server.

The server will install the test data we used on Friday the first time a request is made if it cannot find the data in the MongoDB.

## MongoDB settings

`server: localhost`
`port: 27017`
`database: styleguide_db`
`collection: projects`

