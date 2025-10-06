import express from "express"
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { readdir, access, constants } from "fs"

const app = express();
const port = 3000;

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = dirname(__filename);

//encoders:

app.use(express.urlencoded({ extended: true }));
app.use(express.json());



//Middle wares:

function getFiles(req, res, next) {
    readdir(__dirname + "/blog-files", (err, data) => {
        if (err) { res.send("There was an error"); return; } else {
            console.log("Files read succesfully");
            req.data = data;
            next();
        }
    });
}

function checkReq(req, res, next) {
    if (req.body.fileName && req.body.blogContent) {
        next();
    } else {
        res.send("Please enter all the values")
        return;
    }
}

function checkFiles(req, res, next) {
    access(__dirname + `/blog-files/${req.body.fileName}`,
        constants.F_OK, (err) => {
            if (err) {
                next();
            } else {
                res.send("There is already a blog with this name");

            }
        })
}
//Http requests handeling "CRUD" :

// Get requests:

app.get("/", getFiles, (req, res) => {
    res.render("index.ejs", { data: req.data });
})
app.get("/upload", (req, res) => {
    res.render("upload.ejs");
});

// Post requests:
app.post("/upload", checkReq, checkFiles, (req, res) => {

})
app.listen(port, () => {
    console.log(`server listening on port ${port}`);
})