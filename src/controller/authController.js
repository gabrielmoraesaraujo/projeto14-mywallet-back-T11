import express from 'express';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import joi from 'joi';
dotenv.config();

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;
mongoClient.connect(() => {
  db = mongoClient.db("db_my_wallet");
});


export async function signUp(req, res){
  //name, email, password
  const user = req.body;

  const passwordHash = bcrypt.hashSync(user.password, 10);

  await db.collection('users').insertOne({ ...user, password: passwordHash })

  res.sendStatus(201);
}

export async function signIn(req, res){
  const { email, password } = req.body;

  const user = await db.collection('users').findOne({ email });

  if (user && bcrypt.compareSync(password, user.password)) {
    // Crie uma sessão na coleção de sessões para o usuário e retorne um token para o front-end
    const token = uuid();

    await db.collection("sessions").insertOne({
      userId: user._id,
      token
    });

    res.send({_id: user._id, name: user.name, email: user.email, token});


  } else {
    res.status(401).send("Dados inválidos! Revise os campos.");
  }
}

export async function getCredentials(req, res){
  const { authorization } = req.headers;
  const token = authorization?.replace('Bearer ', '');

  if(!token) return res.sendStatus(401);


  const session = await db.collection("sessions").findOne({ token });

  if (!session) {
 
    return res.sendStatus(401);
  }

  const user = await db.collection("users").findOne({ 
    _id: session.userId 
  })


  if(user) {
    delete user.password;
    res.send(user);
  } else {
    res.sendStatus(401);
  }

}


export async function checkIfUserLogged(headers){
  const { authorization } = headers;
  const token = authorization?.replace('Bearer ', '');

  if(!token)
  {
    console.log("caiu aqui3");
    return 400;
  }


  const session = await db.collection("sessions").findOne({ token });


  if (!session) {
    //console.log("caiu aqui1");
    return 401;
  }


  const user = await db.collection("users").findOne({ 
    _id: session.userId 
  });

  if(user) {
    delete user.password;
    return(user);
  } else {
    //console.log("caiu aqui");
    return 401;
  }
}