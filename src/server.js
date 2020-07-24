require('dotenv').config()

const express = require('express')
const cors = require('cors')
const app = express()
const mongoose = require('mongoose')
const session = require('express-session');
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo')(session);

mongoose.connect(process.env.DB_CONNECTION_STRING, { useNewUrlParser: true })
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('connected to database'))

app.use(express.json())
app.use(cors())
app.use(cookieParser());
app.use(session({
    secret: 'faeb4453e5d14fe6f6d04637f78077c76c73d1b4',
    proxy: true,
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({ url: process.env.DB_CONNECTION_STRING })
}));

const usersRouter = require('./routes/users')
app.use('/api/users', usersRouter)
const priceAlertsRouter = require('./routes/priceAlerts')
app.use('/api/priceAlerts', priceAlertsRouter)

const port = 80;
app.listen(port, () => console.log(`server started at port ${port}`))