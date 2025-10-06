import express from "express"
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { readdir, access, constants, writeFile, readFile } from "fs"

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
    req.dirPath = __dirname + `/blog-files/${req.body.fileName}.txt`;
    access(req.dirPath,
        constants.F_OK, (err) => {
            if (err) {
                next();
            } else {
                res.send("There is already a blog with this name");
                return;
            }
        })
}

function readBLog(req, res, next) {
    readFile(__dirname + "/blog-files" + req.path, 'utf8', (err, data) => {
        if (err) {
            res.send("There was an error");
            console.log(err);

            return;
        } else {
            req.blogContent = data;
            next();
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
app.get(/.*\.txt$/, readBLog, (req, res) => {
    let blogName = req.path;
    blogName = blogName.slice(1, -4);

    res.render("blog-web.ejs", { blogName: blogName, blogContent: req.blogContent });
});
// Post requests:
app.post("/upload", checkReq, checkFiles, (req, res) => {
    writeFile(req.dirPath, req.body.blogContent, "utf8", (err) => {
        if (err) {
            res.send("There was an error please try again later !")
        } else {
            console.log("file created sucessfuly")
            res.redirect("/");
        }
    });
})
app.listen(port, () => {
    console.log(`server listening on port ${port}`);
})