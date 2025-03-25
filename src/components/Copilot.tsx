"use client"

import { useCopilotAction } from "@copilotkit/react-core";
import { useCopilotChatSuggestions } from "@copilotkit/react-ui";
import { CopilotPopup } from "@copilotkit/react-ui";
import { useState } from 'react';

export default function Copilot() {
  const [todos, setTodos] = useState<string[]>([]);

  useCopilotAction({
    name: "addTodoItem",
    description: "Add a new todo item to the list",
    parameters: [
      {
        name: "todoText",
        type: "string",
        description: "The text of the todo item to add",
        required: true,
      },
    ],
    handler: async ({ todoText }) => {
      setTodos((prev) => [...prev, todoText]);
      return `Added todo: ${todoText}`;
    },
  });

  useCopilotAction({
    name: "createMultipleTodos",
    description: "Create multiple todo items at once",
    parameters: [
      {
        name: "todos",
        type: "string[]",
        description: "Array of todo items to add",
        required: true,
      },
    ],
    handler: async ({ todos: newTodos }) => {
      if (Array.isArray(newTodos)) {
        setTodos((prev) => [...prev, ...newTodos]);
        return `Added ${newTodos.length} todos`;
      }
      return "Invalid input: todos must be an array of strings";
    },
  });

  useCopilotChatSuggestions(
    {
      instructions: "Suggest the most relevant next actions.",
      minSuggestions: 1,
      maxSuggestions: 2,
    },
    [todos],
  );

  return (
    <>
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Your Todos ({todos.length})</h2>
        <ul className="space-y-2">
          {todos.map((todo, index) => (
            <li key={index} className="p-2 bg-gray-100 rounded">
              {todo}
            </li>
          ))}
        </ul>
      </div>
      <CopilotPopup 
        instructions="You are assisting the user as best as you can. Answer in the best way possible given the data you have."
        labels={{
          title: "Popup Assistant",
          initial: "Need any help?",
        }}
      />
    </>
  );
}