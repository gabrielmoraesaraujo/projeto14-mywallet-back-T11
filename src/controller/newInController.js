import express from 'express';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import joi from 'joi';
import dayjs from 'dayjs';
dotenv.config();
import { checkIfUserLogged } from './authController.js';


const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;
mongoClient.connect(() => {
  db = mongoClient.db("db_my_wallet");
});

const newInSchema = joi.object({
  value: joi.number().required(),
  descr: joi.string().required()
})



export async function newIn(req, res){
  const {value, descr, type} = req.body;
  const validation = newInSchema.validate({value, descr});
  const userLogged = res.locals.user;

  if(validation.error){
      console.log(validation.error.details);
      console.log("caiu aqui");
      res.sendStatus(422);
      return;
  }


  try{
    //const userLogged = await checkIfUserLogged(req.headers);
    if (userLogged === 400 || userLogged === 401)
     {
      console.log("caiu aqui2");
      res.sendStatus(userLogged);
      return;
     }
  
  
    const time = dayjs().format('DD/MM');
  
    await db.collection('mywallet').insertOne({id: userLogged._id, value, descr, type, time});
    //console.log("caiu aqui5");
    res.sendStatus(201);
    
  

  }catch(error){
    console.log("caiu aqui3");
    res.status(422).send(error);
  }


  
}