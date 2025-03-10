import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import router from './router'

dotenv.config()

const app = express()
const port = process.env.PORT || 3100

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api', router)

app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack)
    res.status(500).json({
        error: 'Internal Server Error',
        message:
            process.env.NODE_ENV === 'development' ? err.message : undefined,
    })
})

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})
