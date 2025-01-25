import React, { useState, useEffect } from "react";
import mermaid from "mermaid";
import { motion } from "framer-motion";
import {
  Brain,
  Sparkles,
  Loader2,
  Download,
  ChevronRight,
  MessageCircle,
  Trash2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ExplanationCard from "./ExplanationCard";
import { useWallet } from "../contexts/WalletContext";
import UserRegistration from "./UserRegistration";
import Loader from "./Loader";

const MindMap = () => {
  const [topic, setTopic] = useState("");
  const [mermaidCode, setMermaidCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [explanations, setExplanations] = useState([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const { account, isCorrectNetwork } = useWallet();
  const [userMindmaps, setUserMindmaps] = useState([]);
  const [clickedNodes, setClickedNodes] = useState(new Set());

  useEffect(() => {
    const checkUserRegistration = async () => {
      if (account) {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_SERVER_URI}/api/user/check-user`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ walletAddress: account }),
            }
          );
          const data = await response.json();
          setIsRegistered(data.exists);
        } catch (error) {
          console.error("Error checking user registration:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    checkUserRegistration();
  }, [account]);

  useEffect(() => {
    const fetchUserMindmaps = async () => {
      if (account && isRegistered) {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_SERVER_URI}/api/user-mindmaps/${account}`
          );
          const data = await response.json();
          setUserMindmaps(data);
        } catch (error) {
          console.error("Error fetching user mindmaps:", error);
        }
      }
    };

    fetchUserMindmaps();
  }, [account, isRegistered]);

  useEffect(() => {
    const fetchClickedNodes = async () => {
      if (account && topic) {
        try {
          const response = await fetch(
            `${
              import.meta.env.VITE_SERVER_URI
            }/api/clicked-nodes/${account}/${encodeURIComponent(topic)}`
          );
          const data = await response.json();
          setClickedNodes(new Set(data.map((node) => node.nodeText)));
        } catch (error) {
          console.error("Error fetching clicked nodes:", error);
        }
      }
    };

    fetchClickedNodes();
  }, [account, topic]);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: "neutral",
      securityLevel: "loose",
      mindmap: {
        padding: 16,
        curve: "basis",
      },
    });
  }, []);

  useEffect(() => {
    if (mermaidCode) {
      mermaid.render("mindmap", mermaidCode).then(({ svg }) => {
        const container = document.getElementById("diagram-container");
        if (container) {
          container.innerHTML = svg;

          const textElements = container.querySelectorAll(".mindmap-node text");
          textElements.forEach((textEl) => {
            const parentG = textEl.closest("g");
            if (parentG) {
              parentG.style.cursor = "pointer";
              const nodeText = textEl.textContent.trim();
              const cleanNodeText = nodeText.replace(/['"()]/g, "");

              // Add checkmark if node is clicked
              if (clickedNodes.has(cleanNodeText)) {
                const checkmark = document.createElementNS(
                  "http://www.w3.org/2000/svg",
                  "text"
                );
                checkmark.textContent = "✓";
                checkmark.setAttribute(
                  "x",
                  parseFloat(textEl.getAttribute("x")) +
                    textEl.getComputedTextLength() +
                    5
                );
                checkmark.setAttribute("y", textEl.getAttribute("y"));
                checkmark.setAttribute("fill", "#22c55e");
                checkmark.setAttribute("class", "checkmark");
                parentG.appendChild(checkmark);
              }

              parentG.onclick = (e) => {
                e.stopPropagation();
                handleNodeClick(cleanNodeText, topic);
              };

              parentG.onmouseenter = () => {
                textEl.style.fontWeight = "bold";
                textEl.style.transform = "scale(1.05)";
                textEl.style.transition = "all 0.2s ease";
                parentG
                  .querySelector("path")
                  ?.setAttribute("fill-opacity", "0.9");
              };

              parentG.onmouseleave = () => {
                textEl.style.fontWeight = "normal";
                textEl.style.transform = "scale(1)";
                parentG
                  .querySelector("path")
                  ?.setAttribute("fill-opacity", "1");
              };
            }
          });

          const svgElement = container.querySelector("svg");
          if (svgElement) {
            svgElement.style.width = "100%";
            svgElement.style.height = "auto";
            svgElement.style.minHeight = "600px";

            if (!svgElement.getAttribute("viewBox")) {
              const bbox = svgElement.getBBox();
              svgElement.setAttribute(
                "viewBox",
                `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`
              );
            }
          }
        }
      });
    }
  }, [mermaidCode, topic, clickedNodes]);

  const handleSelectTopic = async (selectedTopic) => {
    setIsLoadingContent(true);
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_SERVER_URI
        }/api/mindmap/${account}/${encodeURIComponent(selectedTopic)}`
      );
      const data = await response.json();
      setTopic(selectedTopic);
      setMermaidCode(data.mermaidCode);
      setExplanations([]);
    } catch (error) {
      console.error("Error fetching mindmap:", error);
    }
    setIsLoadingContent(false);
  };

  const generateMindmap = async () => {
    setIsLoadingContent(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URI}/api/generate-mindmap`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic, walletAddress: account }),
        }
      );
      const data = await response.json();
      setMermaidCode(data.mermaidCode);
      setExplanations([]);

      // If it's a new mindmap, update the user's mindmap list
      if (data.isNew) {
        setUserMindmaps((prevMindmaps) => [
          {
            topic,
            createdAt: new Date().toISOString(),
          },
          ...prevMindmaps,
        ]);
      }
    } catch (error) {
      console.error("Error:", error);
    }
    setIsLoadingContent(false);
  };

  const handleNodeClick = async (nodeText, parentContext) => {
    try {
      // First, track the click
      await fetch(`${import.meta.env.VITE_SERVER_URI}/api/track-node-click`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: account,
          topic,
          nodeText,
        }),
      });

      // Update local state
      setClickedNodes((prev) => new Set([...prev, nodeText]));

      // Get node info as before
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URI}/api/get-node-info`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nodeText,
            parentContext,
            walletAddress: account,
          }),
        }
      );
      const data = await response.json();

      setExplanations((prev) => [
        {
          node: nodeText,
          explanation: data.explanation,
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const downloadDiagram = () => {
    const svgElement = document.querySelector("#diagram-container svg");
    if (svgElement) {
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgElement);
      const blob = new Blob([svgString], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${topic}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleDeleteMindmap = async (topicToDelete) => {
    try {
      await fetch(
        `${
          import.meta.env.VITE_SERVER_URI
        }/api/delete-mindmap/${account}/${encodeURIComponent(topicToDelete)}`,
        {
          method: "DELETE",
        }
      );
      setUserMindmaps((prevMindmaps) =>
        prevMindmaps.filter((mindmap) => mindmap.topic !== topicToDelete)
      );
      if (topic === topicToDelete) {
        setTopic("");
        setMermaidCode("");
        setExplanations([]);
      }
    } catch (error) {
      console.error("Error deleting mindmap:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <Loader />
      </div>
    );
  }

  if (!account || !isCorrectNetwork) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8 flex items-center justify-center">
        <Card className="text-center p-6">
          <p className="text-gray-600 mb-4">
            Please connect your wallet and switch to the correct network.
          </p>
        </Card>
      </div>
    );
  }

  if (!isRegistered) {
    return (
      <UserRegistration
        walletAddress={account}
        onRegistrationComplete={() => setIsRegistered(true)}
      />
    );
  }

  return (
    <div className="h-[calc(100vh-70px)] flex bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 p-4 gap-4">
      {/* Left Sidebar */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-72 rounded-xl bg-white/20 backdrop-blur-lg border border-white/30 shadow-xl flex flex-col"
      >
        <div className="rounded-t-xl p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
          <div className="flex items-center gap-3">
            <Brain className="w-7 h-7 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-800">Mind Maps</h1>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
          <div className="space-y-2 py-2">
            {userMindmaps.map((mindmap) => (
              <article
                key={mindmap.topic}
                className="flex flex-row items-center justify-between w-full"
              >
                <Button
                  variant={topic === mindmap.topic ? "secondary" : "ghost"}
                  className="w-full justify-start text-left rounded-lg hover:bg-blue-50/50 flex flex-row"
                  onClick={() => handleSelectTopic(mindmap.topic)}
                >
                  <ChevronRight className="w-4 h-4 text-blue-500" />
                  <span className="truncate overflow-hidden text-ellipsis">
                    {mindmap.topic}
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  className="text-red-500 hover:bg-red-50/50"
                  onClick={() => handleDeleteMindmap(mindmap.topic)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </article>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col rounded-xl bg-white/20 backdrop-blur-lg border border-white/30 shadow-xl">
        <div className="flex-1 overflow-auto p-6 relative custom-scrollbar">
          {isLoadingContent ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <div id="diagram-container" className="w-full min-h-[600px]" />
          )}
          <div className="absolute top-6 right-6 flex gap-2">
            {mermaidCode && (
              <Button
                onClick={downloadDiagram}
                className="bg-white/80 hover:bg-white/90 text-gray-800 flex flex-row"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white/30 backdrop-blur-lg border-t border-white/30">
          <div className="max-w-3xl mx-auto flex gap-3">
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="eg. Indian Tax System"
              className="px-4 flex-1 bg-gray-200 border-white/50 focus:border-blue-400 rounded-md"
            />
            <Button
              onClick={generateMindmap}
              disabled={loading || !topic}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg flex flex-row"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Generate
            </Button>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <motion.div
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-96 rounded-xl bg-white/20 backdrop-blur-lg border border-white/30 shadow-xl flex flex-col"
      >
        <div className="rounded-t-xl p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b border-white/30">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-6 h-6 text-purple-600" />
            <h2 className="font-semibold text-gray-800">Explanations</h2>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-4">
            {explanations.map((item) => (
              <ExplanationCard
                key={item.timestamp}
                node={item.node}
                explanation={item.explanation}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MindMap;
