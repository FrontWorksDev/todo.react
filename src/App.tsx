import React, { useRef, useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  TextField,
} from "@mui/material";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import CreateField from "./components/CreateField";
import TaskList from "./components/TaskList";

type Task = {
  ID: number;
  slug: string;
  title: string;
  completed: boolean;
  CreatedAt?: string;
  UpdatedAt?: string;
  DeletedAt?: string | null;
};

type Tasks = {
  items: Task[];
};

type Response = {
  session: string;
};

function App() {
  const { loginWithRedirect, logout, isAuthenticated, isLoading, user } =
    useAuth0();
  // const ClientId = process.env.REACT_APP_CLIENT_ID!;
  const [items, setItems] = useState<Task[]>([]);
  const [task, setTask] = useState("");
  const [open, setOpen] = useState(false);
  const [update, setUpdate] = useState(false);
  const [value, setValue] = useState(0);
  const [endPoint, setEndPoint] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [session, setSession] = useState("");
  // const [user, setUser] = useState<User>({ name: "", email: "", image: "" });
  const titleRef = useRef<HTMLInputElement>(null);
  const createEndPoint = () => {
    let url = "";
    if (window.location.hostname.includes("localhost")) {
      url = "http://localhost:8080/";
    } else {
      url = "https://shielded-earth-14324.herokuapp.com/";
    }

    setEndPoint(url);
    return url;
  };

  const handleSubmitUpdate = async (
    editedTitle: string,
    e?: React.KeyboardEvent
  ) => {
    if (e && e.code !== "Enter") {
      return;
    }
    const updateItem = items.map((item) =>
      item.ID === value ? Object.assign(item, { title: editedTitle }) : item
    );
    setItems(updateItem);
    await axios.put(`${endPoint}task/v1/update/${value}`, {
      title: editedTitle,
    });
    setUpdate(false);
  };

  const handleDelete = (id: number) => {
    setOpen(true);
    setValue(id);
  };

  const handleCancel = () => {
    setOpen(false);
    setUpdate(false);
  };

  const handleOk = async () => {
    const deletedItems = items.filter((item) => item.ID !== value);
    setItems(deletedItems);
    await axios
      .delete(`${endPoint}task/v1/delete/${value}`)
      .catch((err) => new Error(err));
    setOpen(false);
  };

  const handleUpdate = (id: number, title: string) => {
    setUpdate(true);
    setTask(title);
    setValue(id);
  };

  const handleComplete = async (id: number) => {
    setValue(id);

    const updateItem = items.map((item) =>
      item.ID === id ? Object.assign(item, { completed: true }) : item
    );
    setItems(updateItem);
    await axios.put(`${endPoint}task/v1/update/${id}`, {
      completed: true,
    });
  };

  const updateItem = (newItem: Task): void => {
    setItems([...items, newItem]);
  };

  const clickCreate = async () => {
    await axios.post(`${endPoint}user/v1/signup`, {
      username,
      email,
      password,
    });
  };
  const clickLogin = async () => {
    await axios
      .post(`${endPoint}user/v1/login`, {
        username: "*",
        email,
        password,
      })
      .then((res: AxiosResponse<Response>) => {
        setSession(res.data.session);
      });
  };

  const clickLogout = () => {};

  useEffect(() => {
    const url = createEndPoint();
    setEndPoint(url);
    const options: AxiosRequestConfig = {
      url: `${url}task/v1/list/${user?.sub}`,
      method: "POST",
    };

    axios(options).then((res: AxiosResponse<Tasks>) => {
      const data = res.data.items;
      setItems(data);
    });
  }, [user?.sub]);

  if (isLoading) {
    return <div>Loading ...</div>;
  }

  return (
    <Box className="App" sx={{ p: 1 }}>
      {!isAuthenticated ? (
        <Button variant="contained" onClick={() => loginWithRedirect()}>
          Login
        </Button>
      ) : (
        <Button
          variant="contained"
          onClick={() => logout({ returnTo: window.location.origin })}
        >
          Logout
        </Button>
      )}

      <TextField
        label="username"
        variant="outlined"
        name="username"
        onChange={(e) => setUsername(e.target.value)}
      />
      <TextField
        label="email"
        variant="outlined"
        name="email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        label="password"
        variant="outlined"
        name="password"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button variant="contained" onClick={() => clickCreate()}>
        Create
      </Button>
      {session === "" ? (
        <Button variant="contained" onClick={() => clickLogin()}>
          Login
        </Button>
      ) : (
        <Button variant="contained" onClick={() => clickLogout()}>
          Logout
        </Button>
      )}
      <CreateField updateItem={updateItem} userId={user?.sub!} />
      <List>
        {items.map(({ slug, title, ID, completed }) => (
          <TaskList
            key={slug}
            handleDelete={handleDelete}
            handleUpdate={handleUpdate}
            handleComplete={handleComplete}
            ID={ID}
            title={title}
            checked={completed}
          />
        ))}
      </List>
      <Dialog
        open={update}
        sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 435 } }}
        maxWidth="xs"
        onClose={handleCancel}
      >
        <DialogTitle>Update</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Title"
            fullWidth
            variant="standard"
            defaultValue={task}
            inputRef={titleRef}
            onKeyPress={(e) => handleSubmitUpdate(titleRef.current!.value, e)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleCancel()} color="error">
            Cancel
          </Button>
          <Button onClick={() => handleSubmitUpdate(titleRef.current!.value)}>
            Update
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={open}
        sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 435 } }}
        maxWidth="xs"
      >
        <DialogTitle>Do you want to delete the data?</DialogTitle>

        <DialogActions>
          <Button onClick={() => handleCancel()} color="error">
            No
          </Button>
          <Button onClick={() => handleOk()}>Yes</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default App;
