import { useState } from "react";

interface TodoFormProps{
    addTodo:(text:string)=>void
}

const TodoForm=({addTodo}:TodoFormProps)=>{
    const [text,setText]=useState("")

    const handleSubmit=(e: React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        
        if(!text.trim()) return;
         addTodo(text);
         setText("")
    }

    return(
        <form className="todo-form" onSubmit={handleSubmit}>
            <input 
                className="todo-input"
                type="text"
                placeholder="What needs to be done?"
                value={text}
                onChange={(e)=>setText(e.target.value)}
            />
            <button className="todo-add-btn" type="submit" aria-label="Add Todo">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
            </button>
        </form>
    )
}

export default TodoForm