const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// MONGODB

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nucgrat.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
    useNewUrlParser: true,
    useUnifiedTopology: true,
    
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // client.connect((err) =>{
        //     if(err){
        //         console.log(err)
        //         return
        //     }
        // })

        // Collections
        const carsCollection = client.db('carHub').collection('cars')
        const photoCollection = client.db('carHub').collection('gallery')

        
        app.get('/carSearchByName/:name', async (req, res) => {
            const searchName = req.params.name;
            const result = await carsCollection.find({
                $or: [
                    {
                        name: { $regex: searchName, $options: "i" }
                    }
                ]
            }).toArray();
            res.send(result)
        })


        app.get('/cars/all', async (req, res) => {
            const result = await carsCollection.find().limit(20).toArray()
            res.send(result)
        })

        app.get('/cars/car/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await carsCollection.find(query).toArray()
            res.send(result)
        })

        app.post('/cars/add', async (req, res) => {
            const car = req.body;
            const result = await carsCollection.insertOne(car)
            res.send(result)
        })






        app.get('/cars/user', async (req, res) => {
            const email = req.query.email;
            const sortOrder = req.query.sortOrder;
            const query = { sellerEmail: email }

            let sortOptions = {};
            if (sortOrder === 'higher-price') {
                sortOptions = { price: -1 };
            } else if (sortOrder === 'lower-price') {
                sortOptions = { price: 1 };
            }

            const result = await carsCollection.find(query).sort(sortOptions).toArray();
            res.send(result);
        })


        

        app.put('/cars/update/:id', async (req, res) => {
            const id = req.params.id;
            const car = req.body;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updatedCar = {
                $set: {
                    name: car.name,
                    picture: car.picture,
                    rating: car.rating,
                    quantity: car.quantity,
                    description: car.description,
                    price: car.price
                }
            }
            const result = await carsCollection.updateOne(filter, updatedCar, options)
            res.send(result)
        })

        app.delete('/delete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await carsCollection.deleteOne(query)
            res.send(result)
        })

        app.get('/gallery', async (req, res) => {
            const result = await photoCollection.find().limit(12).toArray()
            res.send(result)
        })



        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Car Hub is running')
})

app.listen(port, () => {
    console.log(`Car Hub is running on ${port}`)
})