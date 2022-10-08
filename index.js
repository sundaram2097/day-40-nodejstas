const express = require('express');
const app = require(express);
const mongodb = require('mongodb');
const mongoClient = mongodb.MongoClient;
const URL = "mongodb://localhost:27017";

app.use(express.json());


app.get('/mentor', async function (req, res) {
    try {
        let connection = await mongoClient.connect(URL)
        let db = connection.db("guvi")
        let users = await db.collection("mentor").find({}).toArray();
        await connection.close();
        res.json(users)

    } catch (error) {
        console.log(error)
    }
})


app.get('/student', async function (req, res) {
    try {
        let connection = await mongoClient.connect(URL)
        let db = connection.db("guvi")
        let users = await db.collection("student").find({}).toArray();
        await connection.close();
        res.json(users)

    } catch (error) {
        console.log(error)
    }
})


//Write API to create Mentor
app.post("/create-mentor", async (req, res) => {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("guvi");
        await db.collection("mentor").insertOne(req.body);
        res.json({
            message: "Mentor created",
        });
        connection.close();
    } catch (error) {
        console.log(error);
    }
});

//Write API to create Student
app.post("/create-student", async (req, res) => {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("guvi");
        await db.collection("student").insertOne(req.body);
        res.json({
            message: "Student created",
        });
        connection.close();
    } catch (error) {
        console.log(error);
    }
});

//Write API to Assign a student to Mentor
app.put("/update-mentor/:name", async (req, res) => {
    try {
        let name = req.params.name;

        req.body.Students.forEach(async (obj) => {
            let connection = await mongoClient.connect(URL);
            let db = connection.db("guvi");

            let student_data = await db.collection("student").find({ name: obj }).toArray();
            if (!student_data[0].mentor) {
                await db.collection("student").findOneAndUpdate({ name: obj }, { $set: { mentor: name } });
                await db.collection("mentor").findOneAndUpdate({ name }, { $addToSet: { Students: { $each: [obj] } } });
                await connection.close();
            }

        });
        res.json({
            message: "Mentor created",
        });

    } catch (error) {
        console.log(error)
    }
});


////Write API to Assign or Change Mentor for particular Student
app.put("/update-student-mentor/:studentName", async (req, res) => {
    try {
        let name = req.params.studentName;
        let connection = await mongoClient.connect(URL);
        let db = connection.db("guvi");
        let student_data = await db.collection("student").find({ name }).toArray();
        let mentor_data = student_data[0].mentor;
        await db.collection("student").findOneAndUpdate({ name }, { $set: { mentor: req.body.mentor } });
        await db.collection("mentor").findOneAndUpdate({ name: req.body.mentor }, { $addToSet: { Students: { $each: [name] } } });
        await db.collection("mentor").findOneAndUpdate({ name: mentor_data }, { $pull: { Students: name } });
        res.json({
            message: "Mentor Updated",
        });

    } catch (error) {
        console.log(error)
    }
});


//Write API to show all students for a particular mentor
app.get("/studentlist/:mentor", async (req, res) => {
    let connection = await mongoClient.connect(URL);
    let db = connection.db("guvi");
    let mentor = await db.collection("mentor").find({ name: req.params.mentor }).toArray();
    if(mentor){
    res.json({
      message: "Student Details of Mentor",
      data : mentor[0].Students
    });
    }
    else{
      res.json({
        message:"No mentor data found"
      })
    }
  });
  

app.listen(3001)