import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import session from "express-session";
import passport from 'passport';
import { Strategy as OAuth2Strategy } from "passport-google-oauth2";


import route from "./routes/userRoutes.js";
import { router as authRouter } from './routes/auth.js';
import UserModel from './Models/User.js';
import dotenv from 'dotenv';

dotenv.config();



const app = express();


app.use(bodyParser.json());
app.use(cors({
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    credentials: true
}));
app.use(express.json());

app.use(session({
    secret: "YOUR SECRET KEY",
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());


const PORT = process.env.PORT || 6005;






const databaseUrl = process.env.DATABASE_URL;


mongoose.connect(databaseUrl , {
   
    serverSelectionTimeoutMS: 60000 
})
    .then(() => {
        console.log('Connected to MongoDB Atlas');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB Atlas:', error);
    });


app.use("/api", route);
app.use("/auth", authRouter);


const clientid = "824790838650-6ucrjfo5b8v4hska2vtj42obcnf0jaii.apps.googleusercontent.com" ;
const clientsecret = "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";


passport.use(new OAuth2Strategy({
    clientID: clientid,
    clientSecret: clientsecret,
    callbackURL: "/auth/google/callback",
    scope: ["profile", "email"]
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await UserModel.findOne({ googleId: profile.id });

        if (!user) {
            user = new UserModel({
                googleId: profile.id,
                displayName: profile.displayName,
                email: profile.emails[0].value,
                image: profile.photos[0].value
            });

            await user.save();
        }

        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

app.post('/signin', (req, res) => {
    const { email, password } = req.body;
    UserModel.findOne({ email: email })
        .then(user => {
            if (user) {
                if (password === user.password) {
                    res.json({ message: 'Success' });
                } else {
                    res.json({ message: 'Wrong Password' });
                }
            } else {
                res.json("No record");
            }
        })
        .catch(err => res.status(500).json({ error: err.message }));
});

app.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    UserModel.create({ name, email, password })
        .then(user => res.json({ message: "Registration successful. You can now log in." }))
        .catch(err => res.status(400).json({ error: err.message }));
});




app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});




