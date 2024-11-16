const express = require('express');
const app = express();
const path = require('path');
const cookieparser = require("cookie-parser");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const user = require('./model/user');
const post = require('./model/post');
const upload = require('./config/multerConfig');

app.use(express.static(path.join(__dirname,"public")));
app.use(cookieparser());
app.set("view engine", "ejs");
app.set('views',path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/',(req,res)=>{
    if(req.cookies.Token){
        res.redirect('/posts');
    }else{
        res.redirect('/login');
    }
});

app.get('/profile/create',(req,res)=>{
    if(req.cookies.Token){
        res.send("User Already logIn");
    }else{
        res.render('Signup');
    }
});

app.post('/create', upload.single("profilePic") ,async(req,res)=>{

    if (!((req.body.name) && (req.body.username) && (req.body.password) && (req.body.age) && (req.body.email))) return res.send('Please fill all data');

    let check_user = await user.findOne({Username : req.body.username});
    if (check_user) return res.send('Username Already Exist');

    check_user = await user.findOne({Email : req.body.email});
    console.log(req.file);
    if (check_user) return res.send('Email Already Exist');

    let picfilename = '';
    if (req.file) {
        picfilename = req.file.filename;
    }else{
        picfilename = 'profile.png';
    }
    
    bcrypt.genSalt(12,(err,salt)=>{
        if (err) return res.send('Something Went wrong');
        bcrypt.hash(req.body.password,salt,async(err,hash)=>{
            if (err) return res.send('Something Went wrong');
            let created_user = await user.create({
                Name : req.body.name,
                Username : req.body.username,
                Email : req.body.email,
                Password : hash,
                Age : req.body.age,
                ProfilePic : picfilename,
            });
            res.redirect('/login');
        });
    });

});

app.get('/login',(req,res)=>{
    if(req.cookies.Token){
        res.send("User Already logIn");
    }else{
        res.render('loginPage');
    }
});

app.post('/loginUser',async(req,res)=>{
    // let {email,password} = req.body;
    if(!((req.body.email) && (req.body.password))) res.send('Fill All Data');

    let dbuser = await user.findOne({Email : req.body.email});
    if(dbuser == null){
        res.send("something Wrong Email or Password");
    }else{
        bcrypt.compare(req.body.password,dbuser.Password,(err,result)=>{
            if(result){
                let token = jwt.sign({Email: req.body.email,Id : dbuser._id},"India");
                res.cookie("Token",token);
                res.redirect('/profile');
            }else{
                res.send("something Wrong Email or Password");
            }
        });
    }

});

app.get('/logout',(req,res)=>{
    if(req.cookies.Token){
        res.clearCookie('Token');
        res.redirect('/login');
    }else{
        res.send("User Not Login");
    }
});


app.get('/profile',async (req,res)=>{
    let loginUser = jwt.verify(req.cookies.Token,"India");
    let User = await user.findOne({_id : loginUser.Id}).populate('posts'); 
    // console.log(User.posts[0].Date);
    
    res.render('Profile',{User,id : loginUser.Id});
});

app.get('/posts',async(req,res)=>{
    let logUser = jwt.verify(req.cookies.Token,'India');

    let dbPost = await post.find().populate('UserId');
    res.render('Posts',{posts : dbPost,Id : logUser.Id});
    // res.send(dbPost);
});

app.get('/Posts/Create',(req,res)=>{
    if (req.cookies.Token) {
        res.render('createPost');
    }else{
        res.redirect('/login');
    }
});

app.post('/CreatePost', upload.single("postimg") ,async (req,res)=>{
    
    try {
        let data = jwt.verify(req.cookies.Token,"India");
        let loginUser = await user.findOne({_id : data.Id});
        
        if (!(req.body.title)) return res.send('Fill All Data');
        // console.log(req.file);
    
        let picfilename = '';
        if (req.file) {
            picfilename = req.file.filename;
        }else{
            res.redirect('/Posts/Create');
        }
        
        let postData = await post.create({
            PostTitle : req.body.title,
            PostPicture : picfilename,
            UserId : data.Id
        });
        
        loginUser.posts.push(postData._id);
        await loginUser.save();
    
        res.redirect('/profileview');
    } catch (error) {
        res.status(500).send('An error occurred while creating the post.');
    }
});

app.use('/:page/like/:id',(req,res,next)=>{
    if (req.cookies.Token) {
        next();
    }else{
        res.redirect('/login');
    }
});

app.get('/:page/like/:id',async(req,res)=>{
    let UserId = (jwt.verify(req.cookies.Token,"India")).Id;

    const Post = await post.findOne({_id : req.params.id});
    const index = Post.LikedUsers.indexOf(UserId);

    if(index == -1){
        Post.LikedUsers.push(UserId);
        await Post.save();
    }else{
        Post.LikedUsers.splice(index,1);
        await Post.save(); 
    }
    res.redirect(`/${req.params.page}`);
});

app.get('/delete/:id',async(req,res)=>{
    await post.deleteOne({_id : req.params.id});
    res.redirect('/profile')
});

app.get('/profile/:id',async (req,res)=>{
    const logUserId = (jwt.verify(req.cookies.Token,"India")).Id;

    if (logUserId == req.params.id) {
        res.redirect('/profile');
    }else{
        let User = await user.findOne({_id : req.params.id}).populate('posts');
        res.render('profile',{User,id : logUserId});
    }
});


// demo Router
// app.get('/profile',async(req,res)=>{
//     if(req.cookies.Token){
//         let loginUser = jwt.verify(req.cookies.Token,"India");
//         let User = await user.findOne({_id : loginUser.Id}).populate('posts'); 
//         // console.log(typeof(User));
          
//         res.render('profile',{User,id : loginUser.Id});
//         // res.json(dbUser);
//     }else{
//         res.redirect('/login');
//     }
// });

// app.get('/posts',async(req,res)=>{
//     let logUser = jwt.verify(req.cookies.Token,'India');

//     let dbPost = await post.find().populate('UserId');
//     res.render('post',{posts : dbPost,Id : logUser.Id});
//     // res.send(dbPost);
// });



app.listen(3000);