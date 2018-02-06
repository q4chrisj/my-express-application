const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const AWS = require('aws-sdk');

const USERS_TABLE = process.env.USERS_TABLE;
const dynamodb = new AWS.DynamoDB.DocumentClient();

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
    if(typeof userID !== 'string') {
        res.status(400).json({ errpr: '"userId" must be a string'});
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

    dynamoDb.put(params, (error) => {
        if(error) {
            console.log(error);
            res.status(400).json({ error: 'Could not create user'});
        }
        res.json({userID, name});
    });
});

module.exports.handler = serverless(app);