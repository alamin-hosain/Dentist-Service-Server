const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();

//middleWare
app.use(cors());
app.use(express.json())

// Added Mongodb Connection here
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.gcdspqh.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// Mongodb Operation here
async function run() {
    const ServiceCollection = client.db('DentistServices').collection('service');
    const AllReviewsCollection = client.db('AllReviews').collection('review');

    try {
        // Getting only 3 services
        app.get('/services', async (req, res) => {
            const query = {};
            const cursor = ServiceCollection.find(query).limit(3);
            const result = await cursor.toArray();
            res.send(result);
        })


        // Adding a Service 
        app.post('/services/addservice', async (req, res) => {
            const service = req.body;
            const result = await ServiceCollection.insertOne(service);
            res.send(result)
        })


        // Getting all Services
        app.get('/servicesall', async (req, res) => {
            const query = {};
            const cursor = ServiceCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        // Getting Single Service with id.
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const cursor = ServiceCollection.find(query);
            const result = await cursor.toArray();
            res.send(result)
        })

        // Adding Review to the Server
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await AllReviewsCollection.insertOne(review);
            res.send(result);
        })

        // Getting all reviews
        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { serviceId: id };
            const cursor = AllReviewsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        // get service Created By user
        app.get('/userservice', async (req, res) => {
            let query = {};
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = ServiceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        })



    }

    finally {

    }
}
run().catch(e => console.error(e))











































app.get('/', (req, res) => {
    res.send('The Server has started')
})

app.listen(port, () => {
    console.log(`The server is running on port: ${port}`)
})