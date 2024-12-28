import { useState } from "react";

export default function LessonType1({ lessonData, onBack, finishLesson }) {
  const [userInputs, setUserInputs] = useState({});
  const [answersFeedback, setAnswersFeedback] = useState({});
  const [isAllCorrect, setIsAllCorrect] = useState(null);

  // Losowo wybieramy pole do ukrycia dla każdego słowa
  const [hiddenFields] = useState(
    lessonData.attributes.words.map(() =>
      Math.random() < 0.5 ? "other" : "en"
    )
  );

  const handleChange = (e, index) => {
    setUserInputs({
      ...userInputs,
      [index]: e.target.value,
    });
  };

  const checkAnswers = () => {
    let allCorrect = true;
    const feedback = {};

    lessonData.attributes.words.forEach((word, index) => {
      const userAnswer = userInputs[index]?.trim().toLowerCase() || "";
      const correctAnswer =
        hiddenFields[index] === "other"
          ? word.other.toLowerCase()
          : word.en.toLowerCase();
      const isCorrect = userAnswer === correctAnswer;
      feedback[index] = isCorrect;
      if (!isCorrect) {
        allCorrect = false;
      }
    });

    setAnswersFeedback(feedback);
    setIsAllCorrect(allCorrect);
  };

  function handleWin() {
    finishLesson();
    onBack();
  }

  return (
    <div>
      <h2>{lessonData.name}</h2>
      <p>{lessonData.attributes.description}</p>
      <ul>
        {lessonData.attributes.words.map((word, index) => (
          <li key={index}>
            {hiddenFields[index] === "other" ? (
              <>
                <input
                  type="text"
                  value={userInputs[index] || ""}
                  onChange={(e) => handleChange(e, index)}
                  placeholder="Fill the missing word"
                  className={
                    answersFeedback[index] === false
                      ? "border border-red-500"
                      : ""
                  }
                />{" "}
                - {word.en}
              </>
            ) : (
              <>
                {word.other} -{" "}
                <input
                  type="text"
                  value={userInputs[index] || ""}
                  onChange={(e) => handleChange(e, index)}
                  placeholder="Wpisz brakujące słowo"
                  className={
                    answersFeedback[index] === false
                      ? "border border-red-500"
                      : ""
                  }
                />
              </>
            )}
            {answersFeedback[index] === false && (
              <span className="text-red-500"> ✗</span>
            )}
            {answersFeedback[index] === true && (
              <span className="text-green-500"> ✔</span>
            )}
          </li>
        ))}
      </ul>
      <button
        onClick={checkAnswers}
        className="px-4 py-2 bg-green-500 text-white rounded"
      >
        Check your answers
      </button>
      {isAllCorrect === true && (
        <div>
          <p className="text-green-500">All answers are correct!</p>
          <button
            onClick={handleWin}
            className="px-4 py-2 bg-blue-500 text-white rounded mt-2"
          >
            Talk with AI
          </button>
        </div>
      )}
    </div>
  );
}
