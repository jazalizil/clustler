Clustler cluster servers
========================

Data server that handle upload from the service server and splitted download on a client.
Connect to the service with sockets

Install
----

1. Install node.js
2. Run npm install in root path
3. Install MongoDB (see https://docs.mongodb.org/manual/installation/)
4. Set PORT environment variable as you want, but set it!

Run
----

On Linux/Osx
---

1. cd root path
2. mongod > /dev/null 2>&1 &
3. npm start

On Windows
---

1. Run MongoDB (see http://blog.ajduke.in/2013/04/10/install-setup-and-start-mongodb-on-windows/)
2. Open Node shell
3. cd project path
4. npm start
