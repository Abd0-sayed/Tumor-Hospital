"use client";

import PageLoad from "./pageLoad";
import "./componentsStyle/faqs.scss";
import { useState, useEffect } from "react";

const AccordionItem = ({ item, isOpen, onToggle }) => {
  return (
    <div>
      <button className="question" onClick={onToggle}>
        <span>{item.question}</span>
      </button>
      {isOpen && (
        <div className="answer">
          <p>{item.answer}</p>
        </div>
      )}
      <hr />
    </div>
  );
};

export default function AccordionSection() {
  const [openIndex, setOpenIndex] = useState(2);

  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("https://tumorhospital.runasp.net/api/FAQs")
      .then((res) => res.json())
      .then((data) => setData(data));
  }, []);

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  if (data) {
    return (
      <>
        <div className="body">
          <h1>General Questions</h1>
          <hr />
          <div className="questions">
            {data &&
              data.map((item, index) => (
                <AccordionItem
                  key={index}
                  item={item}
                  isOpen={openIndex === index}
                  onToggle={() => handleToggle(index)}
                />
              ))}
          </div>
        </div>
      </>
    );
  } else {
    return <PageLoad />;
  }
}
