# Meal Recipe Planner

## Description
The **Meal Recipe Planner** is a web application designed to simplify meal planning by managing recipes and creating meal schedules. This project leverages MongoDB for efficient data storage and includes sharding to handle scalability, ensuring high availability and distributed data management.

## Features

- **Recipe Management:** Add, update, and delete recipes, categorized by ingredients or meal type.
- **Meal Planning:** Automatically generate meal schedules.
- **Ingredient Search:** Search for recipes based on available ingredients.
- **Scalable Data Storage:** Uses MongoDB with sharding for efficient data handling and distributed storage.

## Tech Stack

- **Backend:** Node.js and Express.js.
- **Database:** MongoDB with Sharding for distributed data management.

## Why MongoDB and Sharding?
MongoDB is a NoSQL database known for its flexibility and scalability, which fits perfectly with this application's needs. The sharding implementation ensures:

- **Horizontal Scaling:** Data is distributed across multiple nodes.
- **Improved Query Performance:** Queries are executed efficiently by targeting specific shards.
- **High Availability:** Data redundancy and resilience to node failures.
  
### Sharding in MongoDB cluster production-like using docker compose

![sharded-cluster](https://github.com/user-attachments/assets/367116a3-8e47-4ed5-8bda-365b6919eff4)

## We need to setup:

- Config servers ReplicaSet (`configserver1`, `configserver2`, `configserver3`) use the `--replSet configReplSet --configserver --bind_ip_all` command to run as a replica set and config servers, binding to all network interfaces, in production you should specify your IPs `--bind_ip localhost,192.51.100.1`
- Shard1 servers ReplicaSet (`shardsvr1`, `shardsvr2`, `shardsvr3`) use the `--replSet r0`
- Shard servers ReplicaSet(`shardsvr4`, `shardsvr5`, `shardsvr6`) use the `--replSet r1`
- The mongos router (`mongos`) uses the `--configdb` flag to connect to the config servers.

## Installation

```bash
docker-compose up
```

Connect to one of configserver members container:

```bash
docker exec -it configserver3 mongosh --port 27017
```

```bash
rs.initiate(
  {
    _id: "configReplSet",
    configsvr: true,
    members: [
      { _id: 0, host: "configserver1:27015" },
      { _id: 1, host: "configserver2:27016" },
      { _id: 2, host: "configserver3:27017" },
    ]
  }
)

rs.status()
```

```bash
docker exec -it shardsvr1 mongosh --port 27018
```

```bash
rs.initiate(
  {
    _id: "rs0",
    members: [
      { _id: 0, host: "shardsvr1:27018" },
      { _id: 1, host: "shardsvr2:27019" },
      { _id: 2, host: "shardsvr3:27020" },
    ]
  }
)

rs.status()
```

```bash
docker exec -it shardsvr4 mongosh --port 27022
```

```bash
rs.initiate(
  {
    _id: "rs1",
    members: [
      { _id: 0, host: "shardsvr4:27022" },
      { _id: 1, host: "shardsvr5:27023" },
      { _id: 2, host: "shardsvr6:27024" },
    ]
  }
)

rs.status()
```

```bash
docker exec -it mongos mongosh mongos:27021
```

```bash
sh.addShard("rs0/shardsvr1:27018,shardsvr2:27019,shardsvr3:27020")

sh.addShard("rs1/shardsvr4:27022,shardsvr5:27023,shardsvr6:27024")

db.adminCommand( { listShards: 1 } )

sh.status()
```

```bash
docker exec -it mongos mongosh mongos:27021/admin , || write this command # use admin;

db.adminCommand({
  "setDefaultRWConcern" : 1,
  "defaultWriteConcern" : {
    "w" : 2
  },
  "defaultReadConcern" : { "level" : "majority" }
})
```

```bash
docker exec -it mongos mongosh mongos:27021/config , || write this command # use config;

db.settings.updateOne(
   { _id: "chunksize" },
   { $set: { _id: "chunksize", value: 1 } },
   { upsert: true }
)
```

sharding and Indexes
If the collection already contains data, you must create an index that supports the shard key before sharding the collection.
If the collection is empty, MongoDB creates the index as part of sh.shardCollection().

switch to database

```bash
use mealrecipePlanner
```

```bash
sh.enableSharding("mealrecipePlanner");
```

```bash
db.meals.createIndex({ "name": "hashed" });
```

```bash
sh.shardCollection("mealrecipePlanner.meals", {"name" : "hashed"});

sh.status()
```

```bash
db.meals.find().explain();
```
to show in any shardName is it

```bash
db.meals.find({ name: "Apple Pie" }).explain();
```

## Benefits in This App:

- Allows for scaling as the recipe database grows.
- Ensures faster queries for specific recipe lookups or meal plans.
