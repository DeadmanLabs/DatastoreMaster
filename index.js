const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({}));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const datastore = req.body.datastore;
        if (!fs.existsSync(`datastores/${datastore}`)) {
            fs.mkdirSync(`datastores/${datastore}`);
        }
        cb(null, `datastores/${datastore}`);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

app.post('/upload', upload.array('files'), (req, res) => {
    const datastore = req.body.datastore;
    const text = req.body.text;

    if (!fs.existsSync(`datastores/${datastore}`)) {
        return res.status(400).send('Datastore does not exist');
    }

    const textFilePath = `datastores/${datastore}/urls.txt`;
    if (text) {
        if (path.existsSync(textFilePath)) {
            fs.writeFileSync(textFilePath, '');
        }
        existingText = fs.readFileSync(textFilePath, 'utf8');
        if (!existingText.includes(text)) {
            fs.writeFileSync(textFilePath, text + '\n', { flag: 'a' });
        }
    }

    if (req.files) {
        req.files.forEach((file) => {
            const filePath = path.join(`datastores/${datastore}`, file.originalname);
            if (!fs.existsSync(filePath)) {
                fs.copyFileSync(file.path, filePath);
                fs.unlinkSync(file.path);
            }
        });
    }
    console.log(`[+] - Content Uploaded to datastore ${datastore}!`);
    return res.status(200);
});

app.post('/createDatastore', (req, res) => {
    const datastore = req.body.datastore;
    if (fs.existsSync(`datastores/${datastore}`)) {
        return res.status(301);
    }
    fs.mkdirSync(`datastores/${datastore}`);
    console.log(`[+] - Created datastore ${datastore}!`);
    return res.status(200);
});

app.get('/listDatastores', (req, res) => {
    if (!fs.existsSync('datastores')) {
        return res.send([]);
    }

    fs.readdir('datastores', (err, files) => {
        if (err) {
            return res.status(500);
        }
        console.log(`[!] - Datastores grabbed!`);
        res.send(files);
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`)
})