const express = require("express"); 
const app = express(); 
const expressLayouts = require("express-ejs-layouts"); 
const bodyParser = require("body-parser");  

const mongoose = require("mongoose"); 
 

mongoose.connect("mongodb://127.0.0.1:27017/authentication")   
const db = mongoose.connection 

db.on("error", (err) => {
    console.log(err) 
}) 

db.once("open", () => {
    console.log("Connection Established Successfully!");  
})

const User = require("./models/user");  


// mongoose.connect("mongodb://127.0.0.1:27017/auth").then(() => {console.log("Connected TO DataBase!")}) 

app.use(bodyParser.urlencoded({limit:"10mb", extended:false}))  // To parse Body of REST POST method 

app.use(express.json()) 
app.set("view engine","ejs") 
app.set("views","./views")   
app.set("layout", "./layouts/layout") 
app.use(expressLayouts)   
app.use(express.static("public"))
// const users = []  



app.get("/", (req,res) => {
    // res.send("<h2>Welcome To Authentication App!</h2><h4>Go to <a href = '/signin'>Login</a> or <a href = 'signup'>Signup</a></h4>") 
    res.render("index.ejs");  
})  

app.get("/users", async (req,res) => {
    try{
        const users = await User.find({},); // {username:1, _id:0}    
        res.status(200).json(users)    
    }catch(err){
        console.log(err); 
        throw new Error(err)   
    }
}); 

app.post("/signup", async (req,res) => {
    const data = {
        username:req.body.username.toLowerCase(), 
        password:req.body.password, 
        name:req.body.name 
    }; 
    try{
        const existingUser = await User.findOne({username:req.body.username.toLowerCase()})  
        console.log(existingUser); 
        if(existingUser == null || existingUser == []){ 
            const user = new User(data);  
            const newUser = await user.save(); 
            // users.push(user);
            // res.status(201).json({message:"User Created Successfully!!"}); 
            res.render("index.ejs", {successMessage:"User Created SuccessFully!!"})   
        }else{
            // res.status(406).json({error:"Username Already Taken"})
            res.render("signup.ejs", {errorMessage:"Username Already Taken!"})  
            // throw new Error("UserName Already Exists");      
        }       
    
    }catch(err){ 
        console.log(err); 
        // res.status(500).send("Unexpected Error Occured!"); 
        res.render("signup.ejs", {errorMessage:"Internel Server Error Occured! Retry Later"})   

    }
      
}); 


app.post("/signin", async (req,res) => {

    try{
        const username = req.body.username.toLowerCase().trim();   
        const password = req.body.password; 
        // const auth = users.find(user => (user.username == username));  
        const auth = await User.findOne({username:username})  
        console.log(auth);  
        if(auth == null){ 
            // res.status(300).send("User Not Found!!")
            res.render("signin.ejs", {errorMessage:"User Not Found!"})   
        }else{
            if(auth.password == password){  
                // res.status(201).json(auth);
                // res.status(201).json("Signed In Successfully!!")  
                res.render("index.ejs", {successMessage:"Successfully Logged in!"});   
            }
            else{
                // res.status(401).json({error:"Incorrect Password!"}) 
                res.render("signin.ejs", {errorMessage:"Incorrect Password!"})    
            }

        }
    }
    catch(err){
        console.log(err); 
        res.status(500).json("Unexpected Error Occured");  
    }

});  

app.get("/signin", (req,res) => {
    res.render("signin.ejs")   
}); 

app.get("/signup", (req,res) => {
    res.render("signup.ejs")  
});  


// app.get("/getdb", async (req,res) => {
//     try{
//         let users = await User.find(); 
//         res.json(users);  
//     }catch(err){
//         console.log(err); 
//         res.status(500).send("Unexpected Error Occured!"); 
//     } 
// })  

// app.post("/postdb", async (req,res) => {
//     try{
//         const user = new User({username:req.body.username.toLowerCase(), name:req.body.name, password:req.body.password}); 
//         const newUser = await user.save(); 
//         res.status(201).json(newUser);  
//     }catch(err){
//         console.log(err);  
//     }
// })   


const PORT = 3000; 

app.listen(PORT, () => {
    console.log(`[SERVER]: Started at port ${PORT}`);  
    console.log(`Go To http://localhost:${PORT}/`)  
});  

