var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
var multer = require('multer');
const {body, validationResult} = require('express-validator')
const db = 'mongodb+srv://nhatthanh:tH1Q6cm2DALowCiK@cluster0.bjchc.mongodb.net/thi?retryWrites=true&w=majority'
const {Schema} = mongoose;
mongoose.connect(db).catch(err => {
    if (err) {
        console.log("co loi: " + err.message)
    }
});

const accounts = new Schema({
    id: String,
    name: String,
    email: String,
    pass: String,
    // filePath: {
    //     type: String,
    //     required: true
    // },
})

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.originalname.toString().indexOf('.jpg') > 0) {
            cb(null, 'uploads/');
        } else {
            cb(new Error('JPG Only!!!!'))
        }
    },
    filename: function (req, file, cb) {
        cb(null, Math.random() + Date.now() + file.originalname);
    },
});
var upload = multer({
    storage: storage,
    limits: {fileSize: 2 * 1024 * 1024}
}).single('avatar')

const Accounts = mongoose.model('acounts', accounts)

/* GET home page. */
router.get('/', async function (req, res, next) {
    const data = await Accounts.find({})
    res.render('index', {data: data});
})

router.post('/add-acc',
    body('id', 'khong de trong id').notEmpty(),
    body('name', 'khong de trong name').notEmpty(),
    body('email', 'khong de trong email').notEmpty(),
    body('email', 'email phai dung dinh dang').isEmail(),
    body('pass', 'khong de trong pass').notEmpty(),
    body('pass', 'pass >2 <7 ki tu').isLength({min: 2, max: 7})
    , async function (req, res, next) {
        const err = validationResult(req)
        const alert = err.array()
        if (!err.isEmpty()) {
            res.render('index',
                {
                    alert,
                    id: req.body.id,
                    name: req.body.name,
                    email: req.body.email,
                    pass: req.body.pass,
                }
            );
        } else {
            var file = ''
            upload(req, res, function (err) {
                file = req.path
            })

            console.log(file)

            const {id, name, email, pass} = req.body
            const newAcount = new Accounts({
                id: id,
                name: name,
                email: email,
                pass: pass,
            })
            await newAcount.save(function (err) {
                if (!err) {
                    res.redirect('/')
                }
            })

        }
    })

router.get('/update', function (req, res, next) {
    res.render('update');
});

router.post('/update', function (req, res, next) {
    const {_id, id, name, email, pass} = req.body
    res.render('update', {
        id: id,
        name: name,
        email: email,
        pass: pass,
        _id: _id
    });
});

router.post('/update-acc', function (req, res, next) {
    const {_id, id, name, email, pass} = req.body
    console.log(_id)
    Accounts.updateOne({_id: _id}, {
        id: id,
        name: name,
        email: email,
        pass: pass
    }, function (err) {
            res.render('update', {
                id: '',
                name: '',
                email: '',
                pass: '',
                _id: ''
            });
    })

})
;

router.get('/delete', async function (req, res, next) {
    await Accounts.deleteOne({_id: req.query._id})
    res.redirect('/');
});

router.get('/find', async function (req, res, next) {
    var data = await Accounts.find({id: req.query.search})
    res.render('index', {data: data});
});

module.exports = router;
