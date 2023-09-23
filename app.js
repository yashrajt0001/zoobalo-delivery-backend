import Express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'

import { PrismaClient } from '@prisma/client'
import { fetchUser } from './middleware/fetchUser.js'
const prisma = new PrismaClient()

const app = Express()
app.use(cors())
app.use(Express.json())

app.post('/adminLogin', async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(400).send('invalid payload')
        }
    
        const admin = await prisma.moderator.findFirst({
            where: {email, role: 'admin'}
        })
    
        if (!admin) {
            return res.status(400).send('invalid email')
        }
    
        const passwordMatch = password === admin.password

        if (!passwordMatch) {
            return res.status(400).send('wrong password')
        }
    
        const data = {
            user: {email}
        }
    
        const token = jwt.sign(data, 'secret123')
        res.status(200).send({token})
    } catch (error) {
        console.log(error)
    }
})

app.get('/getAllUsers', fetchUser, async (req, res) => {
    const users = await prisma.user.findMany()
    res.send(users)
})

app.post('/updateUser',fetchUser, async (req, res) => {
    const { name, mobile, address, balance, id } = req.body
    console.log(name, mobile, address, balance, id)
    if (!name || !mobile || !address || balance == undefined) {
        return res.status(400).send("invalid payload")
    }

    await prisma.user.update({
        data: {
            name,
            mobile,
            address,
            balance
        },
        where: {
            id
        }
    })

    res.send('ok')
})

app.get('/history', fetchUser, async (req, res) => {
    try {
        const id = req.query.id
        const orders = await prisma.order.findMany({
            where: {id}
        })
        res.send(orders)
    } catch (error) {
        res.send(error)
    }
})


app.post('/createUser',fetchUser, async (req, res) => {
    // try {
        const { name, mobile, address, balance } = req.body
        if (!name || !mobile || !address) {
            return res.status(400).send('all parametres required')
        }
    
        await prisma.user.create({
            data: {
                name,
                mobile,
                address,
                balance
            }
        })
        res.send('ok')
    // } catch (error) {
    //     res.status(400).send(error)
    // }
})

// mobile app routes

app.get('/getUsers', async (req, res) => {
    // try {
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
        // const users = await prisma.user.findMany()
        res.send(users)
    // } catch (error) {
    //     res.status(400).send(error)
    // }
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