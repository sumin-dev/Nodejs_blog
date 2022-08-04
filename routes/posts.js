const express = require('express');
const router = express.Router();
const { Post, Like } = require("../models"); //index 생략가능
const authMiddleware = require("../middlewares/auth-middleware")

//게시글 조회
router.get("/posts", async (req, res) => {
  let final_posts = [];
  const posts = await Post.findAll({
    attributes: { exclude: ['content'] },
    order: [['createdAt', 'DESC']]
  });

  for (let i = 0; i < posts.length; i++) {
    const id = posts[i].dataValues.postId
    const likes = await Like.findAll({where: {postId: id}, raw: true});
    final_posts.push({post:posts[i], likes:likes.length})
  
  };

  res.json({
    data: final_posts

  });
});

//게시글 상세 조회
router.get("/posts/:postId", async (req, res) => {
  const { postId } = req.params;
  let final_posts = [];
  const posts = await Post.findByPk(postId);
  const likes = await Like.findAll({where: {postId}});
  
  final_posts.push({post:posts, likes:likes.length})
  

  if (!posts) {
    res.status(404).send({ "message": "게시글이 존재하지 않습니다." });
  } else {
    res.send({ final_posts });
  }


});

//게시글 삭제 
router.delete("/posts/:postId", authMiddleware, async (req, res) => {
  const { userId } = res.locals.user;
  const { postId } = req.params;

  const existsPosts = await Post.findOne({
    where: {
      userId,
      postId,
    },
  });

  if (existsPosts) {
    await existsPosts.destroy();
    res.send({ "message": "게시글을 삭제하였습니다." });
  } else {
    res.status(404).send({ "message": "삭제할 게시글이 없습니다." });
  }

});

//게시글 수정
router.put("/posts/:postId", authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { userId } = res.locals.user;
  const { title, content } = req.body;

  const existsPosts = await Post.findOne({
    where: {
      userId,
      postId,
    },
  });

  if (existsPosts) {
    existsPosts.title = title;
    existsPosts.content = content;
    await existsPosts.save();
    res.send({ "message": "게시글을 수정하였습니다." })
  } else {
    res.status(404).send({ "message": "수정할 게시글이 없습니다." });
  }
})

//게시글 작성  
router.post("/posts", authMiddleware, async (req, res) => {
  const { userId, nickname } = res.locals.user;
  const { title, content } = req.body;


  await Post.create({ userId, nickname, title, content });


  res.json({
    "message": "게시글을 생성하였습니다."
  });
});


//게시글 좋아요 등록, 취소
router.put("/posts/:postId/like", authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { userId } = res.locals.user;
  const likes = 1

  const existsPosts = await Post.findByPk(postId);
  if (!existsPosts) {
    res.status(404).send({ "message": "게시글이 존재하지 않습니다." });
    return;
  }

  try {
    const existsLikes = await Like.findOne({
      where: {
        userId,
        postId,
      },
    });

    if (!existsLikes) {
      await Like.create({ userId, postId, likes });
      res.send({ "message": "게시글의 좋아요를 등록하였습니다." });
    } else {
      await existsLikes.destroy();
      res.send({ "message": "게시글의 좋아요를 취소하였습니다." });
    }

  } catch (err) {
    return res.status(400).send(err)
  }

});

//좋아요 게시글 조회
router.get("/posts/like/me", authMiddleware, async (req, res) => {
  const { userId } = res.locals.user;

  const existsLikes = await Like.findAll({ where: { userId } });
  if (!existsLikes) {
    res.status(200).send({ "message": "좋아요를 등록한 게시글이 없습니다." });
    return;
  }

  try {
  
    let final_posts = [];
    for (let i = 0; i < existsLikes.length; i++) {
      const i_postId = existsLikes[i].dataValues.postId
      const posts = await Post.findOne({
        where: {postId: i_postId}, raw: true
      });
      const likes = await Like.findAll({
        where: {postId: i_postId}, raw: true
      });

      final_posts.push({post:posts, likes:likes.length})

    }
    final_posts.sort(function (a,b) {return b.likes - a.likes})
    return res.status(200).send({final_posts})

  } catch (err) {
    return res.status(400).send(err)
  }

});


module.exports = router;


