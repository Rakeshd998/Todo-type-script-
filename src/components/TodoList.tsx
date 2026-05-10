import TodoItem from "./TodoItem";
import type { Todo } from "../types/todo.types";    

interface TodoListProps{
    todos:Todo[];
    deleteTodo:(id:number)=>void;
    toggleTodo:(id:number)=>void;
}

const TodoList=({todos,deleteTodo,toggleTodo}:TodoListProps)=>{
    if (todos.length === 0) {
        return (
            <div className="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
                <p>You're all caught up!</p>
            </div>
        );
    }

    return(
        <div className="todo-list">
            {todos.map((todo)=>(
                <TodoItem
                    key={todo.id}
                    todo={todo}
                    deleteTodo={deleteTodo}
                    toggleTodo={toggleTodo}
                />
            ))}
        </div>
    )
}

export default TodoList