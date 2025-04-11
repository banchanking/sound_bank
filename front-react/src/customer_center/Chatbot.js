import React, { useState } from "react";
import axios from "axios";
import '../Css/customer_center/Chatbot.css'

const Chatbot = () => {
  const [question, setQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");
  const [generatedAnswer, setGeneratedAnswer] = useState("");

  const askChatbot = async () => {
    if (!question.trim()) {
      alert("질문을 입력하세요.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/ask/", {
        question: question,
      });

      setFaqAnswer(response.data.faq_answer);
      setGeneratedAnswer(response.data.generated_answer);
    } catch (error) {
      console.error("챗봇 오류:", error);
      alert("서버 오류가 발생했습니다.");
    }
  };

  return (
    <div className="chat-container">
      <h2>은행 고객센터 챗봇</h2>
      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="질문을 입력하세요..."
      />
      <button onClick={askChatbot}>질문하기</button>

      {faqAnswer && (
        <div>
          <h3>FAQ 답변</h3>
          <p>{faqAnswer}</p>
        </div>
      )}

      {generatedAnswer && (
        <div>
          <h3>AI 생성 답변</h3>
          <p>{generatedAnswer}</p>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
