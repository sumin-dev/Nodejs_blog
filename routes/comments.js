const express = require('express');
const router = express.Router();
const { Post, Comment } = require("../models"); //index 생략가능
const authMiddleware = require("../middlewares/auth-middleware");

//댓글 목록 조회
router.get("/comments/:postId", async (req, res) => {
    const { postId } = req.params;

    const comments = await Comment.findAll({
        where: { postId },
        attributes: { exclude: ['postId'] },
        order: [['createdAt', 'DESC']]
    });

    if (!comments.length) {
        res.status(404).send({ "message": "댓글이 존재하지 않습니다." });
    } else {
        res.send({ comments });
    }

});


//댓글 삭제 
router.delete("/comments/:commentId", authMiddleware, async (req, res) => {
    const { commentId } = req.params;
    const { userId } = res.locals.user;
  
    const existsComments = await Comment.findOne({
      where: {
        userId,
        commentId,
      },
    });
  
    if (existsComments) {
      await existsComments.destroy();
      res.send({"message": "댓글을 삭제하였습니다."});
    } else {
      res.status(404).send({ "message": "삭제할 댓글이 없습니다." });
    }

});

//댓글 수정
router.put("/comments/:commentId", authMiddleware, async (req, res) => {
    const { commentId } = req.params;
    const { userId } = res.locals.user;
    const { comment } = req.body;
  
    const existsComments = await Comment.findOne({
      where: {
        userId,
        commentId,
      },
    });
  
    if (existsComments) {
        existsComments.comment = comment;
      await existsComments.save();
      res.send({ "message": "댓글을 수정하였습니다." })
    } else {
      res.status(404).send({ "message": "수정할 댓글이 없습니다." });
    }
})

//댓글 생성  
router.post("/comments/:postId", authMiddleware, async (req, res) => {
    const { userId, nickname } = res.locals.user;
    const { postId } = req.params;
    const { comment } = req.body;
    const posts = await Post.findByPk(postId);


    if (comment != null && posts) {
        await Comment.create({ userId, postId, nickname, comment });
        res.send({ "message": "댓글을 작성하였습니다." })
    } else {
        res.status(400).json({ success: false, errorMessage: "댓글 내용이 입력되지 않았거나, 존재하지 않는 게시물입니다." });
    }

});

module.exports = router;