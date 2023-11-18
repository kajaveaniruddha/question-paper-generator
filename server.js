const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors())
app.use(bodyParser.json());

// routes will be implemented here
const QuestionRoutes = require("./routes/questions");
app.use('/',QuestionRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
