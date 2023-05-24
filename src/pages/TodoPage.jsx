import { Footer, Header, TodoCollection, TodoInput } from 'components';
import { useState, useEffect } from 'react';
import { getTodos, createTodo, patchTodo, deleteTodo } from '../api/todos';
import {checkPermission} from 'api/auth'
import { useNavigate } from 'react-router-dom';



const TodoPage = () => {
  const [inputValue, setInputValue] = useState('')
  const [todos, setTodos] = useState([])
  const navigate = useNavigate()

  const handleChange = (value) => {
    setInputValue(value)
  }

  const handleAddTodo = async () => {
    if (inputValue.length === 0) {
      return
    }
    try{
      const data = await createTodo({
        title: inputValue,
        isDone: false,
      });
      setTodos((prevTodos) => {
        return [
          ...prevTodos,
          {
            id: data.id,
            title: data.title,
            isDone: data.isDone,
            isEdit: false,
          },
        ];
      });
      setInputValue('');
    }catch(err) {
      console.error(err)
    } 
  }

  const handleKeyDown = async () => {
    if (inputValue.length === 0) {
      return;
    }
    try{
      const data = await createTodo({
        title: inputValue,
        isDone: false,
      });
      setTodos((prevTodos) => {
        return [
          ...prevTodos,
          {
            id: data.id,
            title: data.title,
            isDone: data.isDone,
            isEdit: false,
          },
        ];
      });
      setInputValue('');
    }catch(err) {
      console.error(err)
    } 
  }

  const handleToggleDone = async(id) => {
    try {
      const currentTodo = todos.find((todo) => todo.id === id)
    await patchTodo ({
      id,
      isDone: !currentTodo.isDone
    })
    setTodos((prevTodos) => {
      return prevTodos.map((todo) => {
        if(todo.id === id) {
          return {
            ...todo,
            isDone: !todo.isDone
          }
        }
        return todo;
      });
    })
    } catch (error) {
      console.error(error)
    }
    
  }

  const handleChangeMode = ({ id, isEdit }) => {
    setTodos((prevTodos) => {
      return prevTodos.map((todo) => {
        if (todo.id === id) {
          return {
            ...todo,
            isEdit,
          };
        }
        return {
          ...todo,
          isEdit: false,
        };
      });
    });
  };

  const handleSave = async ({id, title}) => {
    try {
      await patchTodo ({
      id,
      title
    })
    setTodos((prevTodos) => {
      return prevTodos.map((todo) => {
        if (todo.id === id) {
          return {
            ...todo,
            id,
            title,
            isEdit: false,
          };
        }
        return todo
      })
    })
    } catch (err) {
      console.error(err)
    }
    
  }

  const handleDelete = async ({id}) => {
    try {
      await deleteTodo(id)
    
    setTodos((prevTodos) => {
      return prevTodos.filter((todo) => {
        return todo.id !== id
      })
    })
    } catch (err) {
      console.error(err)
    }
    
  }

  useEffect(() => {
    const getTodosAsync = async () => {
      try{
        const todos = await getTodos()
        setTodos(todos.map((todo) => ({...todo, isEdit:false})))

      } catch (err) {
        console.error(err)
      }
      
    }
    getTodosAsync()
  },[])

    useEffect(() => {
      const checkTokenIsValid = async () => {
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
          navigate('/login')
        }
        const result = await checkPermission(authToken);

        if (!result) {
          navigate('/login');
        }
      };
      checkTokenIsValid();
    }, [navigate]);

  return (
    <div>
      TodoPage
      <Header />
      <TodoInput
        inputValue={inputValue}
        onChange={handleChange}
        onAddTodo={handleAddTodo}
        onKeyDown={handleKeyDown}
      />
      <TodoCollection
        todos={todos}
        onToggleDone={handleToggleDone}
        onChangeMode={handleChangeMode}
        onSave={handleSave}
        onDelete={handleDelete}
      />
      <Footer onCount={todos.length}/>
    </div>
  );
};

export default TodoPage;
