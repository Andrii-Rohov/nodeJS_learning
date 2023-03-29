const dotenv = require('dotenv');
const mongoose = require('mongoose');

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

app.listen(port, () => {
    console.log(`App runing on port ${port}...`);
})