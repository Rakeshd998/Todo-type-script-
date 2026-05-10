import { useState } from "react";
import "./App.css";
import TodoForm from "./components/TodoFrorm";
import TodoList from "./components/TodoList";
import type { Todo } from "./types/todo.types";

const App=()=>{
  const [todos,setTodos]=useState<Todo[]>([]);

  const addTodo = (text:string)=>{
    const newTodo:Todo={
      id:Date.now(),
      text,
      completed:false
    }

    setTodos((prev)=>[...prev, newTodo]);
  }

  const deleteTodo = (id:number)=>{
      setTodos((prev)=>
        prev.filter((todo)=>todo.id!==id)
      )
  }

  const toggleTodo=(id:number)=>{
    setTodos((prev)=>
        prev.map((todo)=>
            todo.id===id?{
              ...todo,
              completed:!todo.completed
            }
            : todo
        )
    )
  }

  return(
    <div className="app-container">
      <h1 className="app-title">Todo App</h1>

      <TodoForm addTodo={addTodo}/>

      <TodoList todos={todos} deleteTodo={deleteTodo} toggleTodo={toggleTodo}/>
      
    </div>
  )
}

export default App;