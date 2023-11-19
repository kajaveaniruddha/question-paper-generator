
# Question paper generator 

Designed and implemented a Question Paper Generator application.

The application stores a number of questions in a Question Store. The Question paper Generator looks for questions in the Question Store and then generate the question paper based on the total marks and the distribution of marks based on *Difficulty*.

Example - Assume the below requirement for a question paper:

(100 marks, Difficulty:{20% Easy, 50% Medium, 30% Hard })

The problem statement here is that you need to generate a question paper of 100 marks total of which 20% (ie, 20 marks) worth of questions should have the *difficulty=Easy*, 50% having *difficulty=Medium* and 30% having *difficulty=Hard*.


## Run Locally

Clone the project

```bash
  git clone https://github.com/kajaveaniruddha/question-paper-generator.git
```

Go to the project directory

```bash
  cd question-paper-generator
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  nodemon server.js
```

Run the client

```bash
  /client/index.html
```


## Demo using GUI

Once you start the client as well as the node.js server you'll see this tab.

![HomePage](https://github.com/kajaveaniruddha/question-paper-generator/assets/66174998/616a4880-3ff2-4803-a520-46c9c814298d)


- NOTE - All the outputs are printed in stringified JSON format and haven't been processed to beautify as this assignment majorly focuses on Backend.
- All the edge cases are handled at the backend gracefullyincase of an error, the error is displayed on the frontend as well.
- The code is extensible to accomodate further requirements such as adding a certian percentage of questions of a topic to the question paper. 


When you click on `Get All Questions` button, all the questions from the question store (questionStore.json - local database) will be printed.

`Add a New Question` allows the user to add a question to the question store further the question is added to the questionStore.json. 

*DISCLAIMER - In the event of an error, the error message is promptly displayed. Conversely, in case of success—when a new question is successfully added—the success message is briefly shown. This brief display delay occurs because the server restarts after modifying the local database (questionStore.json) to reflect the addition of the new question. To confirm the success, you can check the updated content at /models/questionStore.json or click the button 'Get All questions'. This inconvenience can be easily handled on the frontend.*

`Buil Question Paper` You need to input the total marks and percentages of easy,medium and hard questions you want in your question paper.

By clicking the `Build Question Paper` button, you can obtain a fresh set of questions with each click, customized according to your input requirements. This functionality is facilitated by our question paper creation process, which operates with an overall time complexity of O(2N). The initial O(N) is allocated to shuffling the input list, achieved by generating a copy of the data and utilizing the *Fisher-Yates (Knuth) shuffle algorithm*—a straightforward and efficient method. The subsequent O(N) is dedicated to the actual question paper generation.

## Demo using CLI

Use Powershell to hit the api endpoints by sending json payloads.

First of all start the node.js server.


To view all questions-
```bash
curl http://localhost:3000/all
```

Example to add a question-
```bash
curl -X PUT -H "Content-Type: application/json" -d '{
  "ip_question": "Who wrote 'To Kill a Mockingbird'?",
  "ip_subject": "Literature",
  "ip_topic": "Classic Novels",
  "ip_difficulty": "medium",
  "ip_marks": 10
}' http://localhost:3000/addQuestion
```
Example to build a question paper-
```bash
curl -X POST -H "Content-Type: application/json" -d '{
  "total_marks": 100,
  "perc_marks_easy": 20,
  "perc_marks_medium": 50,
  "perc_marks_hard": 30
}' http://localhost:3000/buildQuestionPaper
```
## About the database

All the questions are stored into `questionStore.json`.

Local Database - used file handlinsg in javascript to add questions.

#### Schema
```bash 
{
    "question": string,
    "subject": string,
    "topic": string,
    "difficulty": "easy" || "medium" || "hard",
    "marks": float
}
```
We can also add a unique `id` to every question but here it was not necessary to do so. For future extended requirements we may need to add it to our schema.


## Other open Source packages used


- [Express Validator](https://express-validator.github.io/docs)
    - 
     Validate and sanitize our express requests.
     Example to check whether the input parameter `total marks` is a numeric value or not. 
    
- [cors](https://www.npmjs.com/package/cors) 
    - 
    For Cross-origin resource sharing of server (node.js) and frontend (html). 

- [nodemon](https://www.npmjs.com/package/nodemon) 
    - 
    Helps develop Node.js based applications by automatically restarting the node application when file changes in the directory are detected.
    Enhances the development process. 

