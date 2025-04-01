require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB Atlas Connected"))
.catch((err) => console.error("MongoDB Connection Error:", err));

// Define Schema
const departSchema = new mongoose.Schema({
  title: String,
  body: String
});

const Post = mongoose.model('Post', departSchema);

// Static Page Content
const homeStartingContent = "Welcome to the ultimate hub for discovering and understanding various departments and career paths. Whether you’re a student choosing a major, a job seeker exploring new opportunities, or someone passionate about learning, you’re in the right place.Our platform offers comprehensive information about different departments—from their roles and responsibilities to potential career opportunities. We break down what each field entails, helping you understand its impact, challenges, and growth prospects.Choosing the right path can be overwhelming, but with the right knowledge, it becomes an exciting journey. Our mission is to guide you through this process by providing clear, reliable insights to help you make informed decisions.Explore detailed profiles of each department, learn about their contributions to various industries, and discover the skills you’ll need to thrive in your chosen field. Whether you’re planning your future or considering a career switch, we’re here to support your journey every step of the way.Start exploring today—because the right choice can shape your tomorrow!.";
const aboutContent = "We provide insights into various departments, helping you understand their roles and career opportunities.";
const contactContent = "Reach out to us with any questions about departments, careers, or learning opportunities.";

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// **Route: Home - Fetch and Display Posts**
app.get("/", function (req, res) {
  Post.find({})
    .then(posts => {
      res.render("home", { HomeParagraph: homeStartingContent, posts: posts });
    })
    .catch(err => {
      console.error("Database Fetch Error:", err);
      res.status(500).send("An error occurred while fetching posts.");
    });
});

// **Route: Compose - Show Form**
app.get("/compose", function (req, res) {
  res.render("compose");
});

// **Route: Handle New Post Submission**
app.post("/", function (req, res) {
  //console.log("Received data:", req.body); // Debugging

  const postTitle = req.body.postTitle;
  const postBody = req.body.postBody;

  if (!postTitle || !postBody) {
    return res.status(400).send("Title and Body are required.");
  }

  const newPost = new Post({
    title: postTitle,
    body: postBody.replace(/\n/g, "<br>") // Format new lines
  });

  newPost.save()
    .then(() => {
      res.redirect("/");
    })
    .catch(err => {
      console.error("Database Save Error:", err);
      res.status(500).send("An error occurred while saving the post.");
    });
});

// **Route: Display Individual Post**
app.get("/posts/:postName", async function (req, res) {
  const requestedTitle = _.lowerCase(req.params.postName);

  try {
    const posts = await Post.find();
    const matchedPost = posts.find(
      (post) => _.lowerCase(post.title) === requestedTitle
    );

    if (matchedPost) {
      res.render("post", {
        title: matchedPost.title,
        body: matchedPost.body || "No content available",
      });
    } else {
      res.status(404).send("Post not found.");
    }
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).send("An error occurred while fetching the posts.");
  }
});

// **Route: About Page**
app.get("/about", function (req, res) {
  res.render("about", { aboutParagraph: aboutContent });
});

// **Route: Contact Page**
app.get("/contact", function (req, res) {
  res.render("contact", { contactParagraph: contactContent });
});

// **Function to Delete All Posts (Remove this if you don’t want it to run every time)**
async function deletePosts() {
  try {
    const result = await Post.deleteMany({});
    console.log(`${result.deletedCount} posts deleted`);
  } catch (error) {
    console.error("Error deleting posts:", error);
  }
}

// Uncomment this line if you want to manually run the delete function
// deletePosts();

// Start Server
app.listen(3000, function () {
  console.log("Server started on port 3000");
});
