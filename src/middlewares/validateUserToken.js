import express from 'express';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;
mongoClient.connect(() => {
  db = mongoClient.db("db_my_wallet");
});


export async function validateUserToken(req,res, next){
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '');
  
    if(!token)
    {
      res.locals.user = 400;
      next();
    }
  
  
    const session = await db.collection("sessions").findOne({ token });
  
  
    if (!session) {
      res.locals.user = 401;
      next();
    }
  
  
    const user = await db.collection("users").findOne({ 
      _id: session.userId 
    });
  
    if(user) {
      delete user.password;
      res.locals.user = user;
      next();
    } else {
      res.locals.user = 401;
      next();
    }

 
  }
