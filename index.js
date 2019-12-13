const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
var bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const SELECT_ALL_STUDENTS_QUERY = `SELECT * FROM students`;
const SELECT_ALL_TUTORS_QUERY = `SELECT * FROM students WHERE isStudent=0`;


const connection = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"izz3dragonson",
    database:"bug-tracker"
});

connection.connect(err => {
    if(err){
        console.log(err);
    }else{
        console.log("connected to database")
    }
});

app.use(cors());

//GET ALL STUDENTS
app.get('/students', (req, res) => {
    connection.query(SELECT_ALL_STUDENTS_QUERY, (err,  results) => {

        if(err){
            return res.send(err);
        }else{
            return res.json({
                data: results
            });
        }
    });
});

//GET ALL TUTORS
app.get('/tutors', (req, res) => {
    connection.query(SELECT_ALL_TUTORS_QUERY, (err,  results) => {

        if(err){
            return res.send(err);
        }else{
            return res.json({
                data: results
            });
        }
    });
});

//GET TUTOR ID

app.get('/tutors::eventId', (req, res)=>{
    const GET_TUTOR_ID = `SELECT tutorId FROM events WHERE eventId="${req.params.eventId}" `
    connection.query(GET_TUTOR_ID, (err, results)=>{
        if(err){
            return res.send(err)
        }else{
            return res.json({
                data:results
            })
        }
    })
})

//GET EVENTS FOR  STUDENT
app.get('/events::studentId', (req,res)=>{
    const SELECT_EVENTS_FOR_STUDENT = `SELECT * FROM events WHERE studentId  ='${req.params.studentId}'`
    connection.query(SELECT_EVENTS_FOR_STUDENT, (err, results)=>{
        if(err){
            return res.send(err);
        }else{
            return res.json({
                data:results
            })
        }
    })
})
//GET EVENTS FOR  TUTOR
app.get('/events/tutor::tutorId', (req,res)=>{
    const SELECT_EVENTS_FOR_STUDENT = `SELECT * FROM events WHERE tutorId  ='${req.params.tutorId}'`
    connection.query(SELECT_EVENTS_FOR_STUDENT, (err, results)=>{
        if(err){
            return res.send(err);
        }else{
            return res.json({
                data:results
            })
        }
    })
})

//GET ONE STUDENTS COURSES
app.get('/registration::email', (req,res)=>{
    const SELECT_COURSES_FOR_STUDENT = `SELECT courseName FROM registration WHERE email  ='${req.params.email}'`
    connection.query(SELECT_COURSES_FOR_STUDENT, (err, results)=>{
        if(err){
            return res.send(err);
        }else{
            return res.json({
                data:results
            })
        }
    })
})

//GET ALL COURSES
app.get('/courses', (req,res)=>{
    const SELECT_ALL_COURSES_QUERY = `SELECT * FROM COURSES`
    connection.query(SELECT_ALL_COURSES_QUERY, (err, results)=>{
        if(err){
            return res.send(err);
        }else{
            return res.json({
                data:results
            })
        }
    })
})


//POST STUDENT/TUTOR AND STUDENT COURSES

app.post("/students",  (req,res) => {
    const {email, password, firstName, lastName, status, studentCourses, isStudent} = req.body;
    let courseArray = studentCourses.map(item=>{return{courseName:item.name, email:email}})

    if(isStudent){
        courseArray.forEach(item=>{
            const INSERT_COURSES_QUERY = `INSERT INTO registration (email, courseName) VALUES ("${item.email}", "${item.courseName}")`;
            connection.query(INSERT_COURSES_QUERY, (err, results)=>{
                if(err){
                    return err;
                }else{
                    return  console.log(`succesfully registered course`)
                }
            })
        })
    }

    const INSERT_STUDENT_QUERY =  `INSERT INTO students  (email, password, firstName, lastName, status, isStudent) 
                                   VALUES("${email}", "${password}", "${firstName}",  "${lastName}",  "${status}", ${isStudent}) `;

    connection.query(INSERT_STUDENT_QUERY, (err,  results)=>{
        if(err){
            return err
        }else{
            return  console.log("succesfully registered")
        }
    })
})

//POST  EVENT
app.post('/events', (req,res)=>{
    const {studentId, title, date, tutorId} = req.body;
    const INSERT_EVENT_QUERY = `INSERT INTO events (studentId, title, date, tutorId) VALUES ("${studentId}", "${title}", "${date}", "${tutorId}")`;
    connection.query(INSERT_EVENT_QUERY, (err, results)=>{
        if(err){
            return res.send(err);
        }else{
            return  res.send("succesfully saved  event")
        }
    })
})

//POST COURSE REGISTRATION

    app.post('/registration', (req,res)=>{
        const {email, courseName} = req.body;
        const INSERT_COURSES_QUERY = `INSERT INTO registration (email, courseName) VALUES ("${email}", "${courseName}")`;
        connection.query(INSERT_COURSES_QUERY, (err, results)=>{
            if(err){
                return res.send(err);
            }else{
                return  res.send(`succesfully registered course "${courseName}"`)
            }
        })
    })
//DELETE STUDENT EVENTS

    app.delete('/events', (req, res)=>{
        const {eventId} = req.body;
        console.log(eventId)
            const INSERT_EVENT_QUERY = `DELETE FROM events WHERE eventId="${eventId}"`;
            connection.query(INSERT_EVENT_QUERY, (err, results)=>{
                if(err){
                    return res.send(err);
                }else{
                    return  res.send(results)
                }
            })


    })

const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=>{
    console.log(`Server started on PORT ${PORT}`)
});