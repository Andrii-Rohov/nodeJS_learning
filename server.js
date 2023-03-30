const dotenv = require('dotenv');
const mongoose = require('mongoose');

process.on("uncaughtException", (err) => {
    //Uncaught Exeprions - problems in sync code a.k.a typos, non declare vars etc
    console.error(err.name, err.message);
    process.exit(1);
})

dotenv.config({path: './config.env'});

const app = require('./app');

mongoose.connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => {
    console.log("DB connection successful!")
});

const port = process.env.PORT || 8000;

// console.log(process.env);
// console.log(app.get('env'));

const server = app.listen(port, () => {
    console.log(`App runing on port ${port}...`);
});

process.on("unhandledRejection", (err) => {
    //Unhandled Rejection - problems in async code a.k.a Promises, fetch() etc
    console.error(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
})
