import {useEffect, useState, useRef, usePrevious} from "react";

function Todo(props) {
    const [isEditing, setEditing] = useState(false);
    const [newName, setNewName] = useState("");
    const [newPriority, setNewPriority] = useState(0);
    const editFieldRef = useRef(null);
    const editPrioRef = useRef(null);
    const editButtonRef = useRef(null);
    const wasEditing = usePrevious(isEditing);

    useEffect(() => {
        if (!wasEditing && isEditing) {
            editFieldRef.current.focus();
        } else if (wasEditing && !isEditing) {
            editButtonRef.current.focus();
        }
    }, [wasEditing, isEditing]);

    function handleChange(e) {
        setNewName(e.target.value);
    }
    function handlePrio(e) {
        setNewPriority(parseInt(e.target.value) || 0);
    }
    function handleSubmit(e) {
        e.preventDefault();
        props.editTask(props.id, newName, newPriority);
        setNewName("");
        setNewPriority(0);
        setEditing(false);
    }

    function usePrevious(value) {
        const ref = useRef();
        useEffect(() => {
            ref.current = value;
        });
        return ref.current;
    }

    const editingTemplate = (
    <form className="stack-small" onSubmit={handleSubmit}>        
        <div className="form-group">
            <label className="todo-label" htmlFor={props.id}>
                New name for {props.name}
            </label>
            <input
                id={props.id}
                className="todo-text"
                type="text"
                value={newName}
                onChange={handleChange}
                ref={editFieldRef}
            />              
            <label className="todo-label" htmlFor={props.id + "-priority"}>
                Priority:
            </label>
            <input
                id={props.id + "-priority"}
                className="todo-text"
                type="number"
                value={newPriority}
                onChange={handlePrio}
                ref={editPrioRef}
            />        
        </div>
        <div className="btn-group">
        <button
            type="button"
            className="btn todo-cancel"
            onClick={() => setEditing(false)}>
            Cancel
            <span className="visually-hidden">renaming {props.name}</span>
        </button>
        <button type="submit" className="btn btn__primary todo-edit">
            Save
            <span className="visually-hidden">new name for {props.name}</span>
        </button>
        </div>
    </form>
    );

    const updateEditValues = () => {
        setNewName(props.name);
        setNewPriority(props.priority);
        setEditing(true);
    }

    const viewTemplate = (
    <div className="stack-small">
        <div className="c-cb">
        <input
            id={props.id}
            type="checkbox"
            defaultChecked={props.completed}
            onChange={() => props.toggleTaskCompleted(props.id)}
        />
        <label className="todo-label" htmlFor={props.id}>
            {props.name}
        </label>
        <label htmlFor={props.id + "-priority"}>
            Priority:
        </label>
        <input
            id={props.id + "-priority"}
            type="number"
            defaultChecked={props.priority}
            disabled
            value={props.priority}
        />
        </div>
        <div className="btn-group">
        <button 
            type="button" 
            className="btn" 
            onClick={updateEditValues}
            ref={editButtonRef}>
            Edit <span className="visually-hidden">{props.name}</span>
        </button>
        <button
            type="button"
            className="btn btn__danger"
            onClick={() => props.deleteTask(props.id)}>
            Delete <span className="visually-hidden">{props.name}</span>
        </button>
        </div>
    </div>
);
    
    return <li className="todo">{isEditing ? editingTemplate : viewTemplate}</li>;
}

export default Todo;