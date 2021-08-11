const express = require('express')
const morgan = require('morgan')
const app = express()
const usersRouter = require('./routes/users')
const postsRouter = require('./routes/posts')
require('dotenv').config()
const cors = require('cors')


app.use(morgan('tiny'))
app.use(express.static('static'))
app.use(cors())


//parsing json
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(express.static('static'))


app.use('/users', usersRouter)
app.use('/posts', postsRouter)
app.get('/', (req, res) => {
    res.send('Success!')
})

app.listen(process.env.PORT || 5000, () => {
    const mg = require('mongoose')

    mg.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    }, (err) => {
        if (err) console.log(err)
        else
            console.log('connected to db')
    })
    console.log('Listening on: ', process.env.PORT || 5000)
})