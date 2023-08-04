const mongoose = require('mongoose');

const mongoURI = 'mongodb+srv://loki:1234loki@cluster0.maf972m.mongodb.net/Keeper?retryWrites=true&w=majority';

module.exports = async function () {
    try {
        await mongoose.connect(mongoURI, { useNewUrlParser: true });
        console.log("Connected to MongoDB");

        const formCollection = mongoose.connection.collection("maindatas");
        const data = await formCollection.find({}).toArray();

        return data;
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        throw err;
    }
};
