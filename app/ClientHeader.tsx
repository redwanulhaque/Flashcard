"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

type Tool = {
  id: number;
  name: string;
  flashcards?: any[];
};

export default function ClientHeader() {
  const router = useRouter();

  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  const hideTimeoutRef = useRef<number | null>(null);




  /*-------------------- Fetch tools --------------------*/

  const fetchTools = async () => {
    try {
      const res = await fetch("/api/study-tools", { cache: "no-store" });
      const data = await res.json();
      setTools(data.data || []);
    } 
    
    catch (err) {
      console.error("Failed to load tools for header preview", err);
      setTools([]);
    } 
    
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTools();
  }, []);




  /*-------------------- Navigation handler --------------------*/

  const handleSelectTool = (id: number) => {
    router.push(`/?selectedTool=${id}`);
    setShowPreview(false);
  };




  /*-------------------- Hover preview handlers --------------------*/

  const handleMouseEnter = () => {
    if (hideTimeoutRef.current) {
      window.clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setShowPreview(true);
  };

  const handleMouseLeave = () => {
    hideTimeoutRef.current = window.setTimeout(() => {
      setShowPreview(false);
      hideTimeoutRef.current = null;
    }, 180);
  };




  /*-------------------- Reset handler --------------------*/

  const handleReset = async () => {

    if (!confirm("This will clear ALL study tools and flashcards. Continue?")) return;

    try {

      const res = await fetch("/api/study-tools", { method: "DELETE" });
      if (!res.ok) throw new Error("Reset failed");
      window.location.href = "/"; // reload app after reset
    } 
    
    catch (err) {
      console.error(err);
      alert("Failed to reset database");
    }

  };




  /*-------------------- Rendered header --------------------*/

  return (

    <header className="w-full p-4 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 text-white shadow-lg backdrop-blur-sm relative rounded-b-xl">

      <div className="max-w-5xl mx-auto flex justify-between items-center">

        {/* Left side: Flashcards and Reset in separate divs */}
        <div className="flex items-center gap-4">
          
          {/* Flashcards dropdown */}
          <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="relative"
          >
            <h1
              className="flashcards-btn"
              aria-haspopup="true"
              aria-expanded={showPreview}
              tabIndex={0}
              onFocus={handleMouseEnter}
              onBlur={handleMouseLeave}
            >
              Flashcards
            </h1>

            {showPreview && (
              <div
                className="flashcard-dropdown perspective-dropdown"
                role="menu"
                aria-label="Flashcard tools"
              >
                <div className="flashcard-grid max-h-[28rem] w-full overflow-y-auto px-5 py-4 grid grid-cols-3 gap-5">
                  {loading ? (
                    <div className="col-span-3 text-center text-gray-500 dark:text-gray-400 p-3">
                      Loading...
                    </div>
                  ) : tools.length === 0 ? (
                    <div className="col-span-3 text-center text-gray-500 dark:text-gray-400 p-3">
                      No tools yet
                    </div>
                  ) : (
                    tools.map((tool) => (

                      <button
                        key={tool.id}
                        className="flashcard-cardd min-w-0 w-full text-left"
                        onClick={() => handleSelectTool(tool.id)}
                        role="menuitem"
                      >
                        <div className="card-title w-full h-10 flex items-center px-3 overflow-hidden">
                          <div className="title-inner whitespace-nowrap mx-auto text-center overflow-hidden text-ellipsis">
                            {tool.name}
                          </div>
                        </div>

                        <div className="text-sm text-gray-600 dark:text-gray-300 mt-2 text-center">
                          {tool.flashcards?.length ?? 0} cards
                        </div>
                      </button>

                    ))
                  )}
                </div>
              </div>
            )}
          </div>




          {/*-------------------- Reset button --------------------*/}

          <div>

            <button onClick={handleReset} className="flashcards-btn">
              Reset
            </button>

          </div>

        </div>




        {/*-------------------- Home Button--------------------*/}

        <a href="/" className="home-btn">
          Home
        </a>

      </div>

    </header>
  );
}

