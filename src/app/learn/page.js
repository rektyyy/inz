"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

import Lesson from "../components/Lesson";

const Tree = dynamic(() => import("react-d3-tree"), { ssr: false });

export default function Page() {
  const [treeData, setTreeData] = useState(null);
  const [dimensions, setDimensions] = useState({
    width: 800,
    height: 600,
  });
  const [showForm, setShowForm] = useState(false);
  const [lessonName, setLessonName] = useState("");
  const [lessonDescription, setLessonDescription] = useState("");
  const [selectedNode, setSelectedNode] = useState(null);
  const [englishWord, setEnglishWord] = useState("");
  const [otherLanguageWord, setOtherLanguageWord] = useState("");
  const [displayLesson, setDisplayLesson] = useState(false);

  // Ładowanie danych drzewa z pliku JSON
  useEffect(() => {
    fetch("/api/getTreeData")
      .then((response) => response.json())
      .then((data) => setTreeData(data));
  }, []);

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const handleAddLesson = () => {
    setShowForm(!showForm);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const engilshWords = englishWord.split(",");
    const otherLanguageWords = otherLanguageWord.split(",");

    if (engilshWords.length !== otherLanguageWords.length) {
      alert(
        "Give the same number of English and other language words separated by commas"
      );
      return;
    }

    const words = engilshWords.map((word, index) => {
      return {
        en: word,
        other: otherLanguageWords[index],
      };
    });

    const newLesson = {
      name: lessonName,
      attributes: {
        id: lessonName.toLowerCase().replace(/ /g, ""),
        description: lessonDescription,
        words: words,
      },
    };

    const addChildToNode = (node) => {
      if (!node.attributes) node.attributes = {};
      const nodeId = node.attributes.id;
      const selectedNodeId =
        selectedNode && selectedNode.attributes
          ? selectedNode.attributes.id
          : null;

      if (nodeId === selectedNodeId) {
        return {
          ...node,
          children: node.children ? [...node.children, newLesson] : [newLesson],
        };
      } else if (node.children) {
        return {
          ...node,
          children: node.children.map(addChildToNode),
        };
      } else {
        return node;
      }
    };

    setTreeData((prevTreeData) => {
      let newTreeData;
      if (selectedNode) {
        console.log("selectedNode", selectedNode);
        newTreeData = addChildToNode(prevTreeData);
      } else {
        newTreeData = {
          ...prevTreeData,
          children: prevTreeData.children
            ? [...prevTreeData.children, newLesson]
            : [newLesson],
        };
      }

      // Zapisz zaktualizowane drzewo do pliku JSON
      saveTreeData(newTreeData);

      return newTreeData;
    });

    setLessonName("");
    setLessonDescription("");
    setShowForm(false);
    setSelectedNode(null);
    setEnglishWord("");
    setOtherLanguageWord("");
  };

  const onNodeClick = (nodeData) => {
    console.log("nodeData", nodeData);
    setSelectedNode(nodeData.data);
  };

  const renderCustomNode = ({ nodeDatum, toggleNode, onNodeClick }) => (
    <g
      onClick={() => {
        toggleNode();
        onNodeClick({ data: nodeDatum });
      }}
    >
      <text fill="black" x="0" y="-20" textAnchor="middle">
        {nodeDatum.name}
      </text>
      <circle r={15} fill="lightblue" />
    </g>
  );
  // Funkcja do zapisywania danych drzewa
  const saveTreeData = (data) => {
    fetch("/api/saveTreeData", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  };

  const handleViewLesson = () => {
    setDisplayLesson(!displayLesson);
  };

  if (!treeData) return <div>Loading...</div>;

  return (
    <div className="w-full h-screen flex flex-col">
      <h1 className="text-2xl font-bold mb-4">Lekcje</h1>
      <button
        onClick={handleAddLesson}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Dodaj lekcję
      </button>

      {selectedNode && (
        <div>
          <p className="mt-2">Selected node: {selectedNode.name}</p>
          <p>Description: {selectedNode.attributes.description}</p>
          <button
            onClick={handleViewLesson}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Let's learn!
          </button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-4">
          <label className="block mb-2">
            Nazwa lekcji:
            <input
              type="text"
              value={lessonName}
              onChange={(e) => setLessonName(e.target.value)}
              className="border p-2 w-full"
              required
            />
          </label>
          <label className="block mb-2">
            Opis lekcji:
            <textarea
              value={lessonDescription}
              onChange={(e) => setLessonDescription(e.target.value)}
              className="border p-2 w-full"
            />
            <label className="block mb-2">
              English Word:
              <input
                type="text"
                value={englishWord}
                onChange={(e) => setEnglishWord(e.target.value)}
                className="border p-2 w-full"
                required
              />
            </label>
            <label className="block mb-2">
              Other language word:
              <input
                type="text"
                value={otherLanguageWord}
                onChange={(e) => setOtherLanguageWord(e.target.value)}
                className="border p-2 w-full"
                required
              />
            </label>
          </label>
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Dodaj
          </button>
        </form>
      )}

      {displayLesson && (
        <Lesson lessonData={selectedNode} onBack={handleViewLesson} />
      )}

      <div style={{ height: "100vh" }}>
        <Tree
          data={treeData}
          translate={{ x: dimensions.width / 2, y: dimensions.height / 4 }}
          orientation="vertical"
          onNodeClick={onNodeClick}
          collapsible={false}
          zoomable={false}
          scaleExtent={{ min: 0.1, max: 2 }}
          separation={{ siblings: 0.5 }}
          renderCustomNodeElement={(rd3tProps) =>
            renderCustomNode({ ...rd3tProps, onNodeClick })
          }
        />
      </div>
    </div>
  );
}
