import Express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const app = Express()
app.use(cors())
app.use(Express.json())

// mobile app routes

app.get('/getUsers', async (req, res) => {
    try {
        const date = new Date()
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const day = date.getDate()

        const formatedDate = `${day}/${month}/${year}`
    
        const users = await prisma.user.findMany({
            where: {
                orders: {
                    every: {
                        NOT: {date: formatedDate}
                    }
                }
            }
        })
        res.send(users)
    } catch (error) {
        res.status(400).send(error)
    }
})

app.post('/createOrder', async (req, res) => {
    try {
        const { id, delivered, picked } = req.body
        if (!id || !delivered || !picked) {
            return res.status(400).send('invalid payload')
        }
        
        const date = new Date()
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const day = date.getDate()

        const formatedDate = `${day}/${month}/${year}`
    
        await prisma.order.create({
            data: {
                delivered,
                picked,
                userId: id,
                date: formatedDate
            }
        })
        res.send('ok')
    } catch (error) {
        res.status(400).send(error)
    }
})

app.listen(process.env.PORT || 5000)