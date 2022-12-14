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


function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).send({ message: 'Unauthorized Access' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            res.status(403).send({ message: 'Unauthorized Access' })
        }
        req.decoded = decoded;
        next();
    })
}

// Mongodb Operation here
async function run() {
    const ServiceCollection = client.db('DentistServices').collection('service');
    const AllReviewsCollection = client.db('AllReviews').collection('review');


    // Implementing JWT toke
    app.post('/jwt', (req, res) => {
        const user = req.body;
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" })
        res.send({ token })
    })



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

        // Getting specific user review by query email
        app.get('/userreview', verifyJWT, async (req, res) => {
            const decoded = req.decoded;
            if (decoded.email !== req.query.email) {
                res.status(403).send({ message: 'Unauthorized Access' });
            }

            let query = {};
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = AllReviewsCollection.find(query);
            const userReview = await cursor.toArray();
            res.send(userReview);
        })

        // Deleting single review by id 
        app.delete('/userreview/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await AllReviewsCollection.deleteOne(query);
            res.send(result);
        })


        // Updating a Review
        app.put('/updatereview/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const review = req.body;
            const option = { upsert: true };
            const updatedReview = {
                $set: {
                    name: review.name,
                    rating: review.rating,
                    photoUrl: review.photoUrl,
                    addedReview: review.addedReview,
                    time: review.time
                }
            }
            const result = await AllReviewsCollection.updateOne(filter, updatedReview, option);
            res.send(result)

        })



        // Getting  a review by id
        app.get('/updatereview/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const review = await AllReviewsCollection.findOne(query);
            res.send(review)
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

        // get all the reviews
        app.get('/allreviews', async (req, res) => {
            const query = {};
            const cursor = AllReviewsCollection.find(query).limit(3);
            const result = await cursor.toArray();
            res.send(result);
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