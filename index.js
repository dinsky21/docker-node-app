const express = require('express')
const mongoose = require('mongoose')
const redis = require('redis')
const session = require('express-session')
const cors = require('cors')
let RedisStore = require('connect-redis')(session)
const { MONGO_USER, MONGO_PASSWORD, MONGO_IP, MONGO_PORT, SESSION_SECRET, REDIS_URL, REDIS_PORT } = require('./config/config')
let redisClient = redis.createClient({
	host: REDIS_URL,
	port: REDIS_PORT
})

const postRouter = require('./routes/postRoutes')
const userRouter = require('./routes/userRoutes')

const app = express()
const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`

app.get('/api', (req, res) => {
	res.send('<h2>Hi There!!! Arthur Chiu So Cute 1224<h2>')
	console.log('Yeah!!!')
})
const port = process.env.PORT || 4000

//會嘗試連線MongoDB，如果失敗會每隔5秒重試一次
const connectWithRetry = () => {
	mongoose.connect(mongoURL).then(()=>{
		console.log('DB connected')
	}).catch((err)=>{
		console.log(err)
		setTimeout(connectWithRetry, 5000)
	})
}

connectWithRetry()

app.enable('trust proxy')
app.use(cors({}))

app.use(session({
	store: new RedisStore({ client: redisClient }),
	secret: SESSION_SECRET,
	cookie: {
		secure: false,
		resave: false,
		saveUninitialized: false,
		httpOnly: true,
		maxAge: 30000,
	}
}))

app.use(express.json())

app.use('/api/v1/posts', postRouter)
app.use('/api/v1/users', userRouter)


app.listen(port, () => {
	console.log(`Server is up on port ${port}`)
})