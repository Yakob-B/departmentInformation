
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
var _ = require("lodash");
const mongoose = require("mongoose");



mongoose
  .connect(process.env.MONGO_URI, {
    
  })
  .then(() => console.log("MongoDB Atlas Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

const departSchema = new mongoose.Schema({
  title:String,
  body:String

});

const UserSchema = new mongoose.Schema({
  email:String,
  password:String
})


const Post = mongoose.model('Post',departSchema);
const User = mongoose.model("User",UserSchema)


const homeStartingContent = " Welcome to the ultimate hub for discovering and understanding various departments and career paths. Whether you’re a student choosing a major, a job seeker exploring new opportunities, or someone passionate about learning, you’re in the right place.Our platform offers comprehensive information about different departments—from their roles and responsibilities to potential career opportunities. We break down what each field entails, helping you understand its impact, challenges, and growth prospects.Choosing the right path can be overwhelming, but with the right knowledge, it becomes an exciting journey. Our mission is to guide you through this process by providing clear, reliable insights to help you make informed decisions.Explore detailed profiles of each department, learn about their contributions to various industries, and discover the skills you’ll need to thrive in your chosen field. Whether you’re planning your future or considering a career switch, we’re here to support your journey every step of the way.Start exploring today—because the right choice can shape your tomorrow!.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";
const page_name = "";
const app = express();
let posts = [];


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
// to add new department 
// app.post("/",function(req,res){
//   const postTitle = req.body.postTitle;
//   const postBody = req.body.postBody
  

//   const newPost = new Post({ 

//     title: postTitle,  
//     body: postBody 
//   });  
  
//   // Save the department post to the database  
//   newPost.save()  

//  res.redirect("/");

// })
app.get("/",function(req,res){
  res.render("Index");
});
app.get("/login",function(req,res){
  res.render("login");
});

app.get("/register",function(req,res){
  res.render("register");
});
 // Handling register route

app.post("/register", async function (req, res) {
   try {
      const newUser = new User({
         email: req.body.username,
         password: req.body.password
      });

      await newUser.save(); // Using async/await instead of callback
      res.render("home",{ HomeParagraph: homeStartingContent, posts: posts});
   } catch (err) {
      console.error(err);
      res.status(500).send("Error registering user");
   }
});
  //  handling login route


app.post("/login", async function (req, res) {
  try {
    const email = req.body.username; // Ensure this is named properly
    const password = req.body.password;

    const foundUser = await User.findOne({ email: email });

    if (foundUser) {
      if (foundUser.password === password) {
        res.render("home",{HomeParagraph: homeStartingContent, posts: posts});
      } else {
        res.status(401).send("Incorrect password");
      }
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});
  

app.post("/", function(req, res) {
  const postTitle = req.body.postTitle;
  const postBody = req.body.postBody;

  // Convert line breaks in the body to <br> tags
  const formattedBody = postBody ? postBody.replace(/\n/g, "<br>") : "";

  const newPost = new Post({
    title: postTitle,
    body: formattedBody  // Save the formatted body with <br> tags
  });

  // Save the department post to the database  
  newPost.save()
    .then(() => {
      res.redirect("/");  // Redirect to home page after saving
    })
    .catch(err => {
      console.error(err);
      res.status(500).send("An error occurred while saving the post.");
    });
});




app.get("/posts/:postName", async function (req, res) {
  const requestedTitle = _.lowerCase(req.params.postName);

  try {
   
    const posts = await Post.find(); 

    // Find the matching post
    const matchedPost = posts.find(
      (post) => _.lowerCase(post.title) === requestedTitle
    );

    if (matchedPost) {
      // Render the matching post
      res.render("post", {
        title: matchedPost.title,
        body: matchedPost.body || "No content available",
      });
    } else {
      // Handle the case where no match is found
      res.status(404).send("Post not found.");
    }
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).send("An error occurred while fetching the posts.");
  }
});



  // if (post) {
  //    res.render("post", { posts: posts });
  // } 
  

  // async function deletePosts() {
  //   try {
  //     const result = await Post.deleteMany({});
  //     console.log(`${result.deletedCount} posts deleted`);
  //   } catch (error) {
  //     console.error('Error deleting posts:', error);
  //   }
  // }
  
  // deletePosts();
  



// app.get("/",function(req,res){
//   Post.find({})
//   .then(posts => {
//     const formattedText = req.body.postBody.replace(/\n/g, "<br>");
//   document.getElementById("content").innerHTML = formattedText;
//     res.render("home", { HomeParagraph: homeStartingContent, posts: posts });
//   })
//   .catch(err => {
//     console.error(err);
//     res.status(500).send("An error occurred while fetching posts.");
//   });

  
// });

app.get("/", function(req, res) {
  Post.find({})
    .then(posts => {
      // Format the text for each post
      posts = posts.map(post => {
        // If post.body is undefined or null, use an empty string
        const formattedBody = post.body ? post.body.replace(/\n/g, "<br>") : "";
        return {
          ...post.toObject(),  // Preserve other post fields
          formattedBody: formattedBody // Add the formatted body
        };
      });

      res.render("home", {HomeParagraph: homeStartingContent, posts: posts });
    })
    .catch(err => {
      console.error(err);
      res.status(500).send("An error occurred while fetching posts.");
    });
});




app.get("/about",function(req,res){
 res.render("about",{aboutParagraph:aboutContent});
});

app.get("/contact",function(req,res){
  res.render("contact",{contactParagraph:contactContent });
});
 app.get("/compose",function(req,res){
  
  res.render("compose")
  
 })
 
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
