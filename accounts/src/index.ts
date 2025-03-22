const app = express()
const port = parseInt(process.env.PORT || '3100', 10)

app.use(cors())
// ... existing code ... 