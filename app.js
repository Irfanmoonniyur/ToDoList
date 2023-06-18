

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");

const mongoose =require("mongoose");
const app = express();
const _ = require("lodash");
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');

mongoose.set('strictQuery', true);

mongoose.connect("mongodb+srv://irfanmoonniyur:7152BUVGGTtSFq9y@cluster0.omrv5rj.mongodb.net/toDoListdb",{ useNewUrlParser: true});




app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));



const itemSchema = new mongoose.Schema({
  name:String
})
const ItemModel = mongoose.model('item',itemSchema);




const item1 = new ItemModel({
  name:"Welocome to your todolist!"
})
const item2 = new ItemModel({
  name:"Hit + to add new Item"
})
const item3 = new ItemModel({
  name:"Hit delete to delete Item"
})
const defaultItems=[item1,item2,item3]




const listSchema = new mongoose.Schema({
  name:String,
  items:[itemSchema]
})


const List = mongoose.model('List', listSchema)




app.get("/", function(req, res) {

  ItemModel.find(function(err,result) {
    if (result.length==0){
      ItemModel.insertMany(defaultItems,function(err){
  if (err) {
    console.log(err)
  }
  else {
    console.log("succefully added defualt")
  }

})
    res.redirect('/')
    }
    else { res.render("list", {listTitle: "Today", newListItems: result});}
   
  })
  
 
 

});
app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName)
  List.findOne({name:customListName},function(err,result){
    if (!err){
      if (!result){

        const list =new List({
          name: customListName,
          items: defaultItems
        
        })
        list.save()

        res.redirect("/"+customListName)

      }
      else {
        res.render("list", {listTitle:result.name, newListItems: result.items})
      }
    }

  })

})
app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const newListItem = new ItemModel({
    name :itemName
  })
  if (listName=="Today"){
    newListItem.save()
    res.redirect('/')
  }
  else {
    List.findOne({name:listName},function(err,result){
      result.items.push(newListItem)
      result.save()
      res.redirect("/"+listName)
    })
  }


});

app.post("/delete", function(req, res){
  const id = req.body.checkbox
  const listName=req.body.listName
  if (listName=="Today"){
    ItemModel.findByIdAndDelete(id, function (err){
      if (err) {
        console.log(err)
      }
      else{
        console.log("succefully deleted")
        res.redirect('/')
      }
    })
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:id}}},function(err,result){
      if (!err){
        res.redirect("/"+listName)
      }
    })
  }

 
})



app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(PORT, function() {
  console.log("Server started on port 3000");
});
