const express = require("express");
const port = 3000;
const jwt = require("jsonwebtoken");
const { User } = require("./models"); //index 생략가능


const postsRouter = require("./routes/posts");
const commentsRouter = require("./routes/comments");


const app = express();
const router = express.Router();
app.use(express.json());
app.use("/", [postsRouter, commentsRouter]);


app.use((req, res, next) => {
  console.log('Request URL:', req.originalUrl, ' - ', new Date());
  next();
});

//회원가입 API
router.post("/signup", async (req, res) => {
  const { nickname, password, confirm } = req.body;

  //로그인 토큰 유무 확인
  const { authorization } = req.headers;
  if (authorization) {
    res.status(400).send({
      errorMessage: "이미 로그인이 되어있습니다.",
    });
    return;
  }

  if (password !== confirm) {
    res.status(400).send({
      errorMessage: "패스워드가 패스워드 확인란과 동일하지 않습니다.",
    });
    return;
  }

  //닉네임, 비밀번호 유효성 검사
  const nicknameRegExp = /^[a-zA-z0-9]{3,}$/;
  if (!nicknameRegExp.test(nickname) || password.search(nickname) > -1) {
    res.status(400).send({
      errorMessage: "닉네임: 3자리 이상 영문 대소문자와 숫자로 입력 / 패스워드: 닉네임과 같은 단어 포함 금지",
    });
    return;
  }

  const existUsers = await User.findOne({
    where: { nickname },
  }); 
  if (existUsers) {
    res.status(400).send({
      errorMessage: "중복된 닉네임입니다.",
    });
    return;
  }

  await User.create({ nickname, password });

  res.status(201).send({ "message": "회원가입에 성공하였습니다." });
});


//로그인 API
router.post("/login", async (req, res) => {
  const { nickname, password } = req.body;

  //로그인 토큰 유무 확인
  const { authorization } = req.headers;
  if (authorization) {
    res.status(400).send({
      errorMessage: "이미 로그인이 되어있습니다.",
    });
    return;
  }

  const user = await User.findOne({ where: { nickname, password } });
  if (!user || password !== user.password) {
    res.status(400).send({
      errorMessage: "닉네임 또는 패스워드를 확인해주세요.",
    });
    return;
  }

  const token = jwt.sign({ userId: user.userId }, "Judy-secret-key");
  res.send({
    token,
  });
});


app.use("/", express.urlencoded({ extended: false }), router);


app.get('/', (req, res) => {
  res.send('Hello Blog!');
});

app.listen(port, () => {
  console.log(port, '포트로 서버가 열렸어요!');
});