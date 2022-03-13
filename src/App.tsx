import React, { useRef, useState } from "react";
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
import axios, { AxiosResponse } from "axios";
import {
  GoogleLogin,
  GoogleLoginResponse,
  GoogleLoginResponseOffline,
  GoogleLogout,
} from "react-google-login";
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

type User = {
  name: string;
  email: string;
  image: string;
};

function App() {
  const ClientId = process.env.REACT_APP_CLIENT_ID!;
  const [items, setItems] = useState<Task[]>([]);
  const [task, setTask] = useState("");
  const [open, setOpen] = useState(false);
  const [update, setUpdate] = useState(false);
  const [value, setValue] = useState(0);
  const [endPoint, setEndPoint] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [user, setUser] = useState<User>({ name: "", email: "", image: "" });
  const titleRef = useRef<HTMLInputElement>(null);

  const createEndPoint = () => {
    let url = "";
    if (window.location.hostname.includes("localhost")) {
      url = "http://localhost:8080/";
    } else {
      url = "https://shielded-earth-14324.herokuapp.com/";
    }

    return url;
  };

  const onLogoutSuccess = () => {
    const url = createEndPoint();
    axios.post(`${url}logout`, 22).catch((err) => new Error(err));
  };

  const onSuccess = async (
    res: GoogleLoginResponse | GoogleLoginResponseOffline
  ) => {
    if ("accessToken" in res) {
      const userInfo: User = {
        name: res.profileObj.name,
        email: res.profileObj.email,
        image: res.profileObj.imageUrl,
      };

      setAccessToken(res.accessToken);
      sessionStorage.token = res.accessToken;
      setUser(userInfo);

      const url = createEndPoint();
      setEndPoint(url);
      axios
        .post(`${url}login`, userInfo)
        .then((r: AxiosResponse<Tasks>) => {
          setItems(r.data.items);
        })
        .catch((err) => new Error(err));
    }
  };

  const onFailure = (res: any) => {
    // eslint-disable-next-line no-alert
    alert(JSON.stringify(res));
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

  return (
    <Box className="App" sx={{ p: 1 }}>
      {accessToken === "" ? (
        <GoogleLogin
          clientId={ClientId}
          buttonText="Login"
          onSuccess={onSuccess}
          onFailure={onFailure}
          scope="openid"
          cookiePolicy="single_host_origin"
          isSignedIn
        />
      ) : (
        user.email
      )}
      <GoogleLogout
        clientId={ClientId}
        buttonText="Logout"
        onLogoutSuccess={onLogoutSuccess}
      />
      <CreateField updateItem={updateItem} />
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
