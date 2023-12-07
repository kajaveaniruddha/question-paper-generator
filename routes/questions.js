const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");

const allQuestions = require("../models/questionStore.json");
const questionStorePath = path.join(__dirname, "../models/questionStore.json");
// Based on the available questions, generation a question paper with a maximum marks
function MaxPossibleMarks(ip_allQuestions) {
  var max_possible_marks = 0;
  ip_allQuestions.forEach((question) => {
    max_possible_marks += question.marks;
  });
  return max_possible_marks;
}

// input validation for percentage of difficulty using express-validator open source package
// accept the input only if the difficulty is numeric and between 0 to 100.
const validatePercentageOfDifficulty = (field) => [
  body(field)
    .isNumeric()
    .withMessage("Percentage must be a numeric value.")
    .custom((value) => parseFloat(value) >= 0 && parseFloat(value) <= 100)
    .withMessage("Percentage value must lie between 0 and 100."),
];

// function to shuffle the questions
function shuffleAllAvailableQuestions(cpy_allQuestions) {
  // Fisher-Yates (Knuth) shuffle algorithm - simple and efficient algorithm ,Time complexity = O(n)
  for (let i = cpy_allQuestions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cpy_allQuestions[i], cpy_allQuestions[j]] = [
      cpy_allQuestions[j],
      cpy_allQuestions[i],
    ];
  }
  return cpy_allQuestions;
}

// Get all questions from the database
router.get("/all", (req, res) => {
  res.status(200).json(allQuestions);
});

// query eg. - (100 marks, Difficulty, {20% Easy, 50% Medium, 30% Hard })
// get specific set of questions
router.post(
  "/buildQuestionPaper",
  // Validation rules for input
  [
    body("total_marks")
      .isNumeric()
      .withMessage("Total marks must be a numeric value.")
      .custom((value) => parseFloat(value) > 0)
      .withMessage(() => "Total marks must be greater than zero"),
    ...validatePercentageOfDifficulty("perc_marks_easy"),
    ...validatePercentageOfDifficulty("perc_marks_medium"),
    ...validatePercentageOfDifficulty("perc_marks_hard"),
  ],
  (req, res) => {
    try {
      const {
        total_marks,
        perc_marks_easy,
        perc_marks_medium,
        perc_marks_hard,
      } = req.body;

      //if validation fails -->
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
        });
      }

      //if validation success -->
      //check whether total percentage of easy, medium and hard questions is equal to 100 or not
      var total_perc_marks =
        parseFloat(perc_marks_easy) +
        parseFloat(perc_marks_medium) +
        parseFloat(perc_marks_hard);
      if (total_perc_marks != 100)
        res.status(400).json({
          message: `Total percentage of easy ,medium and hard questions must be equal to 100. Current total: ${total_perc_marks}`,
        });
      //converting percentage to marks
      let marks_easy = (perc_marks_easy * total_marks) / 100;
      let marks_medium = (perc_marks_medium * total_marks) / 100;
      let marks_hard = (perc_marks_hard * total_marks) / 100;

      // storing in temporary variables for later use
      let temp_marks_easy = marks_easy;
      let temp_marks_medium = marks_medium;
      let temp_marks_hard = marks_hard;

      //shuffling questions to get different sets of questions every time
      const shuffledQuestions = shuffleAllAvailableQuestions(allQuestions);
      //filtering questions as per user's request from the available set of questions
      const requestedQuestions = shuffledQuestions.filter((question) => {
        if (marks_easy == 0 && marks_medium == 0 && marks_hard == 0)
          return false; // Terminate the filter loop upon fulfilling the requirements; otherwise, continue iterating through the list to determine if it's feasible to include a question as per the request.
        if (question.difficulty === "easy") {
          if (question.marks <= marks_easy) {
            marks_easy -= question.marks;
            return true; // Include this easy question in the result
          }
        } else if (question.difficulty === "medium") {
          if (question.marks <= marks_medium) {
            marks_medium -= question.marks;
            return true; // Include this medium question in the result
          }
        } else if (question.difficulty === "hard") {
          if (question.marks <= marks_hard) {
            marks_hard -= question.marks;
            return true; // Include this hard question in the result
          }
        }
        return false; // Exclude this question with invalid difficulty from the result
      });

      if (requestedQuestions.length == 0)
        res.status(200).json({
          message: "No set of questions found for the given requirement.",
        });

      const tempAllQuestions = allQuestions; //shuffling the copy of the data so that we don't alter the original data coming from database as it is very precious
      var max_possible_marks = MaxPossibleMarks(tempAllQuestions);
      //shuffle data to get new set of questions every time
      
      res.status(200).json({
        requestedQuestions,
        message: `Based on the available questions, you can generate a question paper with a maximum of ${max_possible_marks} marks. You requested a question paper totaling ${total_marks} marks.  Ultimately, it was feasible to compose a question paper with a total of ${
          total_marks - marks_easy - marks_medium - marks_hard
        } marks.`,
        // Allocation of marks for questions of varying difficulty levels based on the requested allotment is as follows:
        DistributionOfMarks: {
          easy: `alloted - ${
            temp_marks_easy - marks_easy
          } marks out of requested - ${temp_marks_easy} marks.`,
          medium: `alloted - ${
            temp_marks_medium - marks_medium
          } marks out of requested - ${temp_marks_medium}marks.`,
          hard: `alloted - ${
            temp_marks_hard - marks_hard
          } marks out of requested - ${temp_marks_hard}marks.`,
        },
      });
    } catch (error) {
      res.json(error);
    }
  }
);

//add a question
router.put(
  "/addQuestion",
  // Validation rules for input
  [
    body(
      "ip_question",
      "Question must be of minimum 3 characters and maximum 1000 characters"
    ).isLength({ min: 3, max: 1000 }).escape(),
    body(
      "ip_subject",
      "Subject must be of minimum 5 characters and maximum 50 characters"
    ).isLength({
      min: 5,
      max: 50,
    }).escape(),
    body(
      "ip_topic",
      "Topic must be of minimum 5 characters and maximum 50 characters"
    ).isLength({
      min: 5,
      max: 50,
    }),
    body("ip_difficulty")
      .custom(
        // .trim() --> to remove any leading or trailing spaces to enhance user experience
        (value) =>
          value.trim() === "easy" ||
          value.trim() === "medium" ||
          value.trim() === "hard"
      )
      .withMessage("Difficulty must be either easy, medium or hard."),
    body("ip_marks")
      .isNumeric()
      .withMessage("Marks must be a numeric value.")
      .custom((value) => parseFloat(value) >= 0)
      .withMessage("Marks must be a value greater than equal to zero."),
  ],
  (req, res) => {
    try {
      const { ip_question, ip_subject, ip_topic, ip_difficulty, ip_marks } =
        req.body;

      //if validation fails -->
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
        });
      }

      //if validation success -->

      //new question created from the user's input
      //removed any leading or trailing spaces to avoid further inconvenience
      const newQuestion = {
        question: ip_question.trim(),
        subject: ip_subject.trim(),
        topic: ip_topic.trim(),
        difficulty: ip_difficulty.trim(),
        marks: ip_marks,
      };
      allQuestions.push(newQuestion);

      //storing the newly added question to the database ,here file system :)
      fs.writeFileSync(
        questionStorePath,
        JSON.stringify(allQuestions, null, 2)
      );

      res.status(200).json({
        message: "Question added successfully.",
        newQuestion,
      });
    } catch (error) {
      res.json(error);
    }
  }
);

module.exports = router;
