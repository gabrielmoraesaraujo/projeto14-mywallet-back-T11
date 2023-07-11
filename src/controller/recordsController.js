import express from 'express';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import joi from 'joi';
import dayjs from 'dayjs';
dotenv.config();
import { checkIfUserLogged } from './authController.js';

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;
mongoClient.connect(() => {
  db = mongoClient.db("db_my_wallet");
});
  

export async function getRecords(req, res){
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '');
    const userLogged = res.locals.user;
  
    //const userLogged = await checkIfUserLogged(req.headers);
    if (userLogged === 400 || userLogged === 401)
     {
      res.sendStatus(userLogged);
      return;
     }
  
    const records = await db.collection("mywallet").find({id: userLogged._id }).toArray();
  
    res.status(200).send(records.reverse());
  }