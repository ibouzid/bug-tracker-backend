const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const cors = require("cors");
const mysql = require("mysql");
const bodyParser = require('body-parser');
const jwt = require("jsonwebtoken");



app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));


const connection = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"izz3dragonson",
    database:"bugTracker"
});

connection.connect(err => {
    if(err){
        console.log(err);
    }else{
        console.log("connected to database")
    }
});

app.use(cors());


function verifyToken(req, res, next){

    const bearerHeader = req.headers['authorization'];
    if(typeof bearerHeader !== 'undefined'){

        const bearer = bearerHeader.split(" ");
        const token = bearer[1];
        req.token = token;
        next();

    }else{
        res.sendStatus(403);
    }
}

app.post('/login', (req,res)=>{
    const {userName, password} = req.body;
    const SELECT_USERNAME_PASSWORD =  `SELECT * FROM users WHERE userName="${userName}" AND password="${password}"`;
    connection.query(SELECT_USERNAME_PASSWORD, (err, results)=>{
        if(results==0){
            return res.sendStatus(403)

        }else{
            if(err){
                return res.send(err);
            }else{
                jwt.sign({results}, process.env.SECRET_OR_KEY,{expiresIn: '1 day'}, (err, token)=>{
                    res.json({
                        token:token,
                        user:results
                    })
                })
            }
        }

    })

})



//GET ISSUES
app.get('/issues', (req,res)=>{
    jwt.verify(req.token, process.env.SECRET_OR_KEY, (err, authData)=>{
        if(err){
            res.sendStatus(403);
        }else{
            const SELECT_ISSUES = `SELECT * FROM issues`
            connection.query(SELECT_ISSUES, (err, results)=>{
                if(err){
                    return res.send(err);
                }else{
                    return res.json({
                        data:results,
                        authData: authData
                    })
                }
            })
        }
    })

})

//GET ISSUE BY ID

app.get('/projects/:projectId/issues/:issueId', (req, res)=>{
    const GET_ISSUE = `SELECT * FROM issues WHERE issueId="${req.params.issueId}" AND projectId="${req.params.projectId}" `
    connection.query(GET_ISSUE, (err, results)=>{
        if(err){
            return res.send(err)
        }else{
            return res.json({
                data:results
            })
        }
    })
})
//GET ISSUES BY PROJECT ID

app.get('/projects/:projectId/issues', verifyToken, (req, res)=>{
    jwt.verify(req.token, process.env.SECRET_OR_KEY, (err, authData)=>{
        if(err){
            return res.sendStatus(403)
        } else{
            const GET_ISSUES = `SELECT * FROM issues WHERE projectId="${req.params.projectId}" `
            connection.query(GET_ISSUES, (err, results)=>{
                if(err){
                    return res.send(err);
                }else{
                    return res.json({
                        data:results
                    })
                }
            })
        }
    })
})

//GET USER BY ID
app.get('/users/:userId', verifyToken, (req,res)=>{
    jwt.verify(req.token, process.env.SECRET_OR_KEY, (err, authData)=>{
        if(err){
            return res.sendStatus(403)
        } else{
            const SELECT_USERS = `SELECT * FROM users WHERE userId="${req.params.userId}"`
            connection.query(SELECT_USERS, (err, results)=>{
                if(err){
                    return res.send(err);
                }else{
                    return res.json({
                        data:results
                    })
                }
            })
        }
    })

})

//GET USERS
app.get('/users', verifyToken, (req,res)=>{
    jwt.verify(req.token,process.env.SECRET_OR_KEY, (err, authData)=>{
      if(err){
          return res.sendStatus(403)
      } else{
          const SELECT_USERS = `SELECT * FROM users`
          connection.query(SELECT_USERS, (err, results)=>{
              if(err){
                  return res.send(err);
              }else{
                  return res.json({
                      data:results
                  })
              }
          })
      }
    })

})

//GET PROJECTS

