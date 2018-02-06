const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const AWS = require('aws-sdk');

const USERS_TABLE = process.env.USERS_TABLE;
const dynamoDb = new AWS.DynamoDB.DocumentClient();

app.use(bodyParser.json({string:false}));

app.get('/', function(req, res) {
    res.send('Hello World');
});

app.get('/users/:userId', function (req, res) {
    const params = {
        TableName: USERS_TABLE,
        Key: {
            userId: req.params.userId
        }
    };

    dynamoDb.get(params, (error, result) => {
        if (error) {
            console.log(error);
            res.status(400).json({error: 'Could not get user'});
        }
        if( result.Item) {
            const {userId, name} = result.Item;
            res.json({userId, name});
        } else {
            res.status(404).json({ error: "User not found"});
        }
    });
});

app.post('/users', function (req, res) {
    const {userId, name} = req.body;
    if(typeof userId !== 'string') {
        res.status(400).json({ error: '"userId" must be a string'});
    } else if (typeof name !== 'string') {
        res.status(400).json({ error: '"name" must be a string'});
    }

    const params = {
        TableName: USERS_TABLE,
        Item: {
            userId: userId,
            name: name
        }
    };

    const getParams = {
        TableName: USERS_TABLE,
        Key: {
            userId: userId
        }
    };

    dynamoDb.get(getParams, (error, data) => {
        console.log(data);
        if(error) {
            console.error(error, error.stack);
            res.status(400).json({ error: "An error occured"});
        } else if(data && data.Item && data.Item.userId === userId) {
            console.log("User exists: ", data.Item.userId);
            res.status(400).json({ error: "User exists: " + data.Item.userId})
        }
    });

    dynamoDb.put(params, (error) => {
        if(error) {
            console.log(error);
            res.status(400).json({ error: 'Could not create user'});
        }
        console.log("Creating user: ", name);
        res.status(200).json({userId, name});
    });

});

module.exports.handler = serverless(app);

// USAGE:
// export BASE_DOMAIN=https://rasdn7xasf.execute-api.us-east-1.amazonaws.com/dev
// Create: curl -H "Content-Type: application/json" -X POST ${BASE_DOMAIN}/users -d '{"userId": "chrisj", "name": "Chris Jones"}'
// Get: curl -H "Content-Type: application/json" -X GET ${BASE_DOMAIN}/users/chrisj