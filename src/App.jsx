import Form from "./components/Form";
import FilterButton from "./components/FilterButton";
import Todo from "./components/Todo";
import { useState, useEffect, useRef } from "react";
import { nanoid } from "nanoid";
import axios from "axios";


const FILTER_MAP = {
  All: () => true,
  Active: (task) => !task.completed,
  Completed: (task) => task.completed,
};
const FILTER_NAMES = Object.keys(FILTER_MAP);

const initialTasks = () => {
  const asdf = localStorage.getItem("tasks");
  return JSON.parse(asdf) || []
};

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}


function App() {
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState("All");
  const [serverStatus, setServerStatus] = useState("pending");
  const prevTaskLength = usePrevious(tasks.length);
  const listHeadingRef = useRef(null);

  useEffect(() => {
    if (tasks.length < prevTaskLength) {
      listHeadingRef.current.focus();
    }
  }, [tasks.length, prevTaskLength]);

  localStorage.setItem("tasks", JSON.stringify(tasks)) || [];

  useEffect(() => {
    const fetchServerStatus = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await axios.get("/", { timeout: 10000 });
        setServerStatus("online");
      } catch (error) {
        console.error("Error fetching server status:", error);
        setServerStatus("offline");
      }
    };
    fetchServerStatus();
  }, []);

  function addTask(name) {
    if (name.trim().toUpperCase() === "REACT") {
      alert("You cannot add a task with the name 'REACT'.");
      return;
    }
    const newTask = { id: `todo-${nanoid()}`, name, completed: false, priority: 0 };
    setTasks([...tasks, newTask]);
  }
  function toggleTaskCompleted(id) {
    const updatedTasks = tasks.map((task) => {
      // if this task has the same ID as the edited task
      if (id === task.id) {
        // use object spread to make a new object
        // whose `completed` prop has been inverted
        return { ...task, completed: !task.completed, priority: task.priority };
      }
      return task;
    });
    setTasks(updatedTasks);
  }
  function deleteTask(id) {
    const remainingTasks = tasks.filter((task) => id !== task.id);
    setTasks(remainingTasks);
  }
  function editTask(id, newName, newPriority) {
    const editedTaskList = tasks.map((task) => {
      // if this task has the same ID as the edited task
      if (id === task.id) {
        // Copy the task and update its name and priority
        return { ...task, name: newName, priority: newPriority };
      }
      // Return the original task if it's not the edited task
      return task;
    });
    setTasks(editedTaskList);
  }  
  const filterList = FILTER_NAMES.map((name) => (
    <FilterButton
      key={name}
      name={name}
      isPressed={name === filter}
      setFilter={setFilter}
    />
  ));

  const taskList = tasks
    .filter(FILTER_MAP[filter])
    .map((task) => (
      <Todo
        id={task.id}
        name={task.name}
        completed={task.completed}
        priority={task.priority}
        key={task.id}
        toggleTaskCompleted={toggleTaskCompleted}
        deleteTask={deleteTask}
        editTask={editTask}
      />
    ));

  const tasksNoun = taskList.length !== 1 ? "tasks" : "task";
  const headingText = `${taskList.length} ${tasksNoun} remaining`;

  return (
    <div className="todoapp stack-large">
      <h1>TodoMatic </h1>
      <p id="server-status" status={serverStatus}>{serverStatus}</p>
      <Form addTask={addTask}/>
      <div className="filters btn-group stack-exception">
        <div className="filters btn-group stack-exception">
          {filterList}
        </div>
      </div>
      <h2 id="list-heading" tabIndex="-1" ref={listHeadingRef}>
        {headingText}
      </h2>
      <ul
        role="list"
        className="todo-list stack-large stack-exception"
        aria-labelledby="list-heading">
        {taskList}
      </ul>
    <button> hello</button>
    </div>
  );
}

export default App;