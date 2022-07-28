const express = require('express');
const Posts = require("../schemas/post");
const Comments = require("../schemas/comment");
const moment = require("moment");
const router = express.Router();

//댓글 목록 조회
router.get("/comments/:postId", async (req, res) => {
    const { postId } = req.params;

    const Except = { //키이름: false를 적으면 find 함수에서 제외하고 db 불러옴
        __v: false,
        password: false,
        postId: false,
    };

    const comments = await Comments.find({ postId }, Except).sort({ createdAt: -1 }); //작성날짜 내림차순 정렬


    res.json({
        data: comments

    });
});


//댓글 삭제 
router.delete("/comments/:commentId", async (req, res) => {
    const { commentId } = req.params;
    const { password } = req.body;

    const existsComments = await Comments.findById({ _id: commentId });


    if (existsComments.password === password) {
        await Comments.deleteOne({ _id: commentId });
        res.send({ "message": "댓글을 삭제하였습니다." })
    } else {
        res.status(400).json({ success: false, errorMessage: "비밀번호를 확인해주세요." });
    }
});

//댓글 수정
router.put("/comments/:commentId", async (req, res) => {
    const { commentId } = req.params;
    const { password } = req.body;
    const { content } = req.body;


    const existsComments = await Comments.findById({ _id: commentId });

    if (existsComments.password === password) {
        if (content.length != 0 ) {
            await Comments.updateOne({ _id: commentId }, { $set: { content } })
            res.send({ "message": "댓글을 수정하였습니다." })
        }else {
            res.status(400).json({ success: false, errorMessage: "댓글 내용을 입력해주세요." });
        }
    } else {
        res.status(400).json({ success: false, errorMessage: "비밀번호를 확인해주세요." });
    }
})

//댓글 생성  
router.post("/comments/:postId", async (req, res) => {
    const { postId } = req.params;
    const { user, password, content } = req.body;


    const createdAt = moment().format("YYYY-MM-DD HH:mm:ss")

    if (content != null) {
        await Comments.create({ postId, user, password, content, createdAt })
        res.send({ "message": "댓글을 생성하였습니다." })
    } else {
        res.status(400).json({ success: false, errorMessage: "댓글 내용을 입력해주세요." });
    }

});

module.exports = router;