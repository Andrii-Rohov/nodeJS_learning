const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');

dotenv.config({path: './config.env'});

mongoose.connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => {
    console.log("DB connection successful!")
});

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`));
const Tour = require(`${__dirname}/../../models/tourModel`);

const importData = async () => {
    try {
        await Tour.create(tours);
        console.log("Data imported successfully")
    } catch(err) {
        console.log(err)
    }
    process.exit();
};

const deleteData = async () => {
    try {
        await Tour.deleteMany();
        console.log("data deleted successfully")
    } catch(err) {
        console.log(err)
    }
    process.exit();
};

if (process.argv[2] === '--import') {
    importData();
} else if (process.argv[2] === '--delete') {
    deleteData();
} else {
    process.exit();
}