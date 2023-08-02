const express = require('express');
const multer = require('multer');
const AWS  = require('aws-sdk');
require('dotenv').config()

const port = 5000;

const app = express();

app.use(express.static('public'));

AWS.config.update({
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
    region: process.env.S3_REGION
});


const storage = multer.memoryStorage();
const upload = multer({storage});

app.get('/', (req,res)=>{
    res.sendFile(__dirname + "/index.html");
});

app.get('/files', (req, res) => {
    const s3 = new AWS.S3();

    const listParams = {
        Bucket: process.env.MY_BUCKET_NAME
    }

    s3.listObjectsV2(listParams, (err, data) => {
        if(err){
            console.log("Error Fetching Files", err);
            return res.status(500).send("Internal Server Error!");
        }

        const files = data.Contents.map(file => ({
            name: file.Key,
            url: `https://${process.env.MY_BUCKET_NAME}.s3.amazonaws.com/${file.Key }`
        }))

        res.json(files);
    }) 
})

app.post('/upload', upload.array('files'), (req,res) => {
    if(!req.files || req.files.length === 0){
        return res.status(400).send("File Not Found!");
    }

    const s3 = new AWS.S3();
    const uploadPromises = req.files.map((file) => {
        const uploadParams = {
            Bucket: process.env.MY_BUCKET_NAME,
            Key: file.originalname,
            Body: file.buffer
        }

        return s3.upload(uploadParams).promise();
    });

    Promise.all(uploadPromises).then(data => {
        data.forEach(uploadResult => {
            console.log("File Uploaded Successfully!");
            res.redirect('/');
        });
    })
});

app.delete('/file/:name', (req,res) => {
    const s3 = new AWS.S3();

    const deleteParams = {
        Bucket: process.env.MY_BUCKET_NAME,
        Key: req.params.name
    }

    s3.deleteObject(deleteParams, (err, data) => {
        if(err){
            console.log("Error Fetching Files", err);
            return res.status(500).send("Internal Server Error!");
        }
        res.send("File Deleted Successfully! ")
    })
})

app.get("/files/:name/download", (req,res) => {
    const s3 = new AWS.S3();

    const downloadParams = {
        Bucket: process.env.MY_BUCKET_NAME,
        Key: req.params.name
    }

    s3.getObject(downloadParams, (err, data) => {
        res.attachment(req.params.name);

        res.send(data.Body);
    })
})


app.listen(port, () => {
    console.log(`Server Listining To Port No ${port}`);
});
 


