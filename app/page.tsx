"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";




/*--------------------- Home Page ---------------------*/
//   - Lists decks
//   - Shows selected deck with flashcards
//   - Includes forms to add decks

export default function Home() {

  // state: list of decks and loading indicator
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // keep UI in sync with ?selectedTool=<id> in the URL
  const searchParams = useSearchParams();
  const selectedParam = searchParams.get("selectedTool");
  const selectedInitial = selectedParam ? Number(selectedParam) : null;
  const [selectedToolId, setSelectedToolId] = useState<number | null>(selectedInitial);

  // Fetch tools from API (no cache so UI is always fresh)
  const fetchTools = async () => {
    try {
      const res = await fetch("/api/study-tools", { cache: "no-store" });
      const data = await res.json();
      setTools(data.data);
    } 
    
    catch (error) {
      console.error("Failed to fetch study tools", error);
    } 
    
    finally {
      setLoading(false);
    }
  };

  // initial load
  useEffect(() => {
    fetchTools();
  }, []);

  // react to URL changes
  useEffect(() => {
    const p = searchParams.get("selectedTool");
    const id = p ? Number(p) : null;
    setSelectedToolId(id);
  }, [searchParams]);

  if (loading) return <p className="p-10" />;

  const selectedTool = tools.find((t) => t.id === selectedToolId) ?? null;


  return (

    <div className="min-h-screen p-10 bg-gray-50">
      {/* Home view: show create-deck UI when no deck selected */}
      {!selectedTool && (
        <>
          <h1 className="flashcard-heading">
            Create Your Own <span>Flashcard</span>
          </h1>

          <AddStudyToolForm onAdded={fetchTools} />
        </>
      )}

      {/* Selected deck view */}
      
      {selectedTool ? (

        <div className="card mb-4">
          {/* Deck header with destructive delete action */}

          <div className="flex justify-between items-center mb-4">

            <h2 className="tool-title">{selectedTool.name}</h2>

            <button
              onClick={async () => {
                if (!confirm("Delete this study tool and all its flashcards?")) return;
                try {
                  const res = await fetch(`/api/study-tools?toolId=${selectedTool.id}`, {
                    method: "DELETE",
                  });
                  if (!res.ok) throw new Error("Failed to delete study tool");
                  setSelectedToolId(null); // return to home
                  fetchTools(); // refresh list
                } catch (err) {
                  console.error(err);
                }
              }}
              className="delete-button"
            >
              Delete
            </button>

          </div>

          {/* Flashcards grid */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">

            {selectedTool.flashcards.map((card: any) => (

              <Flashcard
                key={card.id}
                id={card.id}
                question={card.question}
                answer={card.answer}
                onDeleted={fetchTools}
              />
            ))}

          </div>

          {/* Form to add a new flashcard to the selected deck */}
          <AddFlashcardForm toolId={selectedTool.id} onAdded={fetchTools}/>
        </div>
      ) : (
        <>

          {/* Decks grid on the home screen */}
          <h1 className="modern-heading-no-underline">Flashcard Decks</h1>

          {tools.length === 0 ? (

            <p>No Flashcard Deck Exist</p>
          ) : (

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">

              {tools.map((tool) => (

                <div
                  key={tool.id}
                  className="tool-card cursor-pointer p-4 bg-white rounded shadow-lg shadow-black relative"
                  onClick={() => setSelectedToolId(tool.id)}
                >
                  <h2 className="text-xl font-semibold">{tool.name}</h2>
                  <p className="text-gray-500 mt-2">{tool.flashcards.length} cards</p>
                </div>

              ))}

            </div>

          )}
        </>
      )}
    </div>
  );
}




/*-------------------- Flashcard component --------------------*/
//   - Simple flip card with delete action

function Flashcard({
  question,
  answer,
  id,
  onDeleted,
}: {

  question: string;
  answer: string;
  id: number;
  onDeleted: () => void;

}) {

  const [flipped, setFlipped] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Delete single flashcard 
  const handleDelete = async (e: React.MouseEvent) => {

    e.stopPropagation();

    if (!confirm("Are you sure you want to delete this flashcard?")) return;

    setDeleting(true);

    try {

      const res = await fetch(`/api/study-tools?flashcardId=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete flashcard");
      onDeleted(); // refresh parent list
    } 
    
    catch (err) {
      console.error(err);
    } 
    
    finally {
      setDeleting(false);
    }
  };

  return (

    <div
      className={`flashcard-card w-64 h-40 ${flipped ? "flipped" : ""}`}
      onClick={() => setFlipped((prev) => !prev)}
    >
      <div className="flashcard-inner">
        <div className="front relative">
          {question}
          <button
            onClick={handleDelete}
            className="absolute top-1 right-1 text-red-600 font-bold"
            disabled={deleting}
            aria-label="Delete flashcard"
          >
            {deleting ? "..." : "✕"}
          </button>
        </div>

        <div className="back relative">
          {answer}
          <button
            onClick={handleDelete}
            className="absolute top-1 right-1 text-red-600 font-bold"
            disabled={deleting}
            aria-label="Delete flashcard"
          >
            {deleting ? "..." : "✕"}
          </button>
        </div>

      </div>
    </div>
  );
}




/*--------------------- Add Flashcard Form ---------------------*/
//   - Adds a flashcard to the currently selected deck

function AddFlashcardForm({ toolId, onAdded }: { toolId: number; onAdded: () => void }) {

  const [question, setQuestion] = React.useState("");
  const [answer, setAnswer] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();
    if (!question || !answer) return;

    setSubmitting(true);

    try {
      const res = await fetch("/api/study-tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolId, question, answer }),
      });

      if (!res.ok) throw new Error("Failed to add flashcard");
      setQuestion("");
      setAnswer("");
      onAdded(); // refresh parent
    } 
    
    catch (error) {
      console.error(error);
    } 
    
    finally {
      setSubmitting(false);
    }

  };

  return (

    <form onSubmit={handleSubmit} className="flex flex-col gap-2 mt-4">

      <input
        type="text"
        placeholder="Question"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        className="border p-2 rounded"
      />
      
      <input
        type="text"
        placeholder="Answer"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        className="border p-2 rounded"
      />

      <button type="submit" className="btn" disabled={submitting}>
        {submitting ? "Adding..." : "Add Flashcard"}
      </button>

    </form>
  );

}

/*--------------------- Add Study Tool Form --------------------- */
//   - Creates a new deck and refreshes the list via onAdded()

function AddStudyToolForm({ onAdded }: { onAdded: () => void }) {

  const [name, setName] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    
    e.preventDefault();

    if (!name) return;

    setSubmitting(true);

    try {
      const res = await fetch("/api/study-tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) throw new Error("Failed to add tool");
      setName("");
      onAdded(); // refresh parent list
    } 
    
    catch (error) {
      console.error(error);
    } 
    
    finally {
      setSubmitting(false);
    }
  };

  return (

    <form onSubmit={handleSubmit} className="study-form">

      <input
        type="text"
        placeholder="Flashcard Deck Name..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="study-input"
      />

      <button type="submit" className="study-btn" disabled={submitting}>
        {submitting ? "Adding..." : "Add"}
      </button>

    </form>
  );

}
