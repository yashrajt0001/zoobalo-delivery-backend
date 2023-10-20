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
        const users = await prisma.today_delivery.findMany({
            where: {
                isDelivered: false,
            },
            orderBy: {
                priority: 'asc'
            },
            include: {
                user: {
                    select: {
                        address: true,
                        balance: true,
                        mobile: true,
                        name: true,
                        id: true,
                        due: true
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
    // try {
        const { id, userId, delivered, picked } = req.body
        if (!id || !delivered || !picked || !userId) {
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
                userId,
                date: formatedDate
            }
        })

        await prisma.today_delivery.update({
            where: { id },
            data: {
                isDelivered: true
            }
        })

        const dueTiffin = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                due: true
            }
        })

        const totalDueTiffin = dueTiffin.due + (delivered - picked)

        await prisma.user.update({
            where: { id: userId },
            data: {
                due: totalDueTiffin
            }
        })
        return res.send('ok')
    // } catch (error) {
    //     res.status(400).send(error)
    // }
})

app.post('/login', async (req, res) => {
    try {
        await prisma.login.create({
            data: {
                action: 'login'
            }
        })
        return res.send('ok')
    } catch (error) {
        res.status(400).send(error)
    }
}) 

app.post('/logout', async (req, res) => {
    try {
        await prisma.login.create({
            data: {
                action: 'logout'
            }
        })
        return res.send('ok')
    } catch (error) {
        return res.status(400).send(error)
    }
})

app.get('/getLogin', async (req, res) => {
    try {
        const action = await prisma.login.findMany({
            orderBy: {
                date: 'desc',
            },
            select: {
                action: true
            },
            take: 1
        })
        return res.send(action)
    } catch (error) {
        return res.status(400).send(error)
    }
})

app.listen(process.env.PORT || 5000)