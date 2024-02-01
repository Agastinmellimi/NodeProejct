const express = require('express');
const {open} = require('sqlite');
const sqlite3 = require('sqlite3')
const path = require('path');
const accountSid = 'AC7f1f2652ed8f415828162c2abe028d51';
const authToken = 'a35e48f1c888c642040b118e5a61489d';
const client = require('twilio')(accountSid, authToken);
const app = express();

app.use(express.json());

const dbPath = path.join(__dirname, 'userData.db')
let db = null;

const intializeServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3005, () => {
      console.log("Server Running at http://localhost:3005/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
}

intializeServer()




// Get all services in Service table
app.get('/', (req, res) => {
  res.send("Hello Agastin!")
})

app.get('/services', async (req, res) => {
  const query = `SELECT * FROM Services;`
  const servicesArray = await db.all(query)
  
  res.send(servicesArray);
});

// post services in Services table 
app.post('/services', async (req, res) => {
  const {id, service, image, description} = req.body
  let IdExistQuery = `SELECT * FROM Services WHERE id=${id};`
  const idExist = await db.get(IdExistQuery);
  const createServiceQuery = `INSERT INTO Services(id, service, image, description)
                              VALUES (${id}, "${service}", "${image}", "${description}");`
  console.log(idExist)
  if (idExist === undefined) {
       await db.run(createServiceQuery);
      res.send('Service Sucessfully Added');
  } else {
    res.status(400);
    res.send('Id is already exist');
  }
  
})

// {
//   "name": "Agastin",
//   "phoneNumber": 8008509938,
//   "message":"Hello, Pray for me"
// }

//send Whatsapp Message from twilio to my number 
app.post('/send-message', async (request, response) => {
  const {name, phoneNumber, message} = request.body
  
    client.messages
    .create({
        body: `I am ${name}, phone number -> ${phoneNumber}, request -> "${message}"`,
        from: 'whatsapp:+14155238886',
        to: 'whatsapp:+917569956320'
    })
    .then(() => response.send('Message sent'))
    .catch(() => response.send('Not send'));
  
  
})