app.get('/projects',verifyToken, (req,res)=>{
    jwt.verify(req.token, process.env.SECRET_OR_KEY, (err, authData)=>{
        if(err){
            return res.sendStatus(403)
        }
        else {
            const SELECT_PROJECTS = `SELECT * FROM projects`
            connection.query(SELECT_PROJECTS, (err, results)=>{
                if(err){
                    return res.send(err);
                }else{
                    return res.json({
                        data:results
                    })
                }
            })
        }

    })

})

//GET PROJECT BY ID
app.get('/projects/:projectId', verifyToken, (req,res)=>{
    jwt.verify(req.token, process.env.SECRET_OR_KEY, (err, authData)=>{
        if(err){
            return res.sendStatus(403)
        }
        else {
            const SELECT_PROJECT = `SELECT * FROM projects WHERE projectId  ='${req.params.projectId}'`
            connection.query(SELECT_PROJECT, (err, results)=>{
                if(err){
                    return res.send(err);
                }else{
                    return res.json({
                        data:results
                    })
                }
            })
        }

    })
})

//GET ALL USER PROJECTS

app.get('/users/:userId/projects', verifyToken, (req, res)=>{
    jwt.verify(req.token, process.env.SECRET_OR_KEY, (err, authData)=>{
        if(err){
            return res.sendStatus(403)
        }
        else {
            const SELECT_PROJECTS_BY_USERID = `SELECT DISTINCT projects.projectId, projects.projectDescription, projects.projectName, projects.createDate
                                       FROM projects
                                       JOIN issues 
                                       ON projects.projectId=issues.projectId
                                       WHERE userId='${req.params.userId}'`
            connection.query(SELECT_PROJECTS_BY_USERID, (err, results)=>{
                if(err){
                    return res.send(err);
                }else{
                    return res.json({
                        data:results
                    })
                }
            })
        }

    })

})


//EDITS ISSUE DATA
app.put("/issues/:issueId", (req, res)=>{
    const {attachment, title, description, severity, status, ticketType, points, userId, createDate, submittedBy} = req.body;
    const UPDATE_ISSUE = `UPDATE issues 
                          SET attachment='${attachment}',  title='${title}', issueDescription='${description}', severity='${severity}', status='${status}',
                                          ticketType='${ticketType}', points='${points}', userId='${userId}', createDate='${createDate}',
                                          submittedBy='${submittedBy}'
                          WHERE issueId='${req.params.issueId}'`

    connection.query(UPDATE_ISSUE, (err, results)=>{
        if(err){
            return res.send(err);
        }else{
            return  console.log(`succesfully updated issue`)
        }
    })
})

//POST ISSUE

app.post("/issues",  (req,res) => {
    const {projectId,projectName, attachment, title, issueDescription, severity, status, ticketType, points, userId, createDate, submittedBy} = req.body;

    const INSERT_ISSUE_QUERY = `INSERT INTO issues 
                                                (projectId, projectName, attachment, title, issueDescription, severity, status, ticketType, points, userId, createDate, submittedBy) 
                                                VALUES 
                                                ("${projectId}", "${projectName}", "${attachment}", "${title}", "${issueDescription}", "${severity}", "${status}", "${ticketType}",
                                                "${points}", "${userId}", "${createDate}", "${submittedBy}")`;


    connection.query(INSERT_ISSUE_QUERY, (err, results)=>{
        if(err){
            return res.send(err);
        }else{
            return  console.log(`succesfully added issue`)
        }
    })
})
//POST PROJECT

app.post("/projects",  (req,res) => {
    const {projectDescription,projectName, projectManager, createDate} = req.body;

    const INSERT_PROJECT_QUERY = `INSERT INTO issues 
                                                (projectDescription, projectName, projectManager, createDate) 
                                                VALUES 
                                                ("${projectDescription}", "${projectName}", "${projectManager}", "${createDate}")`;


    connection.query(INSERT_PROJECT_QUERY, (err, results)=>{
        if(err){
            return res.send(err);
        }else{
            return  console.log(`succesfully added project`)
        }
    })
})



//DELETE ISSUE

    app.delete('/issues', (req, res)=>{
        const {issueId} = req.body;
            const DELETE_ISSUE_QUERY = `DELETE FROM issues WHERE issueId="${issueId}"`;
            connection.query(DELETE_ISSUE_QUERY, (err, results)=>{
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