const express = require('express');
const bodyParser = require('body-parser');
// const { response } = require('express');
const mongoose = require('mongoose');
const _ = require("lodash")

const port = process.env.PORT || 3000;

const app = express();
const workItems = [];

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemSchema = {
    name : String
}

const Item = mongoose.model("Item",itemSchema)

const items  = new Item ({
    name : " "
})

const defaultItems = [];

const listSchema = {
    name : String,
    items : [itemSchema]
};

const List = mongoose.model("List",listSchema);

app.get("/", function (req, res) {
    Item.find({},(err,foundItems) => {
        if(foundItems.length === 0){
            Item.insertMany(defaultItems, (err) =>{
                if(err){
                console.log(err);
                }else{
                    console.log("Successfully connected to DB");
                }
            })
            res.redirect("/")
        }else{
        res.render("list", { listTitle: "Today", newListItems: foundItems });

        }
    })
});
app.post("/", function(req, res) {
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
        name : itemName
    })

    if(listName === "Today"){
        item.save();
        res.redirect("/");         
    }else{
        List.findOne({name : listName},function(err,foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        })
    }

   
});

app.post("/delete",(req,res) => {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){
    Item.findByIdAndDelete(checkedItemId,(err) => {
        console.log(err);
    })
    res.redirect("/")
}else{
    List.findOneAndUpdate({name : listName},{$pull : {items : {_id : checkedItemId}}}, (err,foundList) => {
        if(!err){
            res.redirect("/" + listName);
        }
    })
}
})

app.get("/:customListName", (req,res) => {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name : customListName},function(err,foundList){
        if(!err){
            if(!foundList){
                const list = new List({
                    name : customListName,
                    items : defaultItems
                });
                list.save();
                res.redirect("/" + customListName); 
            }else{
                res.render("list",{ listTitle: foundList.name, newListItems: foundList.items })
            }
        }
    })


})

// app.post("/work", function (req, res) {
//     const item = req.body.newItem;
//     workItems.push(item);
//     res.redirect("/work")
// });
// app.get("/about", function(req,res){
//     res.render("about")
// });


app.listen(port, function () {
    console.log("Server started at port 3000");
});