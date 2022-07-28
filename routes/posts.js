const express = require('express');
const Posts = require("../schemas/post");
const moment = require("moment");
const router = express.Router();

//게시글 조회
router.get("/posts", async (req, res) => {
  
  const Except = { //키이름: false를 적으면 find 함수에서 제외하고 db 불러옴
    __v: false,
    password: false,
    content: false,
  };
 
    const posts = await Posts.find({}, Except).sort({createdAt: -1}); //작성날짜 내림차순 정렬
  

    res.json({
      data: posts

    });
  });

//게시글 상세 조회
  router.get("/posts/:postId", async (req, res) => {
    const { postId } = req.params;

    const Except = { //키이름: false를 적으면 find 함수에서 제외하고 db 불러옴
      __v: false,
      password: false,
    };

    const [detail] = await Posts.find({ _id: postId }, Except)
  
    res.json({
      detail,
    });
  
  
  });

//게시글 삭제 
router.delete("/posts/:postId", async (req, res) => {
    const { postId } = req.params;
    const { password } = req.body;

    const existsPosts = await Posts.findById({ _id: postId });


    if (existsPosts.password === password) {
      await Posts.deleteOne({ _id: postId });
      res.send ({ "message": "게시글을 삭제하였습니다."})
    } else {
      res.status(400).json({ success: false, errorMessage: "비밀번호를 확인해주세요."});
    }
  }); 

//게시글 수정
router.put("/posts/:postId", async (req,res) => {
    const { postId } = req.params;
    const { password } = req.body;
    const { title } = req.body;
    const { content } = req.body;
  
  
    const existsPosts = await Posts.findById({ _id: postId });

    if (existsPosts.password === password) {
      await Posts.updateOne({ postId }, { $set: { title, content }})
      res.send ({ "message": "게시글을 수정하였습니다."})
    } else {
      res.status(400).json({ success: false, errorMessage: "비밀번호를 확인해주세요."});
    }
  })  
 
//게시글 작성  
router.post("/posts", async (req, res) => {
    const { user, password, title, content } = req.body;

    // const { _id } = req.params;
    // const posts = await data.find({ postId: _id });
    // if (posts.length) {
    //   return res.status(400).json({ success: false, errorMessage: "이미 있는 데이터입니다." });
    // }

    // const now = new Date();
    // const year = now.getFullYear();
    // const month = now.getMonth();
    // const date = now.getDate();
    // const hours = now.getHours();
    // const minutes = now.getMinutes();
    // const seconds = now.getSeconds();
    // const createdAt = year+"-"+month+"-"+date+"T"+hours+":"+minutes+":"+seconds
    
    const createdAt = moment().format("YYYY-MM-DD HH:mm:ss")
    const createPosts = await Posts.create({ user, password, title, content, createdAt })

  
    res.json({ 
      // data: createPosts,
      "message": "게시글을 생성하였습니다."
     });
  });  

module.exports = router;